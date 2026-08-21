import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./ProfilePage.css";

function ProfilePage() {

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  useEffect(() => {
    if (!storedUser) {
      navigate("/", { replace: true });
    }
  }, [navigate, storedUser]);

  const [user, setUser] = useState(storedUser);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: storedUser?.name || "",
    phone: storedUser?.phone || "",
    address: storedUser?.address || ""
  });

  if (!user) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/update_profile.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: user.role,
          reference_id: user.reference_id,
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowModal(false);
    } else {
      alert(data.message || "Profile update failed.");
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">
        <div className="profile-container">
          <div className="profile-card">
            <h2>My Profile</h2>

            <div className="profile-info">
              <p><strong>Name:</strong> <span>{user.name}</span></p>
              <p><strong>Email:</strong> <span>{user.email}</span></p>
              <p><strong>Phone:</strong> <span>{user.phone || "Not Provided"}</span></p>
              <p><strong>Address:</strong> <span>{user.address || "Not Provided"}</span></p>
              <p><strong>Role:</strong> <span>{user.role}</span></p>
            </div>

            <button className="edit-btn" onClick={() => setShowModal(true)}>
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Profile</h3>

            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
              />

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProfilePage;