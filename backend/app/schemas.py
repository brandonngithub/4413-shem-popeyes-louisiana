from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models import OrderStatus, ProductCategory, UserRole

class LoginRequest(BaseModel):
    email: str
    password_hash: str

class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: Optional[UserRole] = UserRole.CUSTOMER
    shipping_street: Optional[str] = ""
    shipping_province: Optional[str] = ""
    shipping_country: Optional[str] = ""
    shipping_zip: Optional[str] = ""
    card_last4: Optional[str] = ""

class UserCreate(UserBase):
    password_hash: str

class UserPatch(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    shipping_street: Optional[str] = None
    shipping_province: Optional[str] = None
    shipping_country: Optional[str] = None
    shipping_zip: Optional[str] = None
    card_last4: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[ProductCategory] = ProductCategory.OTHER
    brand: Optional[str] = ""
    model: Optional[str] = ""
    image: Optional[str] = ""
    stock: Optional[int] = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float

class OrderItem(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int
    total_price: float
    status: Optional[OrderStatus] = OrderStatus.PLACED

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class Order(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
