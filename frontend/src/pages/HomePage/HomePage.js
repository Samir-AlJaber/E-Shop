import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./HomePage.css";
import heroImg from "../../assets/images/hero-shop.jpg";
import bannerImg from "../../assets/images/banner-shop.jpg";
import statsImg from "../../assets/images/stats-dashboard.jpg";

function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">

        <section className="hero">
          <img src={heroImg} className="section-bg" alt="" />
        <div className="hero-overlay"></div>

        <div className="hero-content">
            <h1>Welcome to E-Shop Management System</h1>
            <p>Manage products, customers and orders with ease.</p>

            <div className="hero-buttons">
              {user ? (
                <button onClick={() => navigate("/profile")}>Profile</button>
              ) : (
                <>
                  <button onClick={() => navigate("/login")}>Login</button>
                  <button onClick={() => navigate("/register")}>Register</button>
                </>
              )}
            </div>
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

        <section className="banner-section">
          <img src={bannerImg} className="section-bg" alt="" />

          <div className="banner-content">
            <h2>Smart Business Management</h2>
            <p>Powerful tools to manage inventory, orders and users in one place.</p>
          </div>
        </section>

        <section className="stats-section">
          <img src={statsImg} className="section-bg" alt="" />

          <div className="stat">
            <h3>100+</h3>
            <p>Products Managed</p>
          </div>

          <div className="stat">
            <h3>500+</h3>
            <p>Orders Processed</p>
          </div>

          <div className="stat">
            <h3>50+</h3>
            <p>Happy Customers</p>
          </div>

          <div className="stat">
            <h3>24/7</h3>
            <p>System Availability</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Start Managing Your Store Today</h2>

          <div className="cta-buttons">
            {user ? (
              <button onClick={() => navigate("/products")}>View Products</button>
            ) : (
              <button onClick={() => navigate("/register")}>Create Account</button>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default HomePage;