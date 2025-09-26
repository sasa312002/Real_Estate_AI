from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
from app.api.auth import PLAN_LIMITS, get_current_user
from app.models.mongodb_models import User
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
        if session.payment_status == "paid":
            purchased_plan = (session.metadata or {}).get("plan")
            if purchased_plan in PLAN_LIMITS:
                # Upgrade the user now
                current_user.plan = purchased_plan
                await current_user.save()
                return VerifySessionResponse(success=True, plan=purchased_plan)
        return VerifySessionResponse(success=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to verify session: {str(e)}")


