"""Demo rows when the DB is empty (replace with real data via admin/API later)."""

import bcrypt

from app import models
from app.database import SessionLocal


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(models.User).first() is not None:
            return

        demo_hash = _hash_password("demo")
        customer = models.User(
            email="customer@demo.com",
            password_hash=demo_hash,
            first_name="Alex",
            last_name="Buyer",
            role=models.UserRole.CUSTOMER,
            shipping_street="567 Yonge St",
            shipping_province="ON",
            shipping_country="Canada",
            shipping_zip="K1E 6T5",
            card_last4="4242",
        )
        admin = models.User(
            email="admin@demo.com",
            password_hash=demo_hash,
            first_name="Store",
            last_name="Admin",
            role=models.UserRole.ADMIN,
            shipping_street="1 Main St",
            shipping_province="ON",
            shipping_country="Canada",
            shipping_zip="M5V 2T6",
            card_last4="0000",
        )
        db.add_all([customer, admin])
        db.flush()

        p_book = models.Product(
            name="The Little Prince",
            description="A classic novella; illustrated edition.",
            category=models.ProductCategory.BOOK,
            brand="Penguin",
            model="Hardcover",
            price=20,
            stock=100,
            image="https://picsum.photos/seed/b001/320/320",
        )
        p_ipad = models.Product(
            name="iPad",
            description="Tablet for browsing, reading, and light work.",
            category=models.ProductCategory.ELECTRONIC,
            brand="Apple",
            model="Air",
            price=500,
            stock=8,
            image="https://picsum.photos/seed/c001/320/320",
        )
        p_laptop = models.Product(
            name="Laptop 15",
            description="15-inch laptop for everyday use.",
            category=models.ProductCategory.ELECTRONIC,
            brand="Dell",
            model="Inspiron",
            price=1500,
            stock=3,
            image="https://picsum.photos/seed/d001/320/320",
        )
        db.add_all([p_book, p_ipad, p_laptop])
        db.flush()

        order = models.Order(
            user_id=customer.id,
            total_price=20,
            status=models.OrderStatus.PLACED,
        )
        db.add(order)
        db.flush()
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=p_book.id,
                quantity=1,
                price_at_purchase=20,
            )
        )
        p_book.stock -= 1

        db.commit()
    finally:
        db.close()
