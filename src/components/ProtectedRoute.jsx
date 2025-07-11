import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("relf_admin") === "true";

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
