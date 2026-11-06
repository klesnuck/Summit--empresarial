import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import TicketView from './pages/TicketView';
import AdminPanel from './pages/AdminPanel';

function Layout({ children }) {
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/boleto/') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      {!isStandalone && <Navbar />}
      <div className="flex-grow">{children}</div>
      {!isStandalone && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <Layout>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/boleto/:codigo" element={<TicketView />} />

              {/* Ruta exclusiva para usuarios no autenticados */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />

              {/* Rutas Protegidas para Asistentes Autenticados (Supabase Auth) */}
              <Route
                path="/mi-cuenta"
                element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mis-boletos"
                element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />

              {/* Ruta para Panel de Administración y Staff */}
              <Route path="/admin" element={<AdminPanel />} />

              {/* Fallback 404 */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
