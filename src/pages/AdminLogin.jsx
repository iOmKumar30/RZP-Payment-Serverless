import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const adminPassword = import.meta.env.VITE_REACT_APP_ADMIN_PASSWORD;
    if (!adminPassword) {
      toast.error("Admin password is not configured. Please contact support.");
      return;
    }

    if (password === adminPassword) {
      localStorage.setItem("relf_admin", "true");
      navigate("/admin/donations");
    } else {
      toast.error("Invalid password. Please try again.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">🔐 Admin Login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault(); 
            if (password) handleLogin();
          }}
        >
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit" 
            disabled={!password}
            className={`w-full py-2 rounded-lg font-semibold transition
            ${
              !password
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
          >
            Login
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default AdminLogin;
