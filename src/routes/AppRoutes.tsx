import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Lazy-loaded page components for route-based code splitting
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CreateOrder = lazy(() => import('../pages/CreateOrder'));
const Orders = lazy(() => import('../pages/Orders'));
const Products = lazy(() => import('../pages/Products'));
const Banners = lazy(() => import('../pages/Banners'));
const Rewards = lazy(() => import('../pages/Rewards'));
const Customers = lazy(() => import('../pages/Customers'));
const Settings = lazy(() => import('../pages/Settings'));

// Lightweight fallback for fast screen transitions
const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-2 border-[#7a4900]/20 border-t-[#3d2500] rounded-full animate-spin"></div>
      <p className="text-[11px] font-mono text-[#7a4900] uppercase tracking-wider">Loading...</p>
    </div>
  </div>
);

// Route Guards
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#F6F1EB] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#7a4900]/20 border-t-[#3d2500] rounded-full animate-spin"></div>
      <p className="text-xs text-[#7a4900] font-medium tracking-wide">Loading Session...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
    </Suspense>
  );
};


