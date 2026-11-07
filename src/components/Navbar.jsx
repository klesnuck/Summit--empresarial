import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar el menú desplegable móvil cuando cambie de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white text-black sticky top-0 z-50 border-b border-brandGold/40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center">
        {/* Logos juntos (escalados para móvil y escritorio) */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <img
            src="/summit.PNG"
            alt="Summit Empresarial México"
            className="h-8 sm:h-10 md:h-14 w-auto object-contain"
          />
          <img
            src="/SUMMITBLANCO.jpeg"
            alt="Red Mundial de Jóvenes Políticos"
            className="h-7 sm:h-9 md:h-11 w-auto object-contain"
          />
        </Link>

        {/* Links de navegación escritorio (visibles desde 'md') */}
        <div className="space-x-4 lg:space-x-7 hidden md:flex font-semibold text-xs lg:text-sm text-black whitespace-nowrap items-center">
          <button onClick={() => handleScrollTo('inicio')} className="hover:text-brandGoldHover transition uppercase">INICIO</button>
          <button onClick={() => handleScrollTo('aliados')} className="hover:text-brandGoldHover transition uppercase">A CERCA DE</button>
          <button onClick={() => handleScrollTo('que-hacemos')} className="hover:text-brandGoldHover transition uppercase">CONFERENCISTAS</button>
          <button onClick={() => handleScrollTo('patrocinadores')} className="hover:text-brandGoldHover transition uppercase">PATROCINADORES</button>
          <button onClick={() => handleScrollTo('agenda')} className="hover:text-brandGoldHover transition uppercase">AGENDA</button>

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
              <Link to="/mi-cuenta" className="text-brandNavy font-bold hover:text-brandGoldHover transition flex items-center gap-1.5">
                <span>👤</span>
                <span>MI CUENTA ({(user.nombre || user.email || 'Asistente').split(' ')[0]})</span>
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-brandGoldHover text-brandNavy font-bold transition">
              INICIAR SESIÓN
            </Link>
          )}
        </div>

        {/* Acciones derecha: Botón de compra + Botón Hamburguesa móvil */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/registro"
            className="bg-brandGold text-brandNavy font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md text-xs sm:text-sm whitespace-nowrap shrink-0 hover:bg-brandGoldHover transition transform hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">COMPRA TUS BOLETOS AQUI!</span>
            <span className="sm:hidden text-xs">BOLETOS</span>
          </Link>

          {/* Botón de Menú Hamburguesa (visible solo en celulares/tablets) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="md:hidden p-2 rounded-lg text-brandNavy hover:bg-gray-100 transition focus:outline-none border border-gray-200 shrink-0"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-brandNavy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-brandNavy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (cuando se toca la hamburguesa) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-brandGold/40 shadow-2xl px-5 py-5 space-y-4 animate-fadeIn">
          {/* Navegación por secciones */}
          <div className="flex flex-col space-y-1 font-bold text-sm text-brandNavy">
            <button
              onClick={() => handleScrollTo('inicio')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center transition"
            >
              <span>INICIO</span>
              <span className="text-brandGold">→</span>
            </button>
            <button
              onClick={() => handleScrollTo('aliados')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center transition"
            >
              <span>A CERCA DE</span>
              <span className="text-brandGold">→</span>
            </button>
            <button
              onClick={() => handleScrollTo('que-hacemos')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center transition"
            >
              <span>CONFERENCISTAS</span>
              <span className="text-brandGold">→</span>
            </button>
            <button
              onClick={() => handleScrollTo('patrocinadores')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center transition"
            >
              <span>PATROCINADORES</span>
              <span className="text-brandGold">→</span>
            </button>
            <button
              onClick={() => handleScrollTo('agenda')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center transition"
            >
              <span>AGENDA</span>
              <span className="text-brandGold">→</span>
            </button>
          </div>

          {/* Sección de Usuario / Cuenta en Móvil */}
          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-2.5">
                <Link
                  to="/mi-cuenta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-brandGold/15 border border-brandGold/40 text-brandNavy font-bold px-4 py-3 rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 font-semibold">Sesión Activa</p>
                      <p className="text-xs font-bold">{user.nombre || user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brandGold bg-brandNavy px-2.5 py-1 rounded-lg">
                    Ver Boletos
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition border border-red-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full bg-brandNavy text-white font-bold py-3 rounded-xl text-xs hover:bg-brandNavyDark transition shadow-md"
                >
                  INICIAR SESIÓN (PORTAL ASISTENTE)
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full text-xs text-gray-500 hover:text-brandNavy py-1 font-semibold transition"
                >
                  💼 Acceso a Organizadores (/admin)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
