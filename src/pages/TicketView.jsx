import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { SummitAPI } from '../services/api';

export default function TicketView() {
  const { codigo } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!codigo) return;
      setLoading(true);
      const data = await SummitAPI.getTicketByCode(codigo);
      setTicket(data);
      setLoading(false);
    };

    fetchTicket();
  }, [codigo]);

  const ticketUrl = `${window.location.origin}/boleto/${encodeURIComponent(codigo || '')}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-brandGold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500">Cargando boleto...</p>
        </div>
      ) : !ticket ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
          <div className="text-4xl mb-2">❌</div>
          <h3 className="text-base font-bold text-gray-800">Boleto no encontrado</h3>
          <p className="text-xs text-gray-500 mt-1">El código no existe o fue escrito incorrectamente.</p>
          <Link to="/" className="inline-block mt-4 text-xs font-bold text-brandGold underline">
            Volver al Inicio
          </Link>
        </div>
      ) : (
        <div className="print-card bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center border border-gray-200">
          <div className="text-[10px] tracking-[4px] uppercase text-brandGold font-bold mb-1">
            Pase Oficial
          </div>
          <div className="text-2xl font-bold text-brandNavy font-serif">
            SUMMIT EMPRESARIAL
          </div>
          <div className="text-xs font-bold text-brandGold tracking-widest uppercase mb-4">
            MÉXICO
          </div>

          <div className="inline-block bg-brandGold/15 text-brandGold text-xs font-bold px-3 py-1 rounded-full mb-5">
            {ticket.tipo_acceso || 'Acceso Completo'}
          </div>

          <div className="text-left bg-gray-50 rounded-xl p-4 text-xs space-y-2 border border-gray-100">
            <p>
              <strong className="text-gray-500">Nombre:</strong>
              <span className="font-bold text-brandNavy ml-1">{ticket.nombre}</span>
            </p>
            <p>
              <strong className="text-gray-500">Apellidos:</strong>
              <span className="font-semibold text-gray-800 ml-1">{ticket.apellido_paterno} {ticket.apellido_materno || ''}</span>
            </p>
            <p>
              <strong className="text-gray-500">Correo:</strong>
              <span className="text-gray-700 ml-1">{ticket.correo}</span>
            </p>
            <p>
              <strong className="text-gray-500">Teléfono:</strong>
              <span className="text-gray-700 ml-1">{ticket.telefono}</span>
            </p>
            <p>
              <strong className="text-gray-500">Estado:</strong>
              <span className="text-emerald-700 font-bold ml-1">{ticket.estado_pago || 'PAGADO'}</span>
            </p>
          </div>

          <div className="mt-4 font-mono font-bold text-base text-brandNavy tracking-wider bg-gray-100 py-1.5 rounded-lg border border-gray-200">
            {ticket.codigo_boleto}
          </div>

          <div className="flex justify-center my-5">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG
                value={ticketUrl}
                size={180}
                level="H"
                fgColor="#0A1931"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Presenta este código QR en la entrada para ingresar al evento.
          </p>

          <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="w-full bg-brandNavy text-white hover:bg-brandNavyDark text-xs font-bold py-2.5 rounded-lg transition"
            >
              🖨️ Imprimir Boleto
            </button>
            <Link
              to="/mi-cuenta"
              className="w-full bg-gray-100 hover:bg-gray-200 text-brandNavy text-xs font-bold py-2.5 rounded-lg transition inline-flex items-center justify-center"
            >
              ← Mi Cuenta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

