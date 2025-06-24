import React from "react";
import PaymentForm from "./components/PaymentForm";
import ReceiptPage from "./pages/ReceiptPage";
import PanPrompt from "./components/PanPrompt";
import DonationDashboard from "./pages/DonationDashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <PaymentForm />
            </div>
          }
        />
        <Route
          path="/receipt"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <ReceiptPage />
            </div>
          }
        />
        <Route
          path="/pancard"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <PanPrompt />
            </div>
          }
        />
        <Route
          path="/admin/login"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <AdminLogin />
            </div>
          }
        />

        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute>
              <DonationDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-red-500 text-2xl font-bold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
