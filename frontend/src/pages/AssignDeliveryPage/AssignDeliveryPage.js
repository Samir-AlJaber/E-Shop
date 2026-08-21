import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./AssignDeliveryPage.css";

function AssignDeliveryPage() {
  const { order_id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalesman, setSelectedSalesman] = useState(null);

  useEffect(() => {
    if (user && user.role === "owner") {
      fetch(`${process.env.REACT_APP_API_URL}/get_available_salesmen.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: user.reference_id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setSalesmen(data.salesmen);
          else setSalesmen([]);
          setLoading(false);
        })
        .catch(() => {
          setSalesmen([]);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user || user.role !== "owner") {
    return <Navigate to="/products" replace />;
  }

  const confirmAssign = async () => {
    if (!selectedSalesman) return;

    const res = await fetch(`${process.env.REACT_APP_API_URL}/assign_delivery.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id,
        salesman_id: selectedSalesman.salesman_id,
        owner_id: user.reference_id
      })
    });

    const data = await res.json();

    if (data.success) {
      setSelectedSalesman(null);
      navigate("/owner-orders");
    } else {
      setSelectedSalesman(null);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper assign-page">
        <div className="assign-container">
          <h2>Assign Delivery Personnel</h2>

          {loading ? (
            <p className="info-msg">Loading...</p>
          ) : salesmen.length === 0 ? (
            <div className="no-salesman-box">
              <h3>No Delivery Personnel Available</h3>
              <p>Please try again later.</p>
              <button onClick={() => navigate("/owner-orders")}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="salesman-grid">
              {salesmen.map(s => (
                <div className="salesman-card" key={s.salesman_id}>
                  <h3>{s.name}</h3>
                  <p><strong>Email: {s.email}</strong></p>
                  <p><strong>Rating: {s.rating}</strong></p>

                  <button
                    className="assign-btn"
                    onClick={() => setSelectedSalesman(s)}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSalesman && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Assignment</h3>
            <p>Order #{order_id}</p>
            <p><strong>Delivery Person:</strong> {selectedSalesman.name}</p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedSalesman(null)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmAssign}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AssignDeliveryPage;