import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./LoginPage.css";
import heroImage from "../../assets/images/login-bg.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth_login.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Login successful");
      setIsSuccess(true);

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);

    } else {
      setMessage(data.message);
      setIsSuccess(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">

        <div className="login-container">

          <div className="login-left">
            <img src={heroImage} alt="" className="login-image" />

            <div className="login-left-overlay"></div>

            <div className="login-left-content">
              <h1>E-Shop Management</h1>
              <p>
                Manage products, customers and orders from one powerful
                dashboard designed for modern businesses.
              </p>
            </div>
          </div>

          <div className="login-right">

            <div className="login-card">

              <h2>Welcome Back</h2>

              {message && (
                <div className={isSuccess ? "success-msg" : "error-msg"}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                <button type="submit">Login</button>

              </form>
              <div className="login-register-link">
                Don't have an account?
                <span onClick={() => navigate("/register")}>
                  Register now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;