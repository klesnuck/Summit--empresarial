import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SummitAPI } from '../services/api';

export default function StaffValidator() {
  const { codigo: paramCodigo } = useParams();
  const [codigoInput, setCodigoInput] = useState(paramCodigo || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  const checkTicket = async (codeToCheck) => {
    if (!codeToCheck) return;
    setLoading(true);
    setErrorNotFound(false);
    setCheckinSuccess(false);

    const data = await SummitAPI.getTicketByCode(codeToCheck);
    setLoading(false);

    if (data) {
      setTicket(data);
    } else {
      setTicket(null);
      setErrorNotFound(true);
    }
  };

  useEffect(() => {
    if (paramCodigo) {
      checkTicket(paramCodigo);
    }
  }, [paramCodigo]);

  const handleSearch = (e) => {
    e.preventDefault();
    checkTicket(codigoInput);
  };

  const handleCheckIn = async () => {
    if (!ticket) return;
    const res = await SummitAPI.markTicketUsed(ticket.codigo_boleto);
    if (res.success) {
      setCheckinSuccess(true);
      setTicket({ ...ticket, usado: 1 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 flex flex-col items-center justify-center">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-[10px] tracking-widest uppercase font-bold text-brandGold bg-brandNavy px-3 py-1 rounded-full">
            Control de Acceso Staff
          </span>
          <h1 className="text-xl font-bold text-brandNavy mt-3 font-serif">Summit Empresarial México</h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            placeholder="Código: SUMMIT-XXXXXX"
            className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono focus:ring-2 focus:ring-brandNavy outline-none"
          />
          <button
            type="submit"
            className="bg-brandNavy text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brandNavyDark transition"
          >
            Verificar
          </button>
        </form>

        {loading && (
          <div className="py-8">
            <div className="w-8 h-8 border-4 border-brandGold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Comprobando boleto...</p>
          </div>
        )}

        {errorNotFound && (
          <div className="py-6 text-center">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="text-sm font-bold text-red-600">Boleto Inválido o No Encontrado</h3>
            <p className="text-xs text-gray-500 mt-1">El código no existe en los registros oficiales.</p>
          </div>
        )}

        {ticket && (
          <div className="text-left bg-gray-50 p-5 rounded-xl border border-gray-200 text-xs space-y-3">
            {checkinSuccess || ticket.usado === 1 ? (
              <div className="text-center py-2 px-3 rounded-lg font-bold text-sm mb-3 bg-amber-100 text-amber-800 border border-amber-300">
                ⚠️ BOLETO YA UTILIZADO (REGISTRADO)
              </div>
            ) : (
              <div className="text-center py-2 px-3 rounded-lg font-bold text-sm mb-3 bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✅ BOLETO VÁLIDO PARA INGRESAR
              </div>
            )}

            <p><strong className="text-gray-500">Asistente:</strong> <span className="font-bold text-brandNavy">{ticket.nombre} {ticket.apellido_paterno} {ticket.apellido_materno || ''}</span></p>
            <p><strong className="text-gray-500">Correo:</strong> <span>{ticket.correo}</span></p>
            <p><strong className="text-gray-500">Teléfono:</strong> <span>{ticket.telefono}</span></p>
            <p><strong className="text-gray-500">Código:</strong> <span className="font-mono font-bold">{ticket.codigo_boleto}</span></p>
            <p><strong className="text-gray-500">Tipo de Pase:</strong> <span className="font-semibold text-brandGold">{ticket.tipo_acceso || 'Acceso Completo'}</span></p>

            {ticket.usado !== 1 && !checkinSuccess && (
              <button
                onClick={handleCheckIn}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition text-xs shadow"
              >
                Marcar como Ingresado (Check-in)
              </button>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-brandNavy transition">
            ← Ir al portal público
          </Link>
        </div>
      </div>
    </div>
  );
}

