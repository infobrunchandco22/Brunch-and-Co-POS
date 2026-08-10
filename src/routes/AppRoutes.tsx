import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { CreateOrder } from '../pages/CreateOrder';
import { Orders } from '../pages/Orders';
import { Products } from '../pages/Products';
import { Banners } from '../pages/Banners';
import { Rewards } from '../pages/Rewards';
import { Customers } from '../pages/Customers';
import { Settings } from '../pages/Settings';

import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Route Guards
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#fab895]/20 border-t-[#fab895] rounded-full animate-spin"></div>
      <p className="text-xs text-[#9f8d85] font-medium tracking-wide">Loading Session...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, session } = useAuth();
  console.log('[ProtectedRoute] render:', { loading, user: user?.full_name, role: user?.role, hasSession: !!session, pathname: window.location.pathname });
  if (loading) {
    console.log('[ProtectedRoute] Decision: Rendering LoadingScreen');
    return <LoadingScreen />;
  }
  if (!user) {
    console.log('[ProtectedRoute] Decision: Redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  console.log('[ProtectedRoute] Decision: Rendering Protected Children');
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading, session } = useAuth();
  console.log('[AdminRoute] render:', { loading, user: user?.full_name, role, hasSession: !!session, pathname: window.location.pathname });
  if (loading) {
    console.log('[AdminRoute] Decision: Rendering LoadingScreen');
    return <LoadingScreen />;
  }
  if (!user) {
    console.log('[AdminRoute] Decision: Redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    console.log('[AdminRoute] Decision: Not admin, Redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  console.log('[AdminRoute] Decision: Rendering Admin Children');
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, session } = useAuth();
  console.log('[PublicOnlyRoute] render:', { loading, user: user?.full_name, hasSession: !!session, pathname: window.location.pathname });
  if (loading) {
    console.log('[PublicOnlyRoute] Decision: Rendering LoadingScreen');
    return <LoadingScreen />;
  }
  if (user) {
    console.log('[PublicOnlyRoute] Decision: User logged in, Redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  console.log('[PublicOnlyRoute] Decision: Rendering Public Children');
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Root & Shared Staff & Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <CreateOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/banners"
        element={
          <AdminRoute>
            <Banners />
          </AdminRoute>
        }
      />
      <Route
        path="/rewards"
        element={
          <AdminRoute>
            <Rewards />
          </AdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

