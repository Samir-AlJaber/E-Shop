import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const user = localStorage.getItem("user");

  return (
    <>
      <Navbar />

      <section className="hero">
        <h1>Welcome to E-Shop Management System</h1>
        <p>Manage products, customers and orders with ease.</p>

        <div className="hero-buttons">
          {user ? (
            <button onClick={() => navigate("/profile")}>
              Profile
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>
                Login
              </button>
              <button onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Our System?</h2>

        <div className="feature-cards">
          <div className="card">
            <h3>Inventory Control</h3>
            <p>Track and manage your products efficiently.</p>
          </div>

          <div className="card">
            <h3>Customer Management</h3>
            <p>Store and manage customer information securely.</p>
          </div>

          <div className="card">
            <h3>Order Tracking</h3>
            <p>Monitor orders and transactions in real time.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 E-Shop Management System. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default HomePage;