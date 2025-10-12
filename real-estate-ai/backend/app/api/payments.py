from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.config import settings
from app.api.auth import PLAN_LIMITS, get_current_user
from app.models.mongodb_models import User, Payment
import stripe


router = APIRouter(prefix="/payments", tags=["payments"])


class CreateCheckoutRequest(BaseModel):
    plan: str  # 'standard' | 'premium'


class CreateCheckoutResponse(BaseModel):
    id: str
    url: str


class VerifySessionRequest(BaseModel):
    session_id: str


class VerifySessionResponse(BaseModel):
    success: bool
    plan: Optional[str] = None


class PaymentHistoryResponse(BaseModel):
    id: str
    plan: str
    amount: int
    currency: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None


class PaymentHistoryListResponse(BaseModel):
    payments: List[PaymentHistoryResponse]
    total: int


class SubscriptionStatusResponse(BaseModel):
    can_purchase_new_plan: bool
    current_plan: str
    analyses_used: int
    analyses_limit: int
    analyses_remaining: int
    is_subscription_active: bool
    subscription_start_date: Optional[datetime] = None


def _get_price_in_cents(plan: str) -> int:
    # Prices from /auth/plans are LKR, Stripe expects amount in cents of currency.
    # Assuming LKR has no subunit (actually LKR has cents), we treat given price as whole and multiply by 100.
    if plan == "standard":
        return 2500 * 100
    if plan == "premium":
        return 15000 * 100
    raise HTTPException(status_code=400, detail="Invalid plan for checkout")


@router.post("/create-checkout", response_model=CreateCheckoutResponse)
async def create_checkout_session(req: CreateCheckoutRequest, current_user: User = Depends(get_current_user)):
    plan = req.plan.lower()
    if plan not in ("standard", "premium"):
        raise HTTPException(status_code=400, detail="Only paid plans can be purchased")

    # Check if user can purchase a new plan
    if not current_user.can_purchase_plan(PLAN_LIMITS):
        limit = PLAN_LIMITS.get(current_user.plan, 0)
        remaining = max(limit - current_user.analyses_used, 0)
        raise HTTPException(
            status_code=400, 
            detail=f"You can only purchase a new plan after exhausting your current {current_user.plan} plan limit. You have {remaining} analyses remaining."
        )

    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    stripe.api_key = settings.stripe_secret_key

    try:
        amount = _get_price_in_cents(plan)
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "lkr",
                        "product_data": {"name": f"{plan.capitalize()} Plan"},
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }
            ],
            success_url=(settings.stripe_success_url or "http://localhost:3000/plans?success=true&session_id={CHECKOUT_SESSION_ID}"),
            cancel_url=(settings.stripe_cancel_url or "http://localhost:3000/plans?canceled=true"),
            metadata={
                "user_id": str(current_user.id),
                "plan": plan,
            },
        )
        
        # Create pending payment record
        payment = Payment(
            user_id=current_user.id,
            stripe_session_id=session.id,
            plan=plan,
            amount=amount,
            currency="lkr",
            status="pending",
            customer_email=current_user.email,
            metadata={"user_id": str(current_user.id), "plan": plan}
        )
        await payment.save()
        
        return CreateCheckoutResponse(id=session.id, url=session.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@router.post("/verify-session", response_model=VerifySessionResponse)
async def verify_session(req: VerifySessionRequest, current_user: User = Depends(get_current_user)):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured")
    stripe.api_key = settings.stripe_secret_key

    try:
        session = stripe.checkout.Session.retrieve(req.session_id)
        purchased_plan = (session.metadata or {}).get("plan")
        
        # Check if payment record already exists
        existing_payment = await Payment.find_one(Payment.stripe_session_id == req.session_id)
        
        if session.payment_status == "paid":
            if purchased_plan in PLAN_LIMITS:
                # Create or update payment record
                if existing_payment:
                    # Update existing payment record
                    existing_payment.status = "completed"
                    existing_payment.completed_at = datetime.utcnow()
                    existing_payment.updated_at = datetime.utcnow()
                    if session.payment_intent:
                        existing_payment.stripe_payment_intent_id = session.payment_intent
                    await existing_payment.save()
                else:
                    # Create new payment record
                    payment = Payment(
                        user_id=current_user.id,
                        stripe_session_id=req.session_id,
                        stripe_payment_intent_id=session.payment_intent,
                        plan=purchased_plan,
                        amount=_get_price_in_cents(purchased_plan),
                        currency="lkr",
                        status="completed",
                        customer_email=session.customer_email,
                        customer_name=session.customer_details.name if session.customer_details else None,
                        billing_address=session.customer_details.address if session.customer_details else None,
                        metadata=session.metadata,
                        completed_at=datetime.utcnow()
                    )
                    await payment.save()
                
                # Reset subscription for the new plan
                current_user.reset_subscription(purchased_plan, PLAN_LIMITS)
                await current_user.save()
                return VerifySessionResponse(success=True, plan=purchased_plan)
        else:
            # Payment failed or canceled
            if existing_payment:
                existing_payment.status = "failed" if session.payment_status == "failed" else "canceled"
                existing_payment.updated_at = datetime.utcnow()
                await existing_payment.save()
            else:
                # Create failed payment record
                payment = Payment(
                    user_id=current_user.id,
                    stripe_session_id=req.session_id,
                    stripe_payment_intent_id=session.payment_intent,
                    plan=purchased_plan,
                    amount=_get_price_in_cents(purchased_plan),
                    currency="lkr",
                    status="failed" if session.payment_status == "failed" else "canceled",
                    customer_email=session.customer_email,
                    customer_name=session.customer_details.name if session.customer_details else None,
                    billing_address=session.customer_details.address if session.customer_details else None,
                    metadata=session.metadata
                )
                await payment.save()
        
        return VerifySessionResponse(success=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to verify session: {str(e)}")


@router.get("/history", response_model=PaymentHistoryListResponse)
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """Get payment history for the current user"""
    try:
        # Get payments for the current user, ordered by creation date (newest first)
        payments = await Payment.find(
            Payment.user_id == current_user.id
        ).sort([("created_at", -1)]).skip(offset).limit(limit).to_list()
        
        # Get total count for pagination
        total_count = await Payment.find(Payment.user_id == current_user.id).count()
        
        # Convert to response format
        payment_responses = [
            PaymentHistoryResponse(
                id=str(payment.id),
                plan=payment.plan,
                amount=payment.amount,
                currency=payment.currency,
                status=payment.status,
                created_at=payment.created_at,
                completed_at=payment.completed_at
            )
            for payment in payments
        ]
        
        return PaymentHistoryListResponse(
            payments=payment_responses,
            total=total_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to retrieve payment history: {str(e)}")


@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get current subscription status and purchase eligibility"""
    try:
        limit = PLAN_LIMITS.get(current_user.plan, 0)
        can_purchase = current_user.can_purchase_plan(PLAN_LIMITS)
        
        return SubscriptionStatusResponse(
            can_purchase_new_plan=can_purchase,
            current_plan=current_user.plan,
            analyses_used=current_user.analyses_used,
            analyses_limit=limit,
            analyses_remaining=max(limit - current_user.analyses_used, 0),
            is_subscription_active=getattr(current_user, 'is_subscription_active', False),
            subscription_start_date=getattr(current_user, 'subscription_start_date', None)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to retrieve subscription status: {str(e)}")


