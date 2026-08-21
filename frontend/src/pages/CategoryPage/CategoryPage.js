import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./CategoryPage.css";

function CategoryPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/get_categories.php`
    );
    const data = await response.json();
    if (data.success) {
      setCategories(data.categories);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (!user || user.role !== "owner") {
    return <Navigate to="/products" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/add_category.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: categoryName,
          role: user.role
        })
      }
    );

    const data = await response.json();

    setMessage(data.message);
    setIsSuccess(data.success);

    setTimeout(() => {
      setMessage("");
    }, 3000);

    if (data.success) {
      setCategoryName("");
      fetchCategories();
    }
  };

  const openDeleteConfirm = (category) => {
    setSelectedCategory(category);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/delete_category.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory.category_id,
          role: user.role
        })
      }
    );

    const data = await response.json();

    setMessage(data.message);
    setIsSuccess(data.success);

    setTimeout(() => {
      setMessage("");
    }, 3000);

    if (data.success) {
      fetchCategories();
    }

    setShowConfirm(false);
    setSelectedCategory(null);
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">
        <div className="category-container">
          <h2>Category Management</h2>

          {message && (
            <div className={isSuccess ? "success-msg" : "error-msg"}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="category-form">
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            <button type="submit">Add Category</button>
          </form>

          <div className="category-list">
            {categories.map((cat) => (
              <div key={cat.category_id} className="category-item">
                <span>{cat.category_name}</span>
                <button
                  className="delete-btn"
                  onClick={() => openDeleteConfirm(cat)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedCategory?.category_name}</strong>?
            </p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-logout-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default CategoryPage;