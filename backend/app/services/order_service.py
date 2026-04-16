from typing import Optional

from fastapi import HTTPException

from app import models, schemas
from app.dao.order_dao import OrderDAO
from app.dao.product_dao import ProductDAO
from app.dao.user_dao import UserDAO
from app.services.payment_service import LineItem, StripePaymentProvider


class OrderService:
    def __init__(self, user_dao: UserDAO, product_dao: ProductDAO, order_dao: OrderDAO):
        self.user_dao = user_dao
        self.product_dao = product_dao
        self.order_dao = order_dao

    def _price_cart(
        self, order: schemas.OrderCreate
    ) -> tuple[list[tuple[models.Product, int, float]], float]:
        lines: list[tuple[models.Product, int, float]] = []
        total = 0.0
        for item in order.items:
            product = self.product_dao.get(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=404, detail=f"Product {item.product_id} not found"
                )
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be at least 1")
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"{product.name}: only {product.stock} in stock (requested {item.quantity}).",
                )
            line_price = float(product.price)
            lines.append((product, item.quantity, line_price))
            total += line_price * item.quantity
        return lines, total

    def create_order(
        self,
        order: schemas.OrderCreate,
        payment_provider: StripePaymentProvider,
    ):
        user = self.user_dao.get(order.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        lines, total = self._price_cart(order)

        provider_lines = [
            LineItem(product_id=p.id, quantity=q, unit_price=price)
            for p, q, price in lines
        ]
        result = payment_provider.authorize(
            user_id=order.user_id,
            lines=provider_lines,
            payment_intent_id=order.payment_intent_id,
        )
        if not result.approved:
            raise HTTPException(
                status_code=402,
                detail=result.reason or "Credit Card Authorization Failed.",
            )

        db_order = self.order_dao.create(
            user_id=order.user_id,
            status=order.status or models.OrderStatus.PLACED,
            total_price=total,
        )
        db_order.payment_intent_id = result.payment_intent_id
        db_order.payment_status = result.payment_status or "succeeded"

        ship = result.shipping or {}
        if not ship.get("line1"):
            raise HTTPException(
                status_code=400,
                detail="Shipping address is required. Please fill in the address at checkout.",
            )
        db_order.ship_to_name = ship.get("name", "")
        db_order.ship_to_line1 = ship.get("line1", "")
        db_order.ship_to_line2 = ship.get("line2", "")
        db_order.ship_to_city = ship.get("city", "")
        db_order.ship_to_state = ship.get("state", "")
        db_order.ship_to_postal_code = ship.get("postal_code", "")
        db_order.ship_to_country = ship.get("country", "")

        for product, qty, line_price in lines:
            self.order_dao.add_item(db_order.id, product.id, qty, line_price)
            product.stock -= qty

        self.order_dao.commit()
        return self.order_dao.refresh(db_order)

    def quote_total(self, items: list[schemas.OrderItemBase]) -> tuple[list[LineItem], float]:
        """Price a cart without creating an order. Used for PaymentIntent creation."""
        fake = schemas.OrderCreate(
            user_id=0, total_price=0, status=models.OrderStatus.PLACED, items=items
        )
        lines, total = self._price_cart(fake)
        provider_lines = [
            LineItem(product_id=p.id, quantity=q, unit_price=price)
            for p, q, price in lines
        ]
        return provider_lines, total
