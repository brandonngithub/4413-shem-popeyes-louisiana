import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _login(email: str, password: str):
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()


def test_admin_only_product_create_blocked_for_customer():
    customer = _login("customer@demo.com", "demo")
    res = client.post(
        "/products/",
        headers={"X-User-Id": str(customer["id"])},
        json={
            "name": "Blocked product",
            "description": "should fail",
            "price": 10,
            "category": "book",
            "brand": "demo",
            "model": "m1",
            "image": "",
            "stock": 1,
        },
    )
    assert res.status_code == 403


def test_order_rejects_invalid_quantity():
    customer = _login("customer@demo.com", "demo")
    products = client.get("/products/").json()
    assert products
    first_product_id = products[0]["id"]

    res = client.post(
        "/orders/",
        headers={"X-User-Id": str(customer["id"])},
        json={
            "user_id": customer["id"],
            "total_price": 0,
            "status": "placed",
            "items": [
                {
                    "product_id": first_product_id,
                    "quantity": 0,
                    "price_at_purchase": 0,
                }
            ],
        },
    )
    assert res.status_code == 422
