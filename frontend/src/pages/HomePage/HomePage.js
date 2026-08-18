import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">E-Shop Management System</h1>

      <p className="home-subtitle">
        Manage products, customers and orders efficiently.
      </p>

      <div className="home-buttons">
        <button
          className="home-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="home-button"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default HomePage;