import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigoBoleto, setCodigoBoleto] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/mi-cuenta');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const res = await login(correo, password);
    if (res.success) {
      navigate('/mi-cuenta');
    } else {
      setErrorMsg(res.error || 'Credenciales incorrectas.');
    }
  };

  const handleSearchCode = (e) => {
    e.preventDefault();
    if (!codigoBoleto.trim()) return;
    navigate(`/boleto/${encodeURIComponent(codigoBoleto.trim().toUpperCase())}`);
  };

  return (
    <div className="flex-grow flex flex-col">
      {/* Encabezado */}
      <section className="bg-brandNavy text-white py-12 px-6 border-b border-brandGold/20 text-center">
        <p className="text-xs font-medium tracking-wide text-brandGold/80">
          <Link to="/" className="hover:text-brandGold transition">Inicio</Link> · Portal del Asistente
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold mt-3 font-serif">
          Iniciar Sesión
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto mt-4 leading-relaxed">
          Ingresa a tu cuenta para visualizar, descargar o imprimir tus boletos de acceso.
        </p>
      </section>

      {/* Tarjeta de Login */}
      <main className="py-12 px-6 max-w-md mx-auto w-full flex-grow flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brandGold/15 text-brandNavy rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
              🎟️
            </div>
            <h2 className="text-xl font-bold text-brandNavy font-serif">Bienvenido Asistente</h2>
            <p className="text-xs text-gray-500 mt-1">
              Accede con el correo y contraseña que registraste al comprar tu boleto.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brandNavy text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-brandNavyDark transition flex justify-center items-center gap-2 text-sm mt-2 disabled:opacity-75"
            >
              {loading ? 'Verificando...' : 'Entrar a Mi Cuenta'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-semibold">O consulta directa</span></div>
          </div>

          {/* Búsqueda rápida por código */}
          <form onSubmit={handleSearchCode} className="space-y-2">
            <label className="block text-[11px] font-bold uppercase text-gray-500">
              Buscar por Código de Boleto:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. SUMMIT-AB12CD34"
                value={codigoBoleto}
                onChange={(e) => setCodigoBoleto(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono focus:ring-2 focus:ring-brandGold outline-none"
              />
              <button
                type="submit"
                className="bg-gray-100 hover:bg-gray-200 text-brandNavy text-xs font-bold px-3 py-2 rounded-lg transition whitespace-nowrap border"
              >
                Ver Boleto
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            ¿Aún no tienes boleto?
            <Link to="/registro" className="text-brandGold font-bold hover:underline ml-1">
              Comprar Boleto Aquí →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

