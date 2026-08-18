import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./ProfilePage.css";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="profile-wrapper">
        <div className="profile-card">
          <h2>Welcome, {user.name} 👋</h2>

          <div className="profile-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      </div>

    
      <footer className="footer">
        <p>© 2026 E-Shop Management System. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default ProfilePage;