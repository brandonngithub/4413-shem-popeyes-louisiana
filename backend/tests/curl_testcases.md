# Backend curl Test Cases

All examples assume the backend is running at `http://127.0.0.1:8000`.
Replace the host with `https://four413-shem-popeyes-louisiana.onrender.com`
to exercise the deployed API.

The seed data creates two users:

| Role     | Email                | Password |
| -------- | -------------------- | -------- |
| Customer | `customer@demo.com`  | `demo`   |
| Admin    | `admin@demo.com`     | `demo`   |

Login responses return the numeric user `id`. Substitute it for
`<customer_id>` / `<admin_id>` in the calls below. Authorization is carried
in the `X-User-Id` header.

---

## 1. Health check

```bash
curl -s http://127.0.0.1:8000/
```

Expected: `200` with `{"message":"Healthy"}`.

---

## 2. Authentication

### 2a. Login as customer

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo"}'
```

Expected: `200` with the user object (note the absence of `password_hash` —
DTOs strip it on the way out).

### 2b. Login as admin

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"demo"}'
```

Expected: `200` with `"role":"admin"`.

### 2c. Login with bad credentials

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"wrong"}'
```

Expected: `401` with `{"detail":"Invalid email or password."}`.

### 2d. Register a new user

```bash
curl -s -X POST http://127.0.0.1:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{"email":"new@demo.com","password":"secret","first_name":"New","last_name":"User"}'
```

Expected: `200` with the new user. Re-running the same call returns `400`
with `Email already registered` — proves the uniqueness guard.

---

## 3. Products (Catalog)

### 3a. Public product listing

```bash
curl -s http://127.0.0.1:8000/products/
```

Expected: `200` with an array of products. No auth required.

### 3b. Public product detail

```bash
curl -s http://127.0.0.1:8000/products/1
```

Expected: `200` with one product, or `404` if `1` does not exist.

### 3c. Admin creates a product

```bash
curl -s -X POST http://127.0.0.1:8000/products/ \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <admin_id>" \
  -d '{"name":"Demo Hat","description":"curl-seeded hat","price":19.99,"category":"accessory","brand":"Demo","model":"Classic","image":"","stock":5}'
```

Expected: `200` with the created product (note the returned `id`).

### 3d. Customer cannot create a product

```bash
curl -s -X POST http://127.0.0.1:8000/products/ \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"name":"Hack","description":"nope","price":1,"category":"other","brand":"x","model":"x","image":"","stock":1}'
```

Expected: `403` with `Admin access required`.

### 3e. Unauthenticated request cannot create a product

```bash
curl -s -X POST http://127.0.0.1:8000/products/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Hack","description":"nope","price":1,"category":"other","brand":"x","model":"x","image":"","stock":1}'
```

Expected: `401` with `Sign in required`.

### 3f. Admin updates inventory

```bash
curl -s -X PUT http://127.0.0.1:8000/products/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <admin_id>" \
  -d '{"name":"Nike Cap","description":"Classic six-panel cotton cap.","price":25,"category":"accessory","brand":"Nike","model":"Classic Cap","image":"","stock":99}'
```

Expected: `200` with the updated product.

### 3g. Admin deletes a product

```bash
curl -s -X DELETE http://127.0.0.1:8000/products/<product_id> \
  -H "X-User-Id: <admin_id>"
```

Expected: `200` with `{"message":"Product deleted"}`.

---

## 4. Users (Admin-only)

### 4a. Admin lists users

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <admin_id>"
```

Expected: `200` with an array of users.

### 4b. Customer is denied listing users

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <customer_id>"
```

Expected: `403`.

### 4c. Customer can read their own profile

```bash
curl -s http://127.0.0.1:8000/users/<customer_id> -H "X-User-Id: <customer_id>"
```

Expected: `200` with their own user.

### 4d. Customer cannot read another user's profile

```bash
curl -s http://127.0.0.1:8000/users/<admin_id> -H "X-User-Id: <customer_id>"
```

Expected: `403`.

### 4e. Customer patches their own profile

```bash
curl -s -X PATCH http://127.0.0.1:8000/users/<customer_id> \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"first_name":"Updated"}'
```

Expected: `200` with the updated profile.

---

## 5. Payments

### 5a. Payment config (publishable key)

```bash
curl -s http://127.0.0.1:8000/payments/config
```

Expected: `200` with `{"publishable_key":"pk_test_...","currency":"cad"}`
when Stripe is configured, `503` otherwise.

### 5b. Create a Stripe PaymentIntent

```bash
curl -s -X POST http://127.0.0.1:8000/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `200` with
`{"client_secret":"pi_..._secret_...","payment_intent_id":"pi_...","amount":<cents>,"currency":"cad"}`.

