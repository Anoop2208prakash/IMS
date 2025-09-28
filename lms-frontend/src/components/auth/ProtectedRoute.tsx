import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define the props type to accept children
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show a loading indicator while the context is checking the session
  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // If loading is finished and there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a user is logged in, render the children passed to the component
  return <>{children}</>;
};

export default ProtectedRoute;