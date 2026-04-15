import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'table' | 'admin';
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredType, redirectTo }: ProtectedRouteProps) {
  const { token, type } = useAuthStore();

  if (!token) {
    return <Navigate to={redirectTo || '/'} replace />;
  }

  if (requiredType && type !== requiredType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
