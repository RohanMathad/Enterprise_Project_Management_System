import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Role } from '../types/global.types';

interface RoleGuardProps {
  allowedRoles: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    // You could also redirect to a 403 page or dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
