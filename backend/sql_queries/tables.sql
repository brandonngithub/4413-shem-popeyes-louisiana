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

    ship_to_name VARCHAR(255) DEFAULT '',
    ship_to_line1 TEXT DEFAULT '',
    ship_to_line2 TEXT DEFAULT '',
    ship_to_city VARCHAR(100) DEFAULT '',
    ship_to_state VARCHAR(100) DEFAULT '',
    ship_to_postal_code VARCHAR(20) DEFAULT '',
    ship_to_country VARCHAR(2) DEFAULT '',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC(10, 2) NOT NULL
);
