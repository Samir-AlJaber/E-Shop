USE master;
GO

CREATE LOGIN [eshop_user] WITH PASSWORD = '1234', CHECK_POLICY = OFF;

ALTER SERVER ROLE sysadmin ADD MEMBER [eshop_user];
GO

create database eshop;

USE eshop;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);