
from typing import List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt

from app import models, schemas
from app.config import settings
from app.dao.order_dao import OrderDAO
from app.dao.product_dao import ProductDAO
from app.dao.user_dao import UserDAO
from app.database import Base, engine, get_db
from app.seed import seed_if_empty
from app.services.order_service import OrderService


def _cors_allow_origins() -> List[str]:
    local = ["http://localhost:5173", "http://127.0.0.1:5173"]
    extra = [
        o.strip().rstrip("/")
        for o in settings.CORS_ORIGIN.split(",")
        if o.strip()
    ]
    # Preserve order, drop duplicates
    seen: set[str] = set()
    out: List[str] = []
    for o in local + extra:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return out


app = FastAPI(title="E-Commerce API")


def _cors_origin_regex() -> Optional[str]:
    explicit = (settings.CORS_ORIGIN_REGEX or "").strip()
    if explicit:
        return explicit
    if settings.CORS_ALLOW_VERCEL_REGEX:
        return r"https://.*\.vercel\.app$"
    return None


_cors_regex = _cors_origin_regex()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_origin_regex=_cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
seed_if_empty()

_checkout_attempts = {}


def _current_user(
    x_user_id: Optional[int] = Header(default=None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if x_user_id is None:
        return None
    return db.query(models.User).filter(models.User.id == x_user_id).first()


def _require_login(actor: Optional[models.User]) -> models.User:
    if actor is None:
        raise HTTPException(status_code=401, detail="Sign in required")
    return actor


def _require_admin(actor: Optional[models.User]) -> models.User:
    actor = _require_login(actor)
    if actor.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return actor


def _require_self_or_admin(actor: Optional[models.User], user_id: int) -> models.User:
    actor = _require_login(actor)
    if actor.role != models.UserRole.ADMIN and actor.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return actor

def _payment_ok(user) -> bool:
    global _checkout_attempts
    if user not in _checkout_attempts:
        _checkout_attempts[user] = 0
    _checkout_attempts[user] += 1
    return _checkout_attempts[user] % 3 != 0

@app.get("/")
def read_root():
    return {"message": "Healthy"}

@app.post("/auth/login", response_model=schemas.User)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    users = UserDAO(db)
    u = users.get_by_email(body.email)
    if not u or not bcrypt.checkpw(body.password.encode('utf-8'), u.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return u

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    users = UserDAO(db)
    db_user = users.get_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_data = user.model_dump(exclude={'password'})
    user_data['password_hash'] = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return users.create(user_data)


@app.get("/users/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    users = UserDAO(db)
    return users.list(skip=skip, limit=limit)


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_self_or_admin(actor, user_id)
    users = UserDAO(db)
    db_user = users.get(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.patch("/users/{user_id}", response_model=schemas.User)
def patch_user(
    user_id: int,
    patch: schemas.UserPatch,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_self_or_admin(actor, user_id)
    users = UserDAO(db)
    db_user = users.get(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return users.patch(db_user, patch.model_dump(exclude_unset=True))


@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    users = UserDAO(db)
    db_user = users.get(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return users.patch(db_user, user.model_dump())

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    users = UserDAO(db)
    db_user = users.get(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    users.delete(db_user)
    return {"message": "User deleted"}

# Product endpoints
@app.post("/products/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    products = ProductDAO(db)
    return products.create(product.model_dump())


@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = ProductDAO(db)
    return products.list(skip=skip, limit=limit)


@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    products = ProductDAO(db)
    db_product = products.get(product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    products = ProductDAO(db)
    db_product = products.get(product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return products.update(db_product, product.model_dump())

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    products = ProductDAO(db)
    db_product = products.get(product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    products.delete(db_product)
    return {"message": "Product deleted"}

# Order endpoints
@app.post("/orders/", response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_self_or_admin(actor, order.user_id)
    service = OrderService(UserDAO(db), ProductDAO(db), OrderDAO(db))
    return service.create_order(order, _payment_ok)


@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    orders = OrderDAO(db)
    return orders.list(skip=skip, limit=limit)


@app.get("/orders/{order_id}", response_model=schemas.Order)
def read_order(
    order_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    actor = _require_login(actor)
    orders = OrderDAO(db)
    db_order = orders.get(order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if actor.role != models.UserRole.ADMIN and db_order.user_id != actor.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return db_order

@app.get("/users/{user_id}/orders", response_model=List[schemas.Order])
def read_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_self_or_admin(actor, user_id)
    orders = OrderDAO(db)
    return orders.list_for_user(user_id)

@app.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(
    order_id: int,
    order: schemas.OrderBase,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    orders = OrderDAO(db)
    db_order = orders.get(order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders.update(db_order, order.model_dump())

@app.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(_current_user),
):
    _require_admin(actor)
    orders = OrderDAO(db)
    db_order = orders.get(order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    orders.delete(db_order)
    return {"message": "Order deleted"}
