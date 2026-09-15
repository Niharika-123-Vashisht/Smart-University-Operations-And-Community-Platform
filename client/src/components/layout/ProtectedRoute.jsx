import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen text="Verifying university credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to the user's role-specific dashboard
    const defaultPath =
      user?.role === 'admin'
        ? '/admin/dashboard'
        : user?.role === 'faculty'
        ? '/faculty/dashboard'
        : '/student/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}
