from sqlalchemy.orm import Session, joinedload

from app import models


class OrderDAO:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100):
        orders = (
            self.db.query(models.Order)
            .options(joinedload(models.Order.items))
            .offset(skip)
            .limit(limit)
            .all()
        )
        # Filter out invalid items
        for order in orders:
            order.items = [item for item in order.items if item.product_id is not None]
        return orders

    def get(self, order_id: int):
        order = (
            self.db.query(models.Order)
            .options(joinedload(models.Order.items))
            .filter(models.Order.id == order_id)
            .first()
        )
        if order:
            order.items = [item for item in order.items if item.product_id is not None]
        return order

    def list_for_user(self, user_id: int):
        orders = (
            self.db.query(models.Order)
            .options(joinedload(models.Order.items))
            .filter(models.Order.user_id == user_id)
            .all()
        )
        # Filter out invalid items
        for order in orders:
            order.items = [item for item in order.items if item.product_id is not None]
        return orders

    def create(self, user_id: int, status, total_price: float):
        order = models.Order(user_id=user_id, status=status, total_price=total_price)
        self.db.add(order)
        self.db.flush()
        return order

    def add_item(self, order_id: int, product_id: int, quantity: int, price_at_purchase: float):
        self.db.add(
            models.OrderItem(
                order_id=order_id,
                product_id=product_id,
                quantity=quantity,
                price_at_purchase=price_at_purchase,
            )
        )

    def commit(self):
        self.db.commit()

    def refresh(self, order: models.Order):
        self.db.refresh(order)
        _ = order.items
        return order

    def update(self, order: models.Order, values: dict):
        for key, value in values.items():
            setattr(order, key, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def delete(self, order: models.Order):
        self.db.delete(order)
        self.db.commit()
