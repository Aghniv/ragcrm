import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireTenant = true }) {
  const { isAuthenticated, loading, needsTenant } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireTenant && needsTenant) {
    return <Navigate to="/setup" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;