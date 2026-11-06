import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { SummitAPI } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const {
    content,
    updateHero,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    updateAbout,
    updateTicketConfig,
    resetToDefaults
  } = useContent();

  // Autenticación de Admin (por Supabase Auth o credenciales directas de organizador)
  const [adminUsername, setAdminUsername] = useState(() => {
    return localStorage.getItem('summit_admin_user') || 'Administrador';
  });
  const [pinAuthenticated, setPinAuthenticated] = useState(() => {
    return localStorage.getItem('summit_admin_logged') === 'true';
  });
  const isAuthenticated = isAdmin || pinAuthenticated;

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Pestaña activa
  const [activeTab, setActiveTab] = useState('asistentes'); // 'asistentes', 'agenda', 'conferencistas', 'patrocinadores', 'general'

  // Datos de asistentes / boletos
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Estados para modales / formularios de edición
  const [agendaDay, setAgendaDay] = useState(1);
  const [editingAgenda, setEditingAgenda] = useState(null); // null o { day, item }
  const [agendaForm, setAgendaForm] = useState({ time: '', title: '', description: '' });

  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerForm, setSpeakerForm] = useState({ name: '', title: '', photo: '/invitado.png' });

  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({ name: '', logo: '/proximamente.png' });

  // Mensaje flotante de guardado
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const rawUser = usernameInput.trim();
    const normalizedUser = rawUser
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const pass = passwordInput.trim();

    // 1. Verificación directa de las credenciales autorizadas de Antonio Rincón
    const isTonyUser =
      normalizedUser === 'antonio rincon' ||
      normalizedUser === 'antonio' ||
      normalizedUser === 'antoniorincon' ||
      normalizedUser === 'antonio.rincon' ||
      normalizedUser.includes('antonio') ||
      rawUser.toLowerCase() === 'antonio.rincon@summitempresarial.com' ||
      rawUser.toLowerCase() === 'admin';

    const isTonyPassword =
      pass === 'SummitCDMX2026Tony' ||
      pass === 'admin2026';

    if (isTonyUser && isTonyPassword) {
      setPinAuthenticated(true);
      setAdminUsername('Antonio Rincón');
      localStorage.setItem('summit_admin_logged', 'true');
      localStorage.setItem('summit_admin_user', 'Antonio Rincón');
      setLoginLoading(false);
      return;
    }

    // 2. Verificación alternativa con Supabase Auth si se ingresa correo de Supabase
    if (isSupabaseConfigured() && supabase && rawUser.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: rawUser.toLowerCase(),
          password: pass,
        });

        if (!error && data?.user) {
          const name = data.user.user_metadata?.nombre || 'Antonio Rincón';
          setPinAuthenticated(true);
          setAdminUsername(name);
          localStorage.setItem('summit_admin_logged', 'true');
          localStorage.setItem('summit_admin_user', name);
          setLoginLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error intentando login admin en Supabase:', err);
      }
    }

    setLoginLoading(false);
    setLoginError('Usuario o contraseña incorrectos. Verifica tus credenciales de organizador.');
  };

  const handleAdminLogout = () => {
    setPinAuthenticated(false);
    localStorage.removeItem('summit_admin_logged');
    localStorage.removeItem('summit_admin_user');
  };

  // Cargar boletos
  const loadTickets = async () => {
    setLoadingTickets(true);
    const data = await SummitAPI.getAllTickets();
    setTickets(data);
    setLoadingTickets(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  // Actualizar estado de pago
  const handleTogglePayment = async (codigo, currentStatus) => {
    const newStatus = currentStatus === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
    await SummitAPI.updateTicketPaymentStatus(codigo, newStatus);
    showToast(`Estado de ${codigo} actualizado a ${newStatus}`);
    loadTickets();
  };

  // Eliminar boleto
  const handleDeleteTicket = async (codigo) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${codigo}?`)) {
      await SummitAPI.deleteTicket(codigo);
      showToast('Registro eliminado exitosamente');
      loadTickets();
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) {
      alert('No hay asistentes registrados para exportar.');
      return;
    }

    const headers = ['Código', 'Nombre', 'Apellidos', 'Correo', 'Teléfono', 'Precio', 'Moneda', 'Estado Pago', 'Fecha'];
    const rows = tickets.map(t => [
      t.codigo_boleto,
      `"${t.nombre}"`,
      `"${t.apellido_paterno} ${t.apellido_materno || ''}"`,
      t.correo,
      `"${t.telefono}"`,
      t.precio || 350,
      t.moneda || 'MXN',
      t.estado_pago || 'PAGADO',
      t.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asistentes_summit_empresarial_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper para subir fotos en base64
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
      showToast('Imagen cargada');
    };
    reader.readAsDataURL(file);
  };

  // Guardar actividad en Agenda
  const handleSaveAgenda = (e) => {
    e.preventDefault();
    if (!agendaForm.time || !agendaForm.title) return;

    if (editingAgenda && editingAgenda.item) {
      updateAgendaItem(editingAgenda.day, editingAgenda.item.id, agendaForm);
      showToast('Actividad actualizada');
    } else {
      addAgendaItem(agendaDay, agendaForm);
      showToast('Actividad agregada a la agenda');
    }
    setEditingAgenda(null);
    setAgendaForm({ time: '', title: '', description: '' });
  };

  // Guardar Conferencista
  const handleSaveSpeaker = (e) => {
    e.preventDefault();
    if (!speakerForm.name) return;

    if (editingSpeaker) {
      updateSpeaker(editingSpeaker.id, speakerForm);
      showToast('Conferencista actualizado');
    } else {
      addSpeaker(speakerForm);
      showToast('Nuevo conferencista agregado');
    }
    setEditingSpeaker(null);
    setSpeakerForm({ name: '', title: '', photo: '/invitado.png' });
  };

  // Guardar Patrocinador
  const handleSaveSponsor = (e) => {
    e.preventDefault();
    if (!sponsorForm.name) return;

    if (editingSponsor) {
      updateSponsor(editingSponsor.id, sponsorForm);
      showToast('Patrocinador actualizado');
    } else {
      addSponsor(sponsorForm);
      showToast('Nuevo patrocinador agregado');
    }
    setEditingSponsor(null);
    setSponsorForm({ name: '', logo: '/proximamente.png' });
  };

  // Filtrado de boletos
  const filteredTickets = tickets.filter(t => {
    const query = searchQuery.toLowerCase();
    const fullName = `${t.nombre} ${t.apellido_paterno} ${t.apellido_materno || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(query) || (t.correo && t.correo.toLowerCase().includes(query)) || (t.codigo_boleto && t.codigo_boleto.toLowerCase().includes(query));
    const matchesStatus = filterStatus === 'TODOS' || (t.estado_pago || 'PAGADO') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Métricas
  const totalRecaudado = tickets.filter(t => (t.estado_pago || 'PAGADO') === 'PAGADO').length * (content.ticket?.price || 350);
  const totalPagados = tickets.filter(t => (t.estado_pago || 'PAGADO') === 'PAGADO').length;

  // Si no está autenticado, mostrar pantalla de inicio de sesión de organizador (estilo limpio)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        {/* Encabezado elegante */}
        <section className="bg-brandNavy text-white py-12 px-6 border-b border-brandGold/20 text-center">
          <p className="text-xs font-medium tracking-wide text-brandGold/80">
            <Link to="/" className="hover:text-brandGold transition">Inicio</Link> · Portal del Organizador
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-3 font-serif">
            Control Center
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto mt-4 leading-relaxed">
            Acceso exclusivo para el comité organizador y staff de Summit Empresarial México.
          </p>
        </section>

        {/* Tarjeta de Login limpia */}
        <main className="py-12 px-6 max-w-md mx-auto w-full flex-grow flex items-center justify-center">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brandGold/15 text-brandNavy rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                💼
              </div>
              <h2 className="text-xl font-bold text-brandNavy font-serif">Bienvenido Organizador</h2>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa tus credenciales autorizadas para gestionar el evento.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4 text-center font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Usuario o correo"
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
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-brandNavy text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-brandNavyDark transition flex justify-center items-center gap-2 text-sm mt-2 disabled:opacity-75"
              >
                {loginLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verificando...</span>
                  </>
                ) : (
                  'Ingresar al Panel de Control'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <Link to="/" className="text-brandGold font-bold hover:underline">
                ← Volver al Sitio
              </Link>
              <Link to="/login" className="text-gray-500 hover:text-brandNavy transition hover:underline">
                Portal Asistente →
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
          Summit Empresarial México · Sistema de Administración Seguro
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toast de notificación */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brandNavy text-brandGold font-bold px-5 py-3 rounded-xl shadow-2xl border border-brandGold/50 flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Barra superior de administración */}
      <header className="bg-brandNavy text-white px-6 py-4 border-b border-brandGold/30 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="bg-brandGold text-brandNavy font-extrabold px-2.5 py-1 rounded text-xs tracking-wider uppercase">
            ADMIN
          </span>
          <h1 className="text-lg md:text-xl font-bold font-serif text-white">
            Summit Empresarial México · Control Center
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="hidden sm:inline-block bg-white/10 text-brandGold px-3 py-1.5 rounded-lg border border-brandGold/30 font-semibold">
            👤 {adminUsername || 'Administrador'}
          </span>
          <Link
            to="/"
            target="_blank"
            className="bg-white/10 hover:bg-white/20 text-brandGold px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold"
          >
            <span>👁️</span>
            <span>Ver Sitio en Vivo</span>
          </Link>
          <button
            onClick={handleAdminLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto flex space-x-2 md:space-x-8 text-xs md:text-sm font-bold">
          <button
            onClick={() => setActiveTab('asistentes')}
            className={`py-4 px-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'asistentes'
                ? 'border-brandGold text-brandNavy font-bold'
                : 'border-transparent text-gray-500 hover:text-brandNavy'
            }`}
          >
            <span>👥</span>
            <span>Asistentes ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`py-4 px-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'agenda'
                ? 'border-brandGold text-brandNavy font-bold'
                : 'border-transparent text-gray-500 hover:text-brandNavy'
            }`}
          >
            <span>📅</span>
            <span>Editar Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('conferencistas')}
            className={`py-4 px-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'conferencistas'
                ? 'border-brandGold text-brandNavy font-bold'
                : 'border-transparent text-gray-500 hover:text-brandNavy'
            }`}
          >
            <span>🎤</span>
            <span>Conferencistas y Fotos</span>
          </button>

          <button
            onClick={() => setActiveTab('patrocinadores')}
            className={`py-4 px-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'patrocinadores'
                ? 'border-brandGold text-brandNavy font-bold'
                : 'border-transparent text-gray-500 hover:text-brandNavy'
            }`}
          >
            <span>🤝</span>
            <span>Patrocinadores</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-brandGold text-brandNavy font-bold'
                : 'border-transparent text-gray-500 hover:text-brandNavy'
            }`}
          >
            <span>⚙️</span>
            <span>Contenido y Textos</span>
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow">
        {/* ============================================================== */}
        {/* PESTAÑA 1: ASISTENTES REGISTRADOS                              */}
        {/* ============================================================== */}
        {activeTab === 'asistentes' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-xs font-bold uppercase text-gray-400">Total Asistentes</span>
                <p className="text-2xl md:text-3xl font-extrabold text-brandNavy mt-1">{tickets.length}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-xs font-bold uppercase text-gray-400">Boletos Pagados</span>
                <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">{totalPagados}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-xs font-bold uppercase text-gray-400">Total Recaudado</span>
                <p className="text-2xl md:text-3xl font-extrabold text-brandGold mt-1">
                  ${totalRecaudado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-gray-400 ml-1">MXN</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-xs font-bold uppercase text-gray-400">Precio Boleto</span>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-1">
                  ${content.ticket?.price?.toFixed(2) || '350.00'}
                </p>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, correo o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-brandGold w-full md:w-80"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold outline-none bg-white"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="PAGADO">Solo PAGADOS</option>
                  <option value="PENDIENTE">Solo PENDIENTES</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadTickets}
                  className="bg-gray-100 hover:bg-gray-200 text-brandNavy px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  🔄 Refrescar
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-brandNavy hover:bg-brandNavyDark text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                >
                  📥 Exportar a Excel (CSV)
                </button>
              </div>
            </div>

            {/* Tabla de Asistentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingTickets ? (
                <div className="text-center py-12 text-sm text-gray-500">Cargando asistentes...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm font-bold text-gray-700">No se encontraron asistentes</p>
                  <p className="text-xs text-gray-400 mt-1">Los asistentes aparecerán aquí en cuanto compren o se registren.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-3.5 px-4">Código</th>
                        <th className="py-3.5 px-4">Asistente</th>
                        <th className="py-3.5 px-4">Contacto</th>
                        <th className="py-3.5 px-4">Precio</th>
                        <th className="py-3.5 px-4">Estado Pago</th>
                        <th className="py-3.5 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTickets.map((boleto) => (
                        <tr key={boleto.id || boleto.codigo_boleto} className="hover:bg-gray-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-brandNavy">
                            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {boleto.codigo_boleto}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900">{boleto.nombre} {boleto.apellido_paterno} {boleto.apellido_materno || ''}</p>
                            <p className="text-[11px] text-gray-400">{boleto.tipo_acceso || 'Acceso Completo'}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-gray-700">{boleto.correo}</p>
                            <p className="text-[11px] text-gray-400">{boleto.telefono}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-800">
                            ${(boleto.precio || 350).toFixed(2)} MXN
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePayment(boleto.codigo_boleto, boleto.estado_pago || 'PAGADO')}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                                (boleto.estado_pago || 'PAGADO') === 'PAGADO'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                              }`}
                              title="Haz clic para alternar estado"
                            >
                              {(boleto.estado_pago || 'PAGADO') === 'PAGADO' ? '✓ PAGADO' : '⏳ PENDIENTE'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-2">
                            <Link
                              to={`/boleto/${encodeURIComponent(boleto.codigo_boleto)}`}
                              target="_blank"
                              className="text-brandNavy hover:text-brandGold font-bold text-xs underline"
                            >
                              Ver Boleto
                            </Link>
                            <button
                              onClick={() => handleDeleteTicket(boleto.codigo_boleto)}
                              className="text-red-600 hover:text-red-800 font-bold text-xs ml-2"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: EDITAR AGENDA                                       */}
        {/* ============================================================== */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-brandNavy font-serif">Gestor de Agenda del Evento</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega, edita o elimina las ponencias y horarios que se muestran en el sitio web en tiempo real.
                </p>
              </div>

              {/* Selector de Día */}
              <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setAgendaDay(1)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    agendaDay === 1 ? 'bg-brandNavy text-white shadow' : 'text-gray-600 hover:text-brandNavy'
                  }`}
                >
                  Día 1 ({content.agendaDia1.length} actividades)
                </button>
                <button
                  onClick={() => setAgendaDay(2)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    agendaDay === 2 ? 'bg-brandNavy text-white shadow' : 'text-gray-600 hover:text-brandNavy'
                  }`}
                >
                  Día 2 ({content.agendaDia2.length} actividades)
                </button>
              </div>
            </div>

            {/* Formulario para agregar / editar actividad */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brandNavy mb-4">
                {editingAgenda ? `✏️ Editar Actividad (${editingAgenda.item.title})` : `➕ Agregar Nueva Actividad al Día ${agendaDay}`}
              </h3>

              <form onSubmit={handleSaveAgenda} className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Horario (ej. 10:00 - 11:00)</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 - 10:00"
                    value={agendaForm.time}
                    onChange={(e) => setAgendaForm({ ...agendaForm, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Título de la Ponencia / Actividad</label>
                  <input
                    type="text"
                    required
                    placeholder="Conferencia Magistral..."
                    value={agendaForm.title}
                    onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Descripción / Detalles</label>
                  <input
                    type="text"
                    placeholder="Ponente, sala o detalles..."
                    value={agendaForm.description}
                    onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  {editingAgenda && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAgenda(null);
                        setAgendaForm({ time: '', title: '', description: '' });
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow transition"
                  >
                    {editingAgenda ? 'Guardar Cambios' : 'Agregar Actividad'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista actual de actividades */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brandNavy mb-4">
                Programa Actual - Día {agendaDay}
              </h3>

              <div className="divide-y divide-gray-100">
                {(agendaDay === 1 ? content.agendaDia1 : content.agendaDia2).map((item, idx) => (
                  <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 shrink-0">
                        {item.time}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingAgenda({ day: agendaDay, item });
                          setAgendaForm({ time: item.time, title: item.title, description: item.description });
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-brandNavy text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${item.title}"?`)) {
                            deleteAgendaItem(agendaDay, item.id);
                            showToast('Actividad eliminada');
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: CONFERENCISTAS Y FOTOS                              */}
        {/* ============================================================== */}
        {activeTab === 'conferencistas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-brandNavy font-serif">Conferencistas y Fotografías</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega nuevos ponentes o actualiza sus fotos directamente subiendo imágenes desde tu computadora.
                </p>
              </div>
            </div>

            {/* Formulario de Conferencista */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brandNavy mb-4">
                {editingSpeaker ? `✏️ Editar Conferencista (${editingSpeaker.name})` : '➕ Agregar Nuevo Conferencista'}
              </h3>

              <form onSubmit={handleSaveSpeaker} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ing. Roberto Garza"
                      value={speakerForm.name}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Título / Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej. CEO de Grupo Alianza"
                      value={speakerForm.title}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Foto del Conferencista</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={speakerForm.photo}
                      alt="Vista previa"
                      className="w-20 h-20 rounded-xl object-contain border border-gray-200 bg-gray-50 shadow-inner"
                    />
                    <div className="space-y-2 flex-grow">
                      <div className="flex gap-2">
                        <label className="cursor-pointer bg-brandNavy hover:bg-brandNavyDark text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
                          <span>📁 Subir Foto desde Computadora</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, (dataUri) => setSpeakerForm({ ...speakerForm, photo: dataUri }))}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="O ingresa la URL de la imagen..."
                        value={speakerForm.photo}
                        onChange={(e) => setSpeakerForm({ ...speakerForm, photo: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingSpeaker && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpeaker(null);
                        setSpeakerForm({ name: '', title: '', photo: '/invitado.png' });
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow transition"
                  >
                    {editingSpeaker ? 'Guardar Cambios' : 'Agregar a la Galería'}
                  </button>
                </div>
              </form>
            </div>

            {/* Galería de Conferencistas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.speakers.map((sp) => (
                <div key={sp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col justify-between">
                  <div>
                    <div className="w-full h-36 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3 border border-gray-100">
                      <img src={sp.photo} alt={sp.name} className="w-full h-full object-contain" />
                    </div>
                    <h4 className="font-bold text-sm text-brandNavy">{sp.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{sp.title}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditingSpeaker(sp);
                        setSpeakerForm({ name: sp.name, title: sp.title, photo: sp.photo });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-brandNavy text-xs font-bold px-3 py-1 rounded-lg transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar a ${sp.name}?`)) {
                          deleteSpeaker(sp.id);
                          showToast('Conferencista eliminado');
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: PATROCINADORES                                      */}
        {/* ============================================================== */}
        {activeTab === 'patrocinadores' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-brandNavy font-serif">Patrocinadores Oficiales (Cinta Marquee)</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Gestiona las marcas y empresas aliadas que se muestran en la cinta deslizante de la portada.
                </p>
              </div>
            </div>

            {/* Formulario Patrocinador */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brandNavy mb-4">
                {editingSponsor ? `✏️ Editar Patrocinador (${editingSponsor.name})` : '➕ Agregar Nuevo Patrocinador'}
              </h3>

              <form onSubmit={handleSaveSponsor} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Nombre de la Empresa</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Grupo Financiero X"
                      value={sponsorForm.name}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      <img src={sponsorForm.logo} alt="Preview" className="w-16 h-10 object-contain bg-gray-50 border rounded p-1" />
                      <label className="cursor-pointer bg-brandNavy hover:bg-brandNavyDark text-white px-3 py-2 rounded-xl text-xs font-bold transition">
                        Subir Archivo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (dataUri) => setSponsorForm({ ...sponsorForm, logo: dataUri }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingSponsor && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSponsor(null);
                        setSponsorForm({ name: '', logo: '/proximamente.png' });
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow transition"
                  >
                    {editingSponsor ? 'Guardar Cambios' : 'Agregar Patrocinador'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Patrocinadores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.sponsors.map((spn) => (
                <div key={spn.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col justify-between">
                  <div className="h-24 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 mb-3">
                    <img src={spn.logo} alt={spn.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <p className="font-bold text-xs text-gray-800">{spn.name}</p>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSponsor(spn);
                        setSponsorForm({ name: spn.name, logo: spn.logo });
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-brandNavy px-2.5 py-1 rounded font-bold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar ${spn.name}?`)) {
                          deleteSponsor(spn.id);
                          showToast('Patrocinador eliminado');
                        }
                      }}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded font-bold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 5: CONTENIDO GENERAL Y TEXTOS                          */}
        {/* ============================================================== */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-brandNavy font-serif mb-4">Textos Principales y Encabezados</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Título del Evento (Hero)</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateHero({ title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Descripción Principal</label>
                  <textarea
                    rows={4}
                    value={content.hero.subtitle}
                    onChange={(e) => updateHero({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Banner Principal (Imagen)</label>
                  <div className="flex items-center gap-4">
                    <img src={content.hero.bannerImage} alt="Banner" className="w-32 h-20 object-cover rounded-xl border" />
                    <label className="cursor-pointer bg-brandNavy text-white px-4 py-2 rounded-xl text-xs font-bold">
                      Cambiar Banner
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (dataUri) => updateHero({ bannerImage: dataUri }))}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Boletos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-brandNavy font-serif mb-4">Configuración de Boletos</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Precio del Boleto ($ MXN)</label>
                  <input
                    type="number"
                    value={content.ticket.price}
                    onChange={(e) => updateTicketConfig({ price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Nombre del Pase</label>
                  <input
                    type="text"
                    value={content.ticket.title}
                    onChange={(e) => updateTicketConfig({ title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>
              </div>
            </div>

            {/* Zona de peligro / reset */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-red-800 text-sm">Restaurar Valores Originales</h3>
                <p className="text-xs text-red-600 mt-1">
                  Si deseas deshacer todas las ediciones y regresar al contenido original del evento.
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas reiniciar todo el contenido del sitio a los valores iniciales?')) {
                    resetToDefaults();
                    showToast('Sitio restaurado a valores por defecto');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Restaurar Sitio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

