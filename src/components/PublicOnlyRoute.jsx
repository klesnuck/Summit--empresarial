import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para rutas exclusivas de usuarios no autenticados (como /login).
 * Si el usuario ya inició sesión, lo redirige a /mi-cuenta o a la ruta que intentaba acceder.
 */
export default function PublicOnlyRoute({ children, fallbackRedirect = '/mi-cuenta' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brandGold border-t-brandNavy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const targetPath = location.state?.from?.pathname || fallbackRedirect;
    return <Navigate to={targetPath} replace />;
  }

  return children ? children : <Outlet />;
}

