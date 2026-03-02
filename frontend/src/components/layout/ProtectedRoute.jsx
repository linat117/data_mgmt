import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If route is restricted by role, check if user role matches
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // role not authorized so redirect to a 403 or dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // authorized so return child components
    return <Outlet />;
};
