import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./PlaceOrderPage.css";

function PlaceOrderPage() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const product = location.state?.product;

  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user || user.role !== "customer") {
    return <Navigate to="/products" replace />;
  }

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/place_order.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity,
          customer_id: user.reference_id,
          delivery_address: deliveryAddress,
          city,
          postal_code: postalCode || null,
          payment_method: paymentMethod
        })
      }
    );

    const data = await response.json();
    setMessage(data.message);
    setIsSuccess(data.success);
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">
        <div className="checkout-container">
          <div className="checkout-card">
            <h2>Checkout</h2>

            <div className="product-summary">
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Price:</strong> BDT {product.price}</p>
            </div>

            {message && (
              <div className={isSuccess ? "success-msg" : "error-msg"}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <label>Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />

              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <label>Postal Code (Optional)</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />

              <label>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Card">Card Payment</option>
              </select>

              <button type="submit">Place Order</button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PlaceOrderPage;