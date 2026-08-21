import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Navigate, useNavigate } from "react-router-dom";
import "./OwnerOrdersPage.css";

function OwnerOrdersPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

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

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState("");
  const [outOfArea, setOutOfArea] = useState(false);

  const fetchOrders = useCallback(() => {
    if (user && user.role === "owner") {
      fetch(`${process.env.REACT_APP_API_URL}/get_owner_orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: user.reference_id,
          role: user.role
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders);
          } else {
            setOrders([]);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        .filter((o) => (o.customer_name || "").toLowerCase().startsWith(text))
        .map((o) => o.customer_name);
    }

    if (searchType === "city") {
      results = orders
        .filter((o) => (o.city || "").toLowerCase().startsWith(text))
        .map((o) => o.city);
    }

    if (searchType === "payment") {
      results = orders
        .filter((o) => (o.payment_method || "").toLowerCase().startsWith(text))
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

  const uniqueCities = [...new Set(orders.map((o) => o.city).filter(Boolean))];
  const uniqueStatuses = [...new Set(
    orders.map((o) => o.status).filter(Boolean)
  )];
  const uniquePayments = [...new Set(
    orders.map((o) => o.payment_method).filter(Boolean)
  )];

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

      const matchCity =
        cityFilter === "" || order.city === cityFilter;

      const total = parseFloat(order.total_amount);

      const matchMin =
        minTotal === "" || total >= parseFloat(minTotal);

      const matchMax =
        maxTotal === "" || total <= parseFloat(maxTotal);

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
        return `No orders found for customer "${searchTerm}".`;
      }

      if (searchType === "city") {
        return `No orders found in city "${searchTerm}".`;
      }

      if (searchType === "payment") {
        return `No orders found with payment method "${searchTerm}".`;
      }

      if (searchType === "status") {
        return `No orders found with status "${searchTerm}".`;
      }
    }

    if (minTotal !== "" && maxTotal !== "") {
      return `No orders found between BDT ${minTotal} and BDT ${maxTotal}.`;
    }

    if (minTotal !== "") {
      return `No orders found above BDT ${minTotal}.`;
    }

    if (maxTotal !== "") {
      return `No orders found below BDT ${maxTotal}.`;
    }

    if (statusFilter !== "") {
      return "No orders found with this status.";
    }

    if (paymentFilter !== "") {
      return "No orders found with this payment method.";
    }

    if (cityFilter !== "") {
      return "No orders found in this city.";
    }

    if (sortType === "newest") {
      return "No orders available to sort by newest.";
    }

    if (sortType === "oldest") {
      return "No orders available to sort by oldest.";
    }

    if (sortType === "low") {
      return "No orders available to sort by low to high.";
    }

    if (sortType === "high") {
      return "No orders available to sort by high to low.";
    }

    return "No orders available.";
  };

  const handleAction = async () => {
    if (!selectedOrder) return;

    if (actionType === "accept") {
      await fetch(`${process.env.REACT_APP_API_URL}/accept_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          owner_id: user.reference_id,
          role: user.role
        })
      });
    }

    if (actionType === "reject") {
      await fetch(`${process.env.REACT_APP_API_URL}/reject_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          owner_id: user.reference_id,
          role: user.role,
          out_of_area: outOfArea
        })
      });
    }

    setSelectedOrder(null);
    setActionType("");
    setOutOfArea(false);
    fetchOrders();
  };

  if (!user || user.role !== "owner") {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper owner-orders-page">
        <div className="owner-orders-container">
          <h2>Owner Order Dashboard</h2>

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
                    placeholder="Search..."
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

                  {order.status === "pending" && (
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

                  {(order.status === "order_confirmed" || order.status === "delivery_rejected") && (
                    <div className="action-buttons">
                      <button
                        className="accept-btn"
                        onClick={() =>
                          navigate(`/assign-delivery/${order.order_id}`)
                        }
                      >
                        Assign Delivery
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
                ? "Confirm Order Acceptance"
                : "Confirm Order Rejection"}
            </h3>

            <p>Order #{selectedOrder.order_id}</p>

            {actionType === "reject" && (
              <div className="checkbox-section">
                <input
                  type="checkbox"
                  checked={outOfArea}
                  onChange={() => setOutOfArea(!outOfArea)}
                />

                <label>Out of delivery area</label>
              </div>
            )}

            <div className="confirm-actions">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setActionType("");
                  setOutOfArea(false);
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

export default OwnerOrdersPage;