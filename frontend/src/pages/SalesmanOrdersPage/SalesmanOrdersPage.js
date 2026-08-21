import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Navigate } from "react-router-dom";
import "./SalesmanOrdersPage.css";

function SalesmanOrdersPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [orders, setOrders] = useState([]);

  const [searchType, setSearchType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");

  const [sortType, setSortType] = useState("");

  const [rating, setRating] = useState(0);
  const [deliveries, setDeliveries] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    if (user && user.role === "salesman") {
      fetch(`${process.env.REACT_APP_API_URL}/get_salesman_orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesman_id: user.reference_id })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders);
            setRating(data.rating || 0);
            setDeliveries(data.total_deliveries || 0);
          } else {
            setOrders([]);
          }
        });
    }
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim().toLowerCase());
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const text = searchInput.toLowerCase().trim();

    setSearchTerm(text);

    if (text === "" || searchType === "all") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let results = [];

    if (searchType === "customer") {
      results = orders
        .filter((o) =>
          (o.customer_name || "").toLowerCase().startsWith(text)
        )
        .map((o) => o.customer_name);
    }

    if (searchType === "city") {
      results = orders
        .filter((o) => (o.city || "").toLowerCase().startsWith(text))
        .map((o) => o.city);
    }

    if (searchType === "payment") {
      results = orders
        .filter((o) =>
          (o.payment_method || "").toLowerCase().startsWith(text)
        )
        .map((o) => o.payment_method);
    }

    if (searchType === "status") {
      results = orders
        .filter((o) =>
          (o.status || "").replace(/_/g, " ").toLowerCase().startsWith(text)
        )
        .map((o) => (o.status || "").replace(/_/g, " "));
    }

    const unique = [...new Set(results)].filter(Boolean).slice(0, 5);

    setSuggestions(unique);
    setShowSuggestions(unique.length > 0);
  }, [searchInput, searchType, orders]);

  const selectSuggestion = (value) => {
    setSearchInput(value);
    setSearchTerm(value.toLowerCase());
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const searchPlaceholder = useMemo(() => {
    if (searchType === "customer") return "Search customer";
    if (searchType === "city") return "Search city";
    if (searchType === "payment") return "Search payment";
    if (searchType === "status") return "Search order status";

    return "Select search type first";
  }, [searchType]);

  const uniqueCities = [...new Set(orders.map((o) => o.city).filter(Boolean))];
  const uniqueStatuses = [
    ...new Set(orders.map((o) => o.status).filter(Boolean))
  ];
  const uniquePayments = [
    ...new Set(orders.map((o) => o.payment_method).filter(Boolean))
  ];

  const filteredOrders = orders
    .filter((order) => {
      const text = searchTerm.toLowerCase().trim();

      let matchSearch = true;

      if (text !== "") {
        if (searchType === "all") {
          matchSearch = false;
        } else if (searchType === "customer") {
          matchSearch = (order.customer_name || "")
            .toLowerCase()
            .startsWith(text);
        } else if (searchType === "city") {
          matchSearch = (order.city || "").toLowerCase().startsWith(text);
        } else if (searchType === "payment") {
          matchSearch = (order.payment_method || "")
            .toLowerCase()
            .startsWith(text);
        } else if (searchType === "status") {
          matchSearch = (order.status || "")
            .replace(/_/g, " ")
            .toLowerCase()
            .startsWith(text);
        }
      }

      const matchStatus =
        statusFilter === "" || order.status === statusFilter;

      const matchPayment =
        paymentFilter === "" || order.payment_method === paymentFilter;

      const matchCity = cityFilter === "" || order.city === cityFilter;

      const total = parseFloat(order.total_amount);

      const matchMin = minTotal === "" || total >= parseFloat(minTotal);

      const matchMax = maxTotal === "" || total <= parseFloat(maxTotal);

      return (
        matchSearch &&
        matchStatus &&
        matchPayment &&
        matchCity &&
        matchMin &&
        matchMax
      );
    })
    .sort((a, b) => {
      if (sortType === "newest") return b.order_id - a.order_id;
      if (sortType === "oldest") return a.order_id - b.order_id;

      const totalA = parseFloat(a.total_amount);
      const totalB = parseFloat(b.total_amount);

      if (sortType === "low") return totalA - totalB;
      if (sortType === "high") return totalB - totalA;

      return 0;
    });

  const getEmptyMessage = () => {
    if (searchType === "all" && searchTerm !== "") {
      return "Please select a search type to start searching.";
    }

    if (searchTerm !== "") {
      if (searchType === "customer") {
        return `No deliveries found for customer "${searchTerm}".`;
      }

      if (searchType === "city") {
        return `No deliveries found in city "${searchTerm}".`;
      }

      if (searchType === "payment") {
        return `No deliveries found with payment method "${searchTerm}".`;
      }

      if (searchType === "status") {
        return `No deliveries found with status "${searchTerm}".`;
      }
    }

    if (minTotal !== "" && maxTotal !== "") {
      return `No deliveries found between BDT ${minTotal} and BDT ${maxTotal}.`;
    }

    if (minTotal !== "") {
      return `No deliveries found above BDT ${minTotal}.`;
    }

    if (maxTotal !== "") {
      return `No deliveries found below BDT ${maxTotal}.`;
    }

    if (statusFilter !== "") {
      return "No deliveries found with this status.";
    }

    if (paymentFilter !== "") {
      return "No deliveries found with this payment method.";
    }

    if (cityFilter !== "") {
      return "No deliveries found in this city.";
    }

    if (sortType === "newest") {
      return "No deliveries available to sort by newest.";
    }

    if (sortType === "oldest") {
      return "No deliveries available to sort by oldest.";
    }

    if (sortType === "low") {
      return "No deliveries available to sort by low to high.";
    }

    if (sortType === "high") {
      return "No deliveries available to sort by high to low.";
    }

    return "No deliveries available.";
  };

  const handleAction = async () => {
    if (!selectedOrder) return;

    if (actionType === "accept") {
      await fetch(`${process.env.REACT_APP_API_URL}/accept_delivery.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          salesman_id: user.reference_id
        })
      });
    }

    if (actionType === "reject") {
      await fetch(`${process.env.REACT_APP_API_URL}/reject_delivery.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          salesman_id: user.reference_id
        })
      });
    }

    if (actionType === "complete") {
      await fetch(`${process.env.REACT_APP_API_URL}/complete_delivery.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          salesman_id: user.reference_id
        })
      });
    }

    setSelectedOrder(null);
    setActionType("");

    fetch(`${process.env.REACT_APP_API_URL}/get_salesman_orders.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesman_id: user.reference_id })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
          setRating(data.rating);
          setDeliveries(data.total_deliveries);
        }
      });
  };

  if (!user || user.role !== "salesman") {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper salesman-orders-page">
        <div className="salesman-orders-container">
          <h2>Delivery Dashboard</h2>

          <div className="stats-section">

                <div className="stat-card">
                    <span className="icon">⭐</span>
                    <div>
                        <strong>Average Rating</strong>
                        <strong>{Number(rating).toFixed(1)}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <span className="icon">📦</span>
                    <div>
                        <strong>Total Deliveries</strong>
                        <strong>{deliveries}</strong>
                    </div>
                </div>

            </div>

          <div className="controls-wrapper">
            <div className="search-section">
              <h3>Search</h3>

              <form className="search-form" onSubmit={handleSearchSubmit}>
                <select
                  value={searchType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchType(value);

                    if (searchInput.trim() === "" || value === "all") {
                      setShowSuggestions(false);
                      setSuggestions([]);
                    } else {
                      setShowSuggestions(true);
                    }
                  }}
                >
                  <option value="all">All</option>
                  <option value="customer">Customer</option>
                  <option value="city">City</option>
                  <option value="payment">Payment</option>
                  <option value="status">Status</option>
                </select>

                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchInput(value);

                      if (value.trim() === "" || searchType === "all") {
                        setShowSuggestions(false);
                      } else {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => setShowSuggestions(false)}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestion-box">
                      {suggestions.map((item, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(item);
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="search-btn"
                  onClick={() => setShowSuggestions(false)}
                >
                  🔍
                </button>
              </form>
            </div>

            <div className="filter-section">
              <h3>Filter</h3>

              <div className="filter-grid">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>

                  {uniqueStatuses.map((s, i) => (
                    <option key={i} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="">All Payments</option>

                  {uniquePayments.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>

                  {uniqueCities.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min Total"
                  value={minTotal}
                  onChange={(e) => setMinTotal(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Max Total"
                  value={maxTotal}
                  onChange={(e) => setMaxTotal(e.target.value)}
                />
              </div>
            </div>

            <div className="sort-section">
              <h3>Sort</h3>

              <div className="sort-buttons">
                <button
                  type="button"
                  className={sortType === "newest" ? "active-sort" : ""}
                  onClick={() => setSortType("newest")}
                >
                  Newest
                </button>

                <button
                  type="button"
                  className={sortType === "oldest" ? "active-sort" : ""}
                  onClick={() => setSortType("oldest")}
                >
                  Oldest
                </button>

                <button
                  type="button"
                  className={sortType === "low" ? "active-sort" : ""}
                  onClick={() => setSortType("low")}
                >
                  Total Low → High
                </button>

                <button
                  type="button"
                  className={sortType === "high" ? "active-sort" : ""}
                  onClick={() => setSortType("high")}
                >
                  Total High → Low
                </button>

                <button
                  type="button"
                  className={sortType === "" ? "active-sort" : ""}
                  onClick={() => setSortType("")}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="order-grid">
            {filteredOrders.length === 0 ? (
              <div className="order-history-empty-state">
                <strong>{getEmptyMessage()}</strong>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div className="order-card" key={order.order_id}>
                  <div className="order-header">
                    <span>Order #{order.order_id}</span>

                    <span className={`status ${order.status}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Email:</strong> {order.customer_email}</p>
                  <p><strong>Total:</strong> BDT {order.total_amount}</p>

                  <div className="delivery-box">
                    <p><strong>Address:</strong> {order.delivery_address}</p>
                    <p><strong>City:</strong> {order.city}</p>

                    {order.postal_code && (
                      <p><strong>Postal Code:</strong> {order.postal_code}</p>
                    )}

                    <p><strong>Payment:</strong> {order.payment_method}</p>
                  </div>

                  {order.status === "waiting_delivery_acceptance" && (
                    <div className="action-buttons">
                      <button
                        className="accept-btn"
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType("accept");
                        }}
                      >
                        Accept
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType("reject");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {order.status === "delivery_accepted" && (
                    <div className="action-buttons">
                      <button
                        className="accept-btn"
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType("complete");
                        }}
                      >
                        Mark Delivered
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />

      {selectedOrder && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>
              {actionType === "accept"
                ? "Confirm Delivery Acceptance"
                : actionType === "reject"
                ? "Confirm Delivery Rejection"
                : "Confirm Delivery Completion"}
            </h3>

            <p>
              {actionType === "accept" &&
                `Are you sure you want to accept delivery for order #${selectedOrder.order_id}?`}

              {actionType === "reject" &&
                `Are you sure you want to reject delivery for order #${selectedOrder.order_id}?`}

              {actionType === "complete" &&
                `Confirm that order #${selectedOrder.order_id} has been delivered.`}
            </p>

            <div className="confirm-actions">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setActionType("");
                }}
              >
                Cancel
              </button>

              <button onClick={handleAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesmanOrdersPage;