import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return <Outlet />;
};

export default AdminRoute;
