import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./RegisterPage.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let newErrors = {};

    if (!formData.email.endsWith("@gmail.com")) {
      newErrors.email = "Email must end with @gmail.com";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Must contain at least 1 lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Must contain at least 1 number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");

    if (!validate()) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth_register.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (data.success) {
        setServerMessage("Registration successful 🎉");
        setIsSuccess(true);
        setErrors({});
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        setServerMessage(data.message || "Registration failed");
        setIsSuccess(false);
      }

    } catch (error) {
      setServerMessage("Something went wrong.");
      setIsSuccess(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="register-wrapper">
        <div className="register-card">
          <h2>Create Account</h2>

          {serverMessage && (
            <div className={isSuccess ? "success-msg" : "error-msg"}>
              {serverMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <button type="submit">Register</button>

          </form>
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 E-Shop Management System. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default RegisterPage;