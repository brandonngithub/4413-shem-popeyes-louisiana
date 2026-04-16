from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class UserRole(enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

class OrderStatus(enum.Enum):
    PLACED = "placed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class ProductCategory(enum.Enum):
    FOOD = "food"
    ELECTRONIC = "electronic"
    ACCESSORIES = "accessory"
    CLOTHING = "clothing"
    BEVERAGE = "beverage"
    BOOK = "book"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    shipping_street = Column(String, default="")
    shipping_province = Column(String, default="")
    shipping_country = Column(String, default="")
    shipping_zip = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(Enum(ProductCategory), default=ProductCategory.OTHER)
    brand = Column(String, default="")
    model = Column(String, default="")
    image = Column(String, default="")
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("OrderItem", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Float)
    status = Column(Enum(OrderStatus), default=OrderStatus.PLACED)
    payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String, nullable=True, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_purchase = Column(Float)  # price at time of order

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")