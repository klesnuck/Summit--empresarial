import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación con Supabase Auth.
 *
 * Props:
 * - children: Componente a renderizar (opcional si se usa con <Outlet />)
 * - requireAdmin: Si es true, requiere rol administrativo o PIN de staff
 * - fallbackRedirect: Ruta a redirigir si no está autorizado (por defecto /login)
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
  fallbackRedirect = '/login',
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Mientras Supabase verifica el token / sesión en localStorage, mostrar pantalla de carga elegante
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 border-4 border-brandGold border-t-brandNavy rounded-full animate-spin mb-4"></div>
          <h2 className="text-base font-bold text-brandNavy font-serif">Verificando Credenciales...</h2>
          <p className="text-xs text-gray-500 mt-1">Conectando con Supabase Auth de forma segura</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login guardando la ubicación actual para volver después
  if (!user) {
    return <Navigate to={fallbackRedirect} state={{ from: location }} replace />;
  }

  // Si requiere rol de administrador y no lo cumple
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 flex flex-col items-center max-w-md text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4">
            🔒
          </div>
          <h2 className="text-xl font-bold text-brandNavy font-serif">Acceso Restringido</h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Esta sección está reservada exclusivamente para el comité organizador y staff administrativo del Summit Empresarial México.
          </p>
          <div className="mt-6 flex gap-3">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  // Si todo es válido, renderizar los componentes hijos o el Outlet de React Router
  return children ? children : <Outlet />;
}

