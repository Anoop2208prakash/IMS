// src/components/auth/RoleProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user } = useAuth();

  // If user is logged in and their role is in the allowed list, grant access
  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // If user is logged in but has the wrong role, send them to the dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If no user, send them to login
  return <Navigate to="/login" replace />;
};

export default RoleProtectedRoute;