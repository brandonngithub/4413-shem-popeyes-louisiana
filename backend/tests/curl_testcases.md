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

## 4) Customer checkout happy path

```bash
curl -s -X POST http://127.0.0.1:8000/orders/ \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"user_id":<customer_id>,"total_price":0,"status":"placed","items":[{"product_id":1,"quantity":1,"price_at_purchase":0}]}'
```

## 5) Rejected payment simulation (every 3rd checkout)

Repeat testcase #4 three times for the same user id; the third should return status `402` with `Credit Card Authorization Failed.`

## 6) Admin-only guard on product create

```bash
curl -s -X POST http://127.0.0.1:8000/products/ \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <customer_id>" \\
  -d '{"name":"x","description":"x","price":1,"category":"book","brand":"x","model":"x","image":"","stock":1}'
```

Expected: `403`.

## 7) Admin inventory update

```bash
curl -s -X PUT http://127.0.0.1:8000/products/1 \\
  -H "Content-Type: application/json" \\
  -H "X-User-Id: <admin_id>" \\
  -d '{"name":"The Little Prince","description":"A classic novella; illustrated edition.","price":20,"category":"book","brand":"Penguin","model":"Hardcover","image":"https://picsum.photos/seed/b001/320/320","stock":120}'
```

## 8) Admin users listing

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <admin_id>"
```

## 9) Customer denied users listing

```bash
curl -s http://127.0.0.1:8000/users/ -H "X-User-Id: <customer_id>"
```

Expected: `403`.
