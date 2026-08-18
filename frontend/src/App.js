import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />  
      </Routes>
    </Router>
  );
}

export default App;