Note: `price_at_purchase` is ignored by the server — the backend re-prices
the cart from the DB so the client cannot spoof totals.

### 5c. Unauthenticated create-intent is rejected

```bash
curl -s -X POST http://127.0.0.1:8000/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `401` with `Sign in required`.

### 5d. Create-intent validates stock

```bash
curl -s -X POST http://127.0.0.1:8000/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"items":[{"product_id":1,"quantity":9999,"price_at_purchase":0}]}'
```

Expected: `400` with `only <N> in stock (requested 9999).`.

---

## 6. Orders

### 6a. Order creation without a PaymentIntent is rejected

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"user_id":<customer_id>,"total_price":0,"status":"placed","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `402` with `Missing payment_intent_id.`. Enforces payment-first
ordering.

### 6b. Order creation with a succeeded PaymentIntent

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"user_id":<customer_id>,"total_price":0,"status":"placed","payment_intent_id":"pi_...","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `200` with the created order. Product stock is decremented and
the `ship_to_*` fields are populated from the Stripe PaymentIntent.
Confirm the PaymentIntent client-side via Stripe Elements (card
`4242 4242 4242 4242`, any future expiry, any CVC) before calling this.

### 6c. Customer cannot create an order for someone else

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"user_id":<admin_id>,"total_price":0,"status":"placed","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `403` with `Forbidden`.

### 6d. Customer lists their own orders

```bash
curl -s http://127.0.0.1:8000/users/<customer_id>/orders \
  -H "X-User-Id: <customer_id>"
```

Expected: `200` with an array of that customer's orders (each carries
`items[]` and `ship_to_*` fields).

### 6e. Customer cannot list another user's orders

```bash
curl -s http://127.0.0.1:8000/users/<admin_id>/orders \
  -H "X-User-Id: <customer_id>"
```

Expected: `403`.

### 6f. Admin lists all orders

```bash
curl -s http://127.0.0.1:8000/orders/ -H "X-User-Id: <admin_id>"
```

Expected: `200` with every order in the system.

### 6g. Admin updates an order's status

```bash
curl -s -X PUT http://127.0.0.1:8000/orders/<order_id> \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <admin_id>" \
  -d '{"user_id":<customer_id>,"total_price":20,"status":"shipped"}'
```

Expected: `200` with the updated order (`status` = `shipped`).

### 6h. Customer cannot update an order

```bash
curl -s -X PUT http://127.0.0.1:8000/orders/<order_id> \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <customer_id>" \
  -d '{"user_id":<customer_id>,"total_price":20,"status":"shipped"}'
```

Expected: `403`.

### 6i. Admin deletes an order (restores stock)

```bash
curl -s -X DELETE http://127.0.0.1:8000/orders/<order_id> \
  -H "X-User-Id: <admin_id>"
```

Expected: `200` with `{"message":"Order deleted"}`. The line items' stock
is returned to their products — verify by re-reading the product after.

### 6j. Customer cannot delete an order

```bash
curl -s -X DELETE http://127.0.0.1:8000/orders/<order_id> \
  -H "X-User-Id: <customer_id>"
```

Expected: `403`.

---

## Recommended end-to-end demo sequence

1. `2b` Login as admin, note `<admin_id>`.
2. `2a` Login as customer, note `<customer_id>`.
3. `3a` Confirm the catalog has products.
4. `5a` Confirm Stripe is configured.
5. `5b` Create a PaymentIntent as the customer.
6. (browser) Confirm the PaymentIntent via Stripe Elements on the checkout
   page using test card `4242 4242 4242 4242`.
7. `6b` Create the order with the confirmed `payment_intent_id`.
8. `6d` Customer sees the new order in their history.
9. `6f` Admin sees the same order in the global list.
10. `3f` Admin updates inventory.
11. `6g` Admin marks the order shipped.
