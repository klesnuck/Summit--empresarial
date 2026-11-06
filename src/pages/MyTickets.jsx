import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { SummitAPI } from '../services/api';

export default function MyTickets() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadTickets = async () => {
      setLoading(true);
      const data = await SummitAPI.getUserTickets(user.correo || user.email);
      setTickets(data || []);
      setLoading(false);
    };

    loadTickets();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex-grow">
      {/* Encabezado */}
      <header className="bg-brandNavy text-white py-10 px-6 border-b border-brandGold/20 text-center no-print">
        <p className="text-xs font-medium tracking-wide text-brandGold/80">
          <Link to="/" className="hover:text-brandGold transition">Inicio</Link> · Portal Asistente
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2 font-serif">
          Mis Boletos de Acceso
        </h1>
        <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto mt-2 leading-relaxed">
          Aquí puedes consultar tu boleto digital, mostrarlo desde tu celular al ingresar al evento o descargarlo en PDF.
        </p>

        <div className="mt-4 flex justify-center items-center gap-4 text-xs">
          <span className="text-brandGold font-semibold">👤 {user.nombre} ({user.correo})</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-red-300 hover:text-red-100 underline transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brandGold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">Cargando tus boletos...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md mx-auto">
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="text-xl font-bold text-brandNavy font-serif">Aún no tienes boletos registrados</h3>
            <p className="text-xs text-gray-500 mt-2">
              Asegura tu lugar en el evento empresarial más importante de México.
            </p>
            <Link
              to="/registro"
              className="inline-block mt-6 bg-brandNavy hover:bg-brandNavyDark text-white font-bold px-6 py-2.5 rounded-lg transition text-sm"
            >
              Comprar Boleto Ahora
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {tickets.map((boleto) => {
              const ticketUrl = `${window.location.origin}/boleto/${encodeURIComponent(boleto.codigo_boleto)}`;

              return (
                <div
                  key={boleto.id || boleto.codigo_boleto}
                  className="print-card bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-lg mx-auto relative"
                >
                  {/* Cabecera del Boleto */}
                  <div className="bg-brandNavy text-white p-6 text-center border-b-4 border-brandGold relative">
                    <span className="text-[10px] tracking-[4px] uppercase text-brandGold font-bold">Pase Oficial</span>
                    <h2 className="text-2xl font-bold tracking-wider mt-1 font-serif">SUMMIT EMPRESARIAL</h2>
                    <h3 className="text-xs font-bold text-brandGold tracking-widest uppercase">MÉXICO</h3>
                    <div className="mt-3 inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold border border-brandGold/40 text-brandGold">
                      {boleto.tipo_acceso || 'Acceso Completo'}
                    </div>
                  </div>

                  {/* Cuerpo del Boleto */}
                  <div className="p-8 text-center">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 text-xs">
                      <span className="text-gray-500">Estado del Boleto:</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                        ✓ {boleto.estado_pago || 'PAGADO'}
                      </span>
                    </div>

                    <div className="text-left bg-gray-50 rounded-2xl p-5 mb-6 space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Asistente:</span>
                        <span className="font-bold text-brandNavy">{boleto.nombre} {boleto.apellido_paterno} {boleto.apellido_materno || ''}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Correo:</span>
                        <span className="font-semibold text-gray-700">{boleto.correo}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Teléfono:</span>
                        <span className="font-semibold text-gray-700">{boleto.telefono}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500 font-medium">Código Único:</span>
                        <span className="font-mono font-bold text-brandNavy bg-white px-2 py-0.5 rounded border border-gray-200">{boleto.codigo_boleto}</span>
                      </div>
                    </div>

                    {/* QR Code generado dinámicamente con qrcode.react */}
                    <div className="py-2 flex flex-col items-center justify-center">
                      <div className="p-3 bg-white border-2 border-brandNavy rounded-2xl shadow-md inline-block">
                        <QRCodeSVG
                          value={ticketUrl}
                          size={180}
                          level="H"
                          fgColor="#0A1931"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-3 font-medium">
                        Escanea o presenta este código QR en la entrada del evento.
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 no-print">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-brandNavy hover:bg-brandNavyDark text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <span>🖨️ Imprimir / Guardar PDF</span>
                      </button>
                      <Link
                        to={`/boleto/${encodeURIComponent(boleto.codigo_boleto)}`}
                        target="_blank"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-brandNavy font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-gray-300"
                      >
                        <span>🔍 Pantalla Completa</span>
                      </Link>
                    </div>
                  </div>

                  {/* Cinta decorativa inferior */}
                  <div className="h-2 bg-gradient-to-r from-brandNavy via-brandGold to-brandNavy"></div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

