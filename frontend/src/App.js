import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    navigate("/login");
  }, [navigate]);

  // ✅ Fetch current user using the correct endpoint /auth/me
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Invalid or expired token:", err);
        handleLogout();
      }
    };
    fetchUser();
  }, [token, handleLogout]);

  // ✅ When login is successful
  const handleLoginSuccess = (data) => {
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    navigate("/dashboard");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Dashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          token ? (
            <Dashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
    </Routes>
  );
}

export default App;
