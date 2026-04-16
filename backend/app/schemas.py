from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models import OrderStatus, ProductCategory, UserRole

class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: Optional[UserRole] = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str

class UserPatch(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

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
    quantity: int = Field(ge=1)
    price_at_purchase: float = Field(ge=0)

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
    payment_intent_id: Optional[str] = None

class Order(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItem]
    payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    ship_to_name: Optional[str] = ""
    ship_to_line1: Optional[str] = ""
    ship_to_line2: Optional[str] = ""
    ship_to_city: Optional[str] = ""
    ship_to_state: Optional[str] = ""
    ship_to_postal_code: Optional[str] = ""
    ship_to_country: Optional[str] = ""

    class Config:
        from_attributes = True


class PaymentConfig(BaseModel):
    publishable_key: str
    currency: str = "cad"


class PaymentIntentRequest(BaseModel):
    items: List[OrderItemBase]


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str
