import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    // Redirect to login and store the page user tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in and trying to access login page, redirect to home
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return children;
}
