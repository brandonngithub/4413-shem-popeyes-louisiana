
from app.database import SessionLocal
from typing import List, Tuple

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
import bcrypt

from app import models, schemas
from app.config import settings
from app.database import Base, engine, get_db
from app.seed import seed_if_empty


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


def _cors_origin_regex() -> str | None:
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
    u = db.query(models.User).filter(models.User.email == body.email).first()
    if not u or not bcrypt.checkpw(body.password.encode('utf-8'), u.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return u

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_data = user.model_dump(exclude={'password'})
    user_data['password_hash'] = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db_user = models.User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.patch("/users/{user_id}", response_model=schemas.User)
def patch_user(
    user_id: int, patch: schemas.UserPatch, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, val in patch.model_dump(exclude_unset=True).items():
        setattr(db_user, key, val)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.model_dump().items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

# Product endpoints
@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()


@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# Order endpoints
@app.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == order.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    lines: List[Tuple[models.Product, int, float]] = []
    total = 0.0
    for item in order.items:
        p = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if not p:
            raise HTTPException(
                status_code=404, detail=f"Product {item.product_id} not found"
            )
        if p.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"{p.name}: only {p.stock} in stock (requested {item.quantity}).",
            )
        line_price = float(p.price)
        total += line_price * item.quantity
        lines.append((p, item.quantity, line_price))

    if not _payment_ok(order.user_id):
        raise HTTPException(
            status_code=402, detail="Credit Card Authorization Failed."
        )

    db_order = models.Order(
        user_id=order.user_id,
        total_price=total,
        status=order.status or models.OrderStatus.PLACED,
    )
    db.add(db_order)
    db.flush()
    for p, qty, price in lines:
        db.add(
            models.OrderItem(
                order_id=db_order.id,
                product_id=p.id,
                quantity=qty,
                price_at_purchase=price,
            )
        )
        p.stock -= qty
    db.commit()
    db.refresh(db_order)
    _ = db_order.items
    return db_order


@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .offset(skip)
        .limit(limit)
        .all()
    )


@app.get("/orders/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.get("/users/{user_id}/orders", response_model=List[schemas.Order])
def read_user_orders(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.user_id == user_id)
        .all()
    )

@app.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderBase, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in order.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted"}
