import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <>{fallback ?? <div>Please login</div>}</>;
  return <>{children}</>;
}

