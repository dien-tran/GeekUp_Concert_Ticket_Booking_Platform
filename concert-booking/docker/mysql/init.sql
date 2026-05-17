-- Create database if not exists
CREATE DATABASE IF NOT EXISTS concert_booking_db;
USE concert_booking_db;

-- Create tables
CREATE TABLE concert (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT,
    open_date DATETIME,
    status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE ticket_categories (
    id VARCHAR(36) PRIMARY KEY,
    concert_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    total_quantity INT NOT NULL,
    sold_quantity INT DEFAULT 0,
    status VARCHAR(50),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (concert_id) REFERENCES concert(id)
);

CREATE TABLE tickets (
    id VARCHAR(36) PRIMARY KEY,
    concert_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    seat_number VARCHAR(50) NOT NULL,
    is_reserved BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    FOREIGN KEY (concert_id) REFERENCES concert(id),
    FOREIGN KEY (category_id) REFERENCES ticket_categories(id),
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50)
);

CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE booking (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total_price DECIMAL(19, 2),
    booking_time DATETIME,
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE booking_item (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    ticket_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE voucher (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount DECIMAL(19, 2),
    min_order_amount DECIMAL(19, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    status VARCHAR(50)
);

CREATE TABLE voucher_usage (
    id VARCHAR(36) PRIMARY KEY,
    voucher_id VARCHAR(36) NOT NULL,
    booking_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    used_at DATETIME,
    FOREIGN KEY (voucher_id) REFERENCES voucher(id),
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_voucher_booking (voucher_id, booking_id),
    UNIQUE KEY unique_voucher_user (voucher_id, user_id)
);

CREATE TABLE payment (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    amount DECIMAL(19, 2),
    payment_time DATETIME,
    status VARCHAR(50),
    method VARCHAR(50),
    txn_ref VARCHAR(255),
    FOREIGN KEY (booking_id) REFERENCES booking(id)
);
