import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './features/auth/Login';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import Dashboard from './features/dashboard/Dashboard';
import Records from './features/data-records/Records';
import Users from './features/auth/Users';
import UserDetail from './features/auth/UserDetail';
import Profile from './features/auth/Profile';
import AuditLogs from './features/audit-logs/AuditLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/records/*" element={<Records />} />
            <Route path="/profile" element={<Profile />} />

            {/* Users: Super Admin and PM */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PM']} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/users/:userId" element={<UserDetail />} />
            </Route>
            {/* Audit logs: Super Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
