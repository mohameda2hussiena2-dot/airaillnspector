import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HasRoleProps {
  roles: ('admin' | 'editor' | 'viewer')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasRole({ roles, children, fallback = null }: HasRoleProps) {
  const { hasRole } = useAuth();
  
  if (hasRole(roles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
