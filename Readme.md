# 🛒 E-Shop Project

A full-stack **E-Commerce Web Application** built with:

- ⚛️ React (Frontend)
- 🐘 PHP (Backend)
- 🗄️ Microsoft SQL Server (Database)
- 🔥 XAMPP (Apache Server)

---

## 📌 Overview

This project simulates a complete **online shopping system** with:

- User roles (Owner, Salesman, Customer)
- Product & category management
- Orders & order tracking
- Delivery rating system

---

## ⚙️ Prerequisites

Make sure the following tools are installed:

- Git
- Node.js & npm
- XAMPP
- Microsoft SQL Server
- SQL Server Management Studio (SSMS)
- Visual Studio Code (recommended)

---

## 🚀 Installation & Setup Guide

Follow all steps carefully.

---

## 1️⃣ Clone the Repository


- git clone (your repository link)
- cd (project folder)

---

## 2️⃣ Install Frontend Dependencies

- cd frontend
- npm install

--- 

## 3️⃣ Start Apache Server

- Open XAMPP Control Panel
- Click Start next to Apache
- Keep it running in the background

---

## 4️⃣ Install PHP Drivers for SQL Server

- Download drivers from:

- Official page: https://learn.microsoft.com/en-us/sql/connect/php/download-drivers-php-sql-server?view=sql-server-ver17

- Direct Windows link: https://go.microsoft.com/fwlink/?linkid=2353424
- Extract the downloaded .zip file

---

## 5️⃣ Check PHP Version & Thread Type

- Open in browser:
- http://localhost/dashboard/phpinfo.php

- Note down these: 
- PHP version (e.g., 8.0)
- Thread type: TS (Thread Safe) or NTS (Non Thread Safe)

---

## 6️⃣ Copy Required DLL Files

- From the extracted driver folder:
- Find these files matching your PHP version:
- php_pdo_sqlsrv_XX_ts_x64.dll (or nts)
- php_sqlsrv_XX_ts_x64.dll (or nts)

---

## 7️⃣ Add DLL Files to XAMPP

- Stop Apache from XAMPP
- Click Config → Browse PHP
- Open the ext folder
- Paste the two .dll files inside

---

## 8️⃣ Enable Extensions in php.ini

- Open XAMPP → Config → PHP (php.ini)
- Find the extensions section
- Add these lines at the end:
- extension=(first .dll copied file name)
- extension=(2nd .dll copied file name)

- for example:
- extension=php_pdo_sqlsrv_80_ts_x64.dll
- extension=php_sqlsrv_80_ts_x64.dll

- (Adjust filename based on your version)

- Save (Ctrl + S)
- Restart XAMPP and start Apache again

---

## 9️⃣ Set Up the Database in SQL Server

- Inside the cloned project, go to the sql_query folder and open:

- SQLQuery1.sql

- Open this file in SQL Server Management Studio (SSMS).

- Run the queries in this exact order:
- First, create the SQL Server login eshop_user (use SQL server authentication)
- Then create the database eshop
- Then switch to the eshop database
- Then run the remaining queries to create all tables and related database objects

---

## 🔟 Setup Backend (PHP)

- Copy all .php files from backend/ inside root project folder

- Go to C:\xampp\htdocs on your pc

- Create a folder anemd project_backend

- Paste all .php files inside it

---

## 1️⃣1️⃣ Configure Database Connection

- Inside project_backend, create db.php

- Copy content from db_example.php

- Update server name:

- $serverName = "YOUR_SERVER_NAME";

- Example: $serverName = "DESKTOP-DUUC0I0\SQLEXPRESS";

---

## 1️⃣2️⃣ Setup Environment Variables

- Inside frontend folder, create .env file using vs code

- paste exactly this: REACT_APP_API_URL=http://localhost/project_backend

- Save the file.

---

## 1️⃣3️⃣ Run the Application
- open terminal in vs code and type cd frontend

- then again type npm start

---

## ✅ Make sure:

- Apache is running
- SQL Server is running
- 🎉 You're Done!

- Your E-Shop Website is now ready 🚀

- Open in browser: http://localhost:3000
- Explore features
- Test roles & functionality

---
