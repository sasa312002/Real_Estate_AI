from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Literal
import os
import stripe

from app.core.config import settings
from app.api.auth import get_current_user, PLAN_LIMITS
from app.models.mongodb_models import User


router = APIRouter(prefix="/payments", tags=["payments"])
security = HTTPBearer()


class CheckoutRequest(BaseModel):
    plan: Literal["standard", "premium"]


class CheckoutResponse(BaseModel):
    checkout_url: str


def _get_stripe_client() -> stripe.StripeClient:
    secret_key = settings.stripe_secret_key or os.getenv("STRIPE_SECRET_KEY", "")
    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe is not configured"
        )
    stripe.api_key = secret_key
    return stripe


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    payload: CheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    if payload.plan not in ("standard", "premium"):
        raise HTTPException(status_code=400, detail="Invalid plan")

    stripe_client = _get_stripe_client()

    price_id = (
        settings.stripe_price_standard if payload.plan == "standard" else settings.stripe_price_premium
    )

    # Determine success/cancel URLs (fallback to referer host)
    referer = request.headers.get("origin") or request.headers.get("referer") or "http://localhost:5173"
    success_url = f"{referer}/plans?success=true&plan={payload.plan}"
    cancel_url = f"{referer}/plans?canceled=true"

    try:
        line_items = []
        if price_id:
            line_items = [{
                "price": price_id,
                "quantity": 1,
            }]
        else:
            # Fallback: create inline price data using known LKR amounts
            # Default LKR prices must match /auth/plans
            plan_to_amount_lkr = {
                "standard": 2500,
                "premium": 15000,
            }
            amount_lkr = plan_to_amount_lkr[payload.plan]
            # Stripe expects the amount in the smallest currency unit
            unit_amount = int(amount_lkr * 100)
            line_items = [{
                "price_data": {
                    "currency": "lkr",
                    "product_data": {"name": f"{payload.plan.capitalize()} Plan"},
                    "unit_amount": unit_amount,
                },
                "quantity": 1,
            }]

        session = stripe_client.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=line_items,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "plan": payload.plan,
            },
        )
        return CheckoutResponse(checkout_url=session.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


