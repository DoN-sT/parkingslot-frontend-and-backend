import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if role mismatch
    switch (role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "OWNER":
        return <Navigate to="/owner" replace />;
      case "EMPLOYEE":
        return <Navigate to="/employee" replace />;
      case "CUSTOMER":
      default:
        return <Navigate to="/customer" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
