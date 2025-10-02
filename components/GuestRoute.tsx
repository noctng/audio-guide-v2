import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { guest, loading } = useGuest();

  if (loading) {
    return <div className="text-center mt-8">Verifying session...</div>;
  }

  if (!guest) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;