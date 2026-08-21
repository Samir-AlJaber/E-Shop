import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import AddProductPage from "./pages/AddProductPage/AddProductPage";
import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
import OrderHistoryPage from "./pages/OrderHistoryPage/OrderHistoryPage";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import OwnerOrdersPage from "./pages/OwnerOrdersPage/OwnerOrdersPage";
import AssignDeliveryPage from "./pages/AssignDeliveryPage/AssignDeliveryPage";
import SalesmanOrdersPage from "./pages/SalesmanOrdersPage/SalesmanOrdersPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/place-order" element={<PlaceOrderPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/owner-orders" element={<OwnerOrdersPage />} />
        <Route path="/assign-delivery/:order_id" element={<AssignDeliveryPage />} />
        <Route path="/salesman-orders" element={<SalesmanOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;