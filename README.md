# EECS 4413 Project

(NOTE FOR TA: The deployed backend cold starts so if the app via the link doesn't work at first, it will work in <50 seconds after cold starting)

Full-stack e-commerce web application built with React, FastAPI, and PostgreSQL.

By: Ricky Tran (218809269), Brandon Ngo (218777714), Luke Da Re-White (218590257)

## Getting Started

### How to Run Backend Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### How to Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Payment
- A Stripe test account is used for payments
- Stripe test card number `4242 4242 4242 4242`
- Stripe test card exp date `any future date`
- Stripe test card 3 digits `any three digits`

### Deployment

- Frontend deployed on Vercel (https://4413-shem-popeyes-louisiana.vercel.app/)
- Backend deployed on Render (https://four413-shem-popeyes-louisiana.onrender.com/)
- Database deployed on Supabase

### Customer Credentials

- customer@demo.com
- demo

### Admin Credentials

- admin@demo.com
- demo

### SQL Scripts

- In `/backend/sql_queries/tables.sql`

### Required Features
- Customer Register, Sign in, Sign out
- List catalogue with images
- Filter by Category/Brand/Model
- Search by keyword, sort by price (asc/desc)
- Sort by name (A–Z)
- Product details page showing inventory
- Add/Edit/Remove from cart
- Continue shopping with cart retained
- Checkout with stock-limit rejection
- Stock decrement on checkout
- Login/Register at checkout if not logged in
- Payment process
- Profile page with purchase history
- Update profile
- Admin sales history with filters (customer / product / date)
- Admin detailed orders view
- Admin manage customer accounts / update info
- Admin add new products
- Admin inventory quantity changes

### Extra Features
- Password hashing with bcrypt
- Stripe for payments
- "Almost gone" low-stock badge
- Sold-out image blurred
- Cloud deployment on Vercel, Render, and Supabase
- Singleton pattern (Stripe is a singleton)
- Password confirmation with live mismatch feedback
