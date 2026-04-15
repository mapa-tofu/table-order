import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './common/ProtectedRoute';
import { SSEProvider } from './common/SSEProvider';

// Customer pages
import TableAuth from './customer/TableAuth';
import MenuBrowser from './customer/MenuBrowser';
import Cart from './customer/Cart';
import OrderCreate from './customer/OrderCreate';
import OrderSuccess from './customer/OrderSuccess';
import OrderHistory from './customer/OrderHistory';

// Admin pages
import AdminAuth from './admin/AdminAuth';
import OrderDashboard from './admin/OrderDashboard';
import TableManager from './admin/TableManager';
import MenuManager from './admin/MenuManager';

function App() {
  const type = useAuthStore((s) => s.type);

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            type === 'table' ? (
              <Navigate to="/customer/menu" replace />
            ) : type === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/customer/setup" replace />
            )
          }
        />

        {/* Customer routes */}
        <Route path="/customer/setup" element={<TableAuth />} />
        <Route
          path="/customer/menu"
          element={
            <ProtectedRoute requiredType="table" redirectTo="/customer/setup">
              <SSEProvider endpoint="/api/customer/sse">
                <MenuBrowser />
              </SSEProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/cart"
          element={
            <ProtectedRoute requiredType="table" redirectTo="/customer/setup">
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/order"
          element={
            <ProtectedRoute requiredType="table" redirectTo="/customer/setup">
              <OrderCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/order/success"
          element={
            <ProtectedRoute requiredType="table" redirectTo="/customer/setup">
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute requiredType="table" redirectTo="/customer/setup">
              <SSEProvider endpoint="/api/customer/sse">
                <OrderHistory />
              </SSEProvider>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredType="admin" redirectTo="/admin/login">
              <SSEProvider endpoint="/api/admin/sse">
                <OrderDashboard />
              </SSEProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute requiredType="admin" redirectTo="/admin/login">
              <TableManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menus"
          element={
            <ProtectedRoute requiredType="admin" redirectTo="/admin/login">
              <MenuManager />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
