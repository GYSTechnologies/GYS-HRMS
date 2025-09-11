import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    // Role-based redirect
    if (user.role === "admin") return <Navigate to="/admin" />;
    if (user.role === "hr") return <Navigate to="/hr" />;
    if (user.role === "employee") return <Navigate to="/employee" />;
  }

  return children;
};

export default ProtectedRoute;
