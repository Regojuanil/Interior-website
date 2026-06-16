-- Database Setup Script for Regoju Interior Works E-Commerce
-- Run this in your MySQL database client (e.g. phpMyAdmin, MySQL CLI, or Workbench)

CREATE DATABASE IF NOT EXISTS interior_db;
USE interior_db;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Seed Initial Products (Only inserts if products table is empty)
INSERT INTO products (name, description, price, image_url)
SELECT * FROM (
    SELECT 'Wooden Chair' AS name, 'Ergonomically designed premium teakwood chair with handcrafted cushions for ultimate comfort.' AS description, 6000.00 AS price, 'assets/images/wooden_chair.png' AS image_url UNION ALL
    SELECT 'Wooden Sofa', 'Luxury 5-seater royal mahogany sofa set, built for comfort and style.', 45000.00, 'assets/images/wooden_sofa.png' UNION ALL
    SELECT 'Wooden Bed', 'King-sized solid sheesham wood bed with premium headboard finish and storage.', 30000.00, 'assets/images/wooden_bed.png' UNION ALL
    SELECT 'Wooden Dining Table', 'Elegant 6-seater dining table made of rich walnut wood with a polished marble-like finish.', 16000.00, 'assets/images/wooden_dining_table.png' UNION ALL
    SELECT 'Wooden Tea Table', 'Charming handcrafted center coffee/tea table with dual drawers and gold accents.', 10000.00, 'assets/images/wooden_tea_table.png'
) AS seed_data
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
