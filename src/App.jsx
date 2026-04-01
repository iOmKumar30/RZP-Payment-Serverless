
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import PanPrompt from "./components/PanPrompt";
import PaymentForm from "./components/PaymentForm";
import ProtectedRoute from "./components/ProtectedRoute";
import DonationDashboard from "./pages/DonationDashboard";
import ReceiptPage from "./pages/ReceiptPage";
import SsoOk from "./pages/SsoOk"; 

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public donation form */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <PaymentForm />
            </div>
          }
        />

        {/* Receipt */}
        <Route
          path="/receipt"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <ReceiptPage />
            </div>
          }
        />

        {/* PAN capture */}
        <Route
          path="/pancard"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <PanPrompt />
            </div>
          }
        />

        {/* SSO success page: sets localStorage and redirects to dashboard */}
        <Route
          path="/admin/sso-ok"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <SsoOk />
            </div>
          }
        />

        {/* Admin donations dashboard (protected) */}
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute>
              <DonationDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
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
