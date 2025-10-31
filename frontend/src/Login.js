import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request to backend
      const res = await axios.post(`${API_URL}/auth/login`, form);

      // Store tokens and notify parent (App.js)
      if (onLoginSuccess) {
        onLoginSuccess(res.data);
      } else {
        // fallback in case prop missing
        localStorage.setItem("accessToken", res.data.access_token);
        localStorage.setItem("refreshToken", res.data.refresh_token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.detail || "Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-6 rounded-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Login to BragBoard
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <p className="text-center mt-3 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
