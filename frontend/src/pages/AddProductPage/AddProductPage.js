import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./AddProductPage.css";

function AddProductPage() {

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand: "",
    description: "",
    price: "",
    stock_quantity: ""
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user && user.role === "owner") {
      fetch(`${process.env.REACT_APP_API_URL}/get_categories.php`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setCategories(data.categories);
        });
    }
  }, [user]);

  if (!user || user.role !== "owner") {
    return <Navigate to="/products" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_API_URL}/add_product.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        role: user.role,
        owner_id: user.reference_id
      })
    });

    const data = await response.json();

    setMessage(data.message);
    setIsSuccess(data.success);

    if (data.success) {
      setFormData({
        name: "",
        category_id: "",
        brand: "",
        description: "",
        price: "",
        stock_quantity: ""
      });
    }
  };

  return (
    <div className="app-wrapper">

      <Navbar />

      <div className="content-wrapper">

        <div className="add-product-container">

          <h2>Add Product</h2>

          <div className="add-product-card">

            {message && (
              <div className={isSuccess ? "success-msg" : "error-msg"}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="add-product-form">

              <input
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>

              <input
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="stock_quantity"
                placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                required
              />

              <button type="submit">
                Add Product
              </button>

            </form>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default AddProductPage;