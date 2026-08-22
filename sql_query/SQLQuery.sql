USE master;
GO

CREATE LOGIN [eshop_user] WITH PASSWORD = '1234', CHECK_POLICY = OFF;

ALTER SERVER ROLE sysadmin ADD MEMBER [eshop_user];
GO

create database eshop;

USE eshop;
GO

CREATE TABLE owner (
    owner_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
	phone VARCHAR(20),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE salesman (
    salesman_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
	phone VARCHAR(20),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
	rating DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE customer (
    customer_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE category (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
    is_deleted BIT DEFAULT 0;
);

CREATE TABLE product (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    brand VARCHAR(100),
	is_deleted BIT DEFAULT 0,
    description VARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),

    CONSTRAINT FK_product_owner
        FOREIGN KEY (owner_id)
        REFERENCES owner(owner_id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_product_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE NO ACTION
);

CREATE TABLE orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    customer_id INT NOT NULL,
    salesman_id INT NULL,

    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10,2) DEFAULT 0,

    status VARCHAR(30) DEFAULT 'pending',

    delivery_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NULL,
    payment_method VARCHAR(50) NOT NULL,

    CONSTRAINT FK_orders_owner
        FOREIGN KEY (owner_id)
        REFERENCES owner(owner_id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_orders_salesman
        FOREIGN KEY (salesman_id)
        REFERENCES salesman(salesman_id)
        ON DELETE SET NULL
);

CREATE TABLE order_item (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

    CONSTRAINT FK_orderitem_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_orderitem_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id)
        ON DELETE NO ACTION
);

CREATE TABLE user_account (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'salesman', 'customer')),
    reference_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE delivery_rating (
    rating_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    salesman_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_rating_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_rating_salesman
        FOREIGN KEY (salesman_id)
        REFERENCES salesman(salesman_id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_rating_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id)
        ON DELETE NO ACTION
);

SELECT name FROM sys.tables;