# Backend CURL Testcases

## 1) Login (customer)

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"customer@demo.com","password":"demo"}'
```

## 2) Login (admin)

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@demo.com","password":"demo"}'
```

## 3) Browse products

```bash
curl -s http://127.0.0.1:8000/products/
```

## 4) Payment config

```bash
curl -s http://127.0.0.1:8000/payments/config
```

Expected: `{"publishable_key":"pk_test_...","currency":"cad"}` when Stripe is
configured; `503` otherwise.

## 5) Create a Stripe PaymentIntent

```bash
curl -s -X POST http://127.0.0.1:8000/payments/create-intent \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `{"client_secret":"pi_..._secret_...","payment_intent_id":"pi_...","amount":2000,"currency":"cad"}`.
The browser confirms the intent client-side via Stripe Elements; for a
terminal-only demo use Stripe's test mode and confirm via the dashboard.

## 6) Order creation without payment is rejected

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"user_id":<customer_id>,"total_price":0,"status":"placed","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `402` with `Missing payment_intent_id.`

## 7) Order creation with a succeeded PaymentIntent

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"user_id":<customer_id>,"total_price":0,"status":"placed","payment_intent_id":"pi_...","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

Expected: `200` with the created order. Stock is decremented; cart is cleared
client-side.

## 8) Admin-only guard on product create

```bash
curl -s -X POST http://127.0.0.1:8000/products/ \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"name":"x","description":"x","price":1,"category":"book","brand":"x","model":"x","image":"","stock":1}'
```

Expected: `403`.

## 9) Admin inventory update

```bash
curl -s -X PUT http://127.0.0.1:8000/products/1 \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <admin_id>" \\
  -d '{"name":"The Little Prince","description":"A classic novella; illustrated edition.","price":20,"category":"book","brand":"Penguin","model":"Hardcover","image":"https://picsum.photos/seed/b001/320/320","stock":120}'
```

## 10) Admin users listing

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <admin_id>"
```

## 11) Customer denied users listing

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <customer_id>"
```

Expected: `403`.
