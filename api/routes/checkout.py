import os
from fastapi import APIRouter, Request, HTTPException
import stripe

router = APIRouter(prefix="/api/checkout", tags=["checkout"])
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("")
async def create_checkout(request: Request, payload: dict):
    price_id = payload.get("priceId") or os.getenv("STRIPE_PRICE_ID")
    if not stripe.api_key or not price_id:
        raise HTTPException(status_code=500, detail="Stripe config missing")

    origin = request.headers.get("origin") or "http://localhost:5173"
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        allow_promotion_codes=True,
        success_url=f"{origin}/?pay=success",
        cancel_url=f"{origin}/?pay=cancel",
    )
    return {"url": session.url}

