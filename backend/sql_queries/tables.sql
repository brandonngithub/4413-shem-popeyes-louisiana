DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE product_category AS ENUM ('FOOD', 'ELECTRONIC', 'ACCESSORIES', 'CLOTHING', 'BEVERAGE', 'BOOK', 'OTHER');
CREATE TYPE order_status AS ENUM ('PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'CUSTOMER',

    shipping_street TEXT,
    shipping_province VARCHAR(50),
    shipping_country VARCHAR(50),
    shipping_zip VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category product_category,
    brand VARCHAR(100),
    model VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_price NUMERIC(10, 2) NOT NULL,
    status order_status DEFAULT 'PLACED',
    payment_intent_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC(10, 2) NOT NULL
);
