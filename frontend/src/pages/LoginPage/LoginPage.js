import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./LoginPage.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth_login.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful 🎉");
        setIsSuccess(true);

        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);
      }
      else {
          setMessage(data.message);
          setIsSuccess(false);
      }

    } catch (error) {
      setMessage("Something went wrong.");
      setIsSuccess(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-wrapper">
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
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 E-Shop Management System. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default LoginPage;