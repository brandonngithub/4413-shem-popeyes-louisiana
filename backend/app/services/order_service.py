from typing import Callable

from fastapi import HTTPException

from app import models, schemas
from app.dao.order_dao import OrderDAO
from app.dao.product_dao import ProductDAO
from app.dao.user_dao import UserDAO


class OrderService:
    def __init__(self, user_dao: UserDAO, product_dao: ProductDAO, order_dao: OrderDAO):
        self.user_dao = user_dao
        self.product_dao = product_dao
        self.order_dao = order_dao

    def create_order(self, order: schemas.OrderCreate, payment_ok: Callable[[int], bool]):
        user = self.user_dao.get(order.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        lines = []
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

        if not payment_ok(order.user_id):
            raise HTTPException(status_code=402, detail="Credit Card Authorization Failed.")

        db_order = self.order_dao.create(
            user_id=order.user_id,
            status=order.status or models.OrderStatus.PLACED,
            total_price=total,
        )
        for product, qty, line_price in lines:
            self.order_dao.add_item(db_order.id, product.id, qty, line_price)
            product.stock -= qty

        self.order_dao.commit()
        return self.order_dao.refresh(db_order)
