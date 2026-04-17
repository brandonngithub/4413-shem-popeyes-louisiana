"""Stripe payment provider.

The backend only authorizes orders whose PaymentIntent has been confirmed
client-side via Stripe Elements. The PaymentIntent is also re-validated
server-side (amount + metadata) to stop the client from spoofing totals or
replaying another user's intent.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from fastapi import HTTPException

from app.config import settings


@dataclass
class LineItem:
    """Internal representation of a cart line for pricing."""

    product_id: int
    quantity: int
    unit_price: float


@dataclass
class PaymentResult:
    approved: bool
    payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    reason: Optional[str] = None
    shipping: Dict[str, str] = field(default_factory=dict)


def _total_cents(lines: List[LineItem]) -> int:
    return sum(int(round(l.unit_price * 100)) * l.quantity for l in lines)


class StripePaymentProvider:
    """Creates and verifies Stripe PaymentIntents."""

    def __init__(self, secret_key: str, currency: str = "cad"):
        import stripe

        self._stripe = stripe
        self._stripe.api_key = secret_key
        self.currency = currency

    def create_intent(self, user_id: int, lines: List[LineItem]) -> dict:
        amount_cents = _total_cents(lines)
        if amount_cents <= 0:
            raise HTTPException(status_code=400, detail="Invalid order total.")
        intent = self._stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=self.currency,
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
            metadata={"user_id": str(user_id)},
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": amount_cents,
            "currency": self.currency,
        }

    def authorize(
        self,
        user_id: int,
        lines: List[LineItem],
        payment_intent_id: Optional[str],
    ) -> PaymentResult:
        if not payment_intent_id:
            return PaymentResult(
                approved=False,
                payment_status="failed",
                reason="Missing payment_intent_id.",
            )
        try:
            intent = self._stripe.PaymentIntent.retrieve(payment_intent_id)
        except Exception as e:
            return PaymentResult(
                approved=False,
                payment_intent_id=payment_intent_id,
                payment_status="failed",
                reason=f"Could not verify payment: {e}",
            )

        if intent.amount != _total_cents(lines):
            return PaymentResult(
                approved=False,
                payment_intent_id=payment_intent_id,
                payment_status="failed",
                reason="Payment amount does not match cart total.",
            )
        meta_user = getattr(intent.metadata, "user_id", None)
        if meta_user is not None and str(meta_user) != str(user_id):
            return PaymentResult(
                approved=False,
                payment_intent_id=payment_intent_id,
                payment_status="failed",
                reason="Payment does not belong to this user.",
            )

        if intent.status == "succeeded":
            return PaymentResult(
                approved=True,
                payment_intent_id=payment_intent_id,
                payment_status="succeeded",
                shipping=_extract_shipping(intent),
            )
        return PaymentResult(
            approved=False,
            payment_intent_id=payment_intent_id,
            payment_status=intent.status,
            reason="Credit Card Authorization Failed.",
        )


def _extract_shipping(intent) -> Dict[str, str]:
    """Normalize Stripe's PaymentIntent.shipping into our ship_to_* fields."""
    shipping = getattr(intent, "shipping", None)
    if not shipping:
        return {}
    addr = getattr(shipping, "address", None) or {}

    def g(obj, key: str) -> str:
        if obj is None:
            return ""
        if isinstance(obj, dict):
            return obj.get(key) or ""
        return getattr(obj, key, "") or ""

    return {
        "name": g(shipping, "name"),
        "line1": g(addr, "line1"),
        "line2": g(addr, "line2"),
        "city": g(addr, "city"),
        "state": g(addr, "state"),
        "postal_code": g(addr, "postal_code"),
        "country": g(addr, "country"),
    }


_provider: Optional[StripePaymentProvider] = None


def get_payment_provider() -> StripePaymentProvider:
    """Lazy singleton. Raises 503 if Stripe isn't configured."""
    global _provider
    if _provider is None:
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=503,
                detail="Payments are not configured on the server.",
            )
        _provider = StripePaymentProvider(
            settings.STRIPE_SECRET_KEY, settings.STRIPE_CURRENCY
        )
    return _provider
