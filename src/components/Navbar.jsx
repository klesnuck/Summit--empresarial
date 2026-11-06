import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white text-black sticky top-0 z-50 border-b border-brandGold/40 shadow-lg">
      <div className="w-full pl-6 pr-3 md:pr-6 py-4 flex justify-between items-center">
        {/* Logos juntos */}
        <Link to="/" className="flex items-center space-x-4">
          <img src="/summit.PNG" alt="Summit Empresarial México" className="h-12 md:h-16 w-auto object-contain" />
          <img src="/SUMMITBLANCO.jpeg" alt="Red Mundial de Jóvenes Políticos" className="h-10 md:h-12 w-auto object-contain" />
        </Link>

        {/* Links de navegación escritorio */}
        <div className="space-x-5 lg:space-x-8 hidden md:flex font-medium text-sm text-black whitespace-nowrap items-center">
          <button onClick={() => handleScrollTo('inicio')} className="hover:text-brandGoldHover transition font-medium">INICIO</button>
          <button onClick={() => handleScrollTo('aliados')} className="hover:text-brandGoldHover transition font-medium">A CERCA DE</button>
          <button onClick={() => handleScrollTo('que-hacemos')} className="hover:text-brandGoldHover transition font-medium">CONFERENCISTAS</button>
          <button onClick={() => handleScrollTo('patrocinadores')} className="hover:text-brandGoldHover transition font-medium">PATROCINADORES</button>
          <button onClick={() => handleScrollTo('agenda')} className="hover:text-brandGoldHover transition font-medium">AGENDA</button>

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
              <Link to="/mi-cuenta" className="text-brandNavy font-bold hover:text-brandGoldHover transition flex items-center gap-1.5">
                <span>👤</span>
                <span>MI CUENTA ({(user.nombre || user.email || 'Asistente').split(' ')[0]})</span>
              </Link>
              <button onClick={logout} className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-brandGoldHover text-brandNavy font-bold transition">
              INICIAR SESIÓN
            </Link>
          )}
        </div>

        {/* Botón de compra / móvil */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/mi-cuenta" className="md:hidden text-xs font-bold text-brandNavy bg-brandGold/20 px-2.5 py-1.5 rounded">
              Mi Boleto
            </Link>
          ) : (
            <Link to="/login" className="md:hidden text-xs font-bold text-brandNavy px-2 py-1">
              Acceder
            </Link>
          )}

          <Link
            to="/registro"
            className="bg-brandGold text-brandNavy font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-lg shadow-md text-xs md:text-sm whitespace-nowrap shrink-0 hover:bg-brandGoldHover transition transform hover:-translate-y-0.5"
          >
            COMPRA TUS BOLETOS AQUI!
          </Link>
        </div>
      </div>
    </nav>
  );
}

