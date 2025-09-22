import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading screen while fetching user
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // Role-based redirect
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "hr") return <Navigate to="/hr" replace />;
    if (user.role === "employee") return <Navigate to="/employee" replace />;
  }

  return children;
};

export default ProtectedRoute;
