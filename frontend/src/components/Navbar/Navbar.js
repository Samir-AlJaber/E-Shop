import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogoutConfirm = () => {
      localStorage.removeItem("user");
      setUser(null);
      setShowConfirm(false);
      navigate("/");
  };


  return (
    <>
      <nav className="navbar">
        <div className="nav-logo">E-Shop</div>

        <div className="nav-links">
          <Link to="/">Home</Link>

          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button
                className="logout-btn"
                onClick={() => setShowConfirm(true)}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-logout-btn"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;