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

  // Autenticación de Admin
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

  // Pestaña activa: 'asistentes', 'agenda', 'conferencistas', 'patrocinadores', 'general'
  const [activeTab, setActiveTab] = useState('asistentes');

  // Datos de asistentes / boletos
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Estados para modales / formularios de edición
  const [agendaDay, setAgendaDay] = useState(1);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [agendaForm, setAgendaForm] = useState({ time: '', title: '', description: '' });

  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerForm, setSpeakerForm] = useState({ name: '', title: '', photo: '/invitado.png' });

  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({ name: '', logo: '/proximamente.png' });

  // Mensaje flotante de notificación
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

    // 1. Verificación directa de credenciales autorizadas
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

    // 2. Verificación alternativa con Supabase Auth
    if (isSupabaseConfigured() && supabase && rawUser.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: rawUser.toLowerCase(),
          password: pass,
        });

        if (!error && data?.user) {
          const name = data.user.user_metadata?.nombre || 'Administrador';
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
    setTickets(data || []);
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

  // Subir imagen en Base64
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
    setSpeakerForm({ name: '', logo: '/proximamente.png' });
  };

  // Filtrado de boletos
  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      (t.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.apellido_paterno || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.correo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.codigo_boleto || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'TODOS' ||
      (t.estado_pago || 'PAGADO').toUpperCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Métricas
  const totalPagados = tickets.filter(t => (t.estado_pago || 'PAGADO') === 'PAGADO').length;
  const totalRecaudado = totalPagados * (content.ticket?.price || 350);

  // ----------------------------------------------------
  // VISTA DE INICIO DE SESIÓN (ESTILO VISUAL OFICIAL)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        {/* Encabezado elegante */}
        <section className="bg-brandNavy text-white py-12 px-6 border-b border-brandGold/30 text-center shadow-inner">
          <p className="text-xs font-semibold tracking-wider text-brandGold uppercase">
            <Link to="/" className="hover:text-brandGoldHover transition">Inicio</Link> · Portal del Organizador
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-3 font-serif">
            Control Center
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto mt-4 leading-relaxed">
            Acceso exclusivo para el comité organizador de Summit Empresarial México.
          </p>
        </section>

        {/* Tarjeta de Login */}
        <main className="py-12 px-6 max-w-md mx-auto w-full flex-grow flex items-center justify-center">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brandGold/15 text-brandNavy rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3 shadow-sm">
                💼
              </div>
              <h2 className="text-xl font-bold text-brandNavy font-serif">Bienvenido Organizador</h2>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa tus credenciales autorizadas para gestionar el evento.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 text-center font-medium">
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

  // ----------------------------------------------------
  // PANEL ADMINISTRATIVO (ESTILO VISUAL INTEGRADO)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Toast flotante */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brandNavy text-brandGold font-bold px-5 py-3 rounded-xl shadow-2xl border border-brandGold/50 flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* 1. BARRA SUPERIOR IDÉNTICA A LA NAVBAR OFICIAL */}
      <nav className="bg-white text-black sticky top-0 z-50 border-b border-brandGold/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
          {/* Logos oficiales del Summit */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/summit.PNG" alt="Summit Empresarial México" className="h-10 md:h-12 w-auto object-contain" />
            <img src="/SUMMITBLANCO.jpeg" alt="Red Mundial de Jóvenes Políticos" className="h-8 md:h-10 w-auto object-contain" />
            <span className="hidden sm:inline-block h-6 w-px bg-brandGold/40 mx-2"></span>
            <span className="hidden sm:inline-block font-serif font-bold text-brandNavy text-xs md:text-sm tracking-wide">
              Control Center
            </span>
          </Link>

          {/* Acciones de usuario y navegación */}
          <div className="flex items-center space-x-2 md:space-x-3 text-xs">
            <div className="flex items-center gap-1.5 bg-brandGold/15 text-brandNavy font-bold px-3 py-1.5 rounded-lg border border-brandGold/30">
              <span>👤</span>
              <span>{adminUsername || 'Administrador'}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              className="bg-white hover:bg-gray-50 border border-gray-200 text-brandNavy font-semibold px-3 py-1.5 rounded-lg transition hidden md:inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>👁️</span>
              <span>Ver Sitio</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition border border-red-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* 2. ENCABEZADO TIPO BANNER INSTITUCIONAL */}
      <section className="bg-brandNavy text-white py-8 px-6 border-b border-brandGold/30 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-brandGold/20 border border-brandGold/40 px-3 py-1 rounded-full text-brandGold text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>🛡️</span>
              <span>Módulo de Control y Operación</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
              Panel de Control del Evento
            </h1>
            <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Gestión en tiempo real de asistentes registrados, pagos de boletos, agenda y contenidos de Summit Empresarial México.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/registro"
              target="_blank"
              className="bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition transform hover:-translate-y-0.5"
            >
              + Simular Venta / Boleto
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE PESTAÑAS ESTILIZADA */}
      <div className="bg-white border-b border-brandGold/30 sticky top-[65px] z-30 shadow-sm px-6">
        <div className="max-w-7xl mx-auto flex space-x-2 md:space-x-8 text-xs md:text-sm font-semibold overflow-x-auto scrollbar-none">
          {[
            { id: 'asistentes', label: 'Asistentes y Boletos', icon: '🎟️', count: tickets.length },
            { id: 'agenda', label: 'Editar Agenda', icon: '📅' },
            { id: 'conferencistas', label: 'Conferencistas', icon: '🎤', count: content.speakers?.length },
            { id: 'patrocinadores', label: 'Patrocinadores', icon: '🤝', count: content.sponsors?.length },
            { id: 'general', label: 'Textos y Precios', icon: '⚙️' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 font-medium text-xs md:text-sm ${
                  isActive
                    ? 'border-brandGold text-brandNavy font-bold'
                    : 'border-transparent text-gray-500 hover:text-brandGoldHover hover:border-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="uppercase tracking-wide">{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-brandGold text-brandNavy' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 w-full flex-grow">
        {/* ============================================================== */}
        {/* PESTAÑA 1: ASISTENTES REGISTRADOS                              */}
        {/* ============================================================== */}
        {activeTab === 'asistentes' && (
          <div className="space-y-6">
            {/* Tarjetas KPI estilizadas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group hover:border-brandGold/40 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Total Asistentes
                  </span>
                  <span className="text-xl">👥</span>
                </div>
                <p className="text-3xl font-serif font-bold text-brandNavy mt-3">{tickets.length}</p>
                <p className="text-[11px] text-gray-400 mt-1">Registros en el sistema</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group hover:border-brandGold/40 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    Boletos Pagados
                  </span>
                  <span className="text-xl">🎟️</span>
                </div>
                <p className="text-3xl font-serif font-bold text-emerald-700 mt-3">{totalPagados}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {tickets.length > 0 ? `${Math.round((totalPagados / tickets.length) * 100)}% confirmados` : 'Sin registros'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group hover:border-brandGold/40 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brandGold">
                    Total Recaudado
                  </span>
                  <span className="text-xl">💰</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-2xl md:text-3xl font-serif font-bold text-brandNavy">
                    ${totalRecaudado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold">MXN</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Por Stripe o registro oficial</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group hover:border-brandGold/40 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Precio Boleto
                  </span>
                  <span className="text-xl">🏷️</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-serif font-bold text-brandNavy">
                    ${(content.ticket?.price || 350).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold">MXN</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Acceso Completo Oficial</p>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-grow max-w-xl">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-brandGold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2.5 border rounded-xl text-xs font-bold text-brandNavy outline-none bg-white focus:ring-2 focus:ring-brandGold"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="PAGADO">Solo PAGADOS</option>
                  <option value="PENDIENTE">Solo PENDIENTES</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadTickets}
                  className="bg-white hover:bg-gray-50 text-brandNavy border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>🔄</span>
                  <span>Refrescar</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  <span>📥</span>
                  <span>Exportar a Excel (CSV)</span>
                </button>
              </div>
            </div>

            {/* Tabla de Asistentes */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {loadingTickets ? (
                <div className="text-center py-16 text-sm text-gray-500">
                  <div className="w-8 h-8 border-4 border-brandGold border-t-brandNavy rounded-full animate-spin mx-auto mb-2"></div>
                  Cargando asistentes...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-brandGold/15 text-brandNavy rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
                    🎟️
                  </div>
                  <h3 className="font-serif font-bold text-xl text-brandNavy">No se encontraron asistentes</h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Los boletos comprados o registrados en la plataforma aparecerán aquí automáticamente en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brandNavy text-white uppercase text-[11px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-4 px-5">Código de Boleto</th>
                        <th className="py-4 px-5">Asistente</th>
                        <th className="py-4 px-5">Contacto</th>
                        <th className="py-4 px-5">Monto</th>
                        <th className="py-4 px-5">Estado</th>
                        <th className="py-4 px-5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTickets.map((boleto) => (
                        <tr key={boleto.id || boleto.codigo_boleto} className="hover:bg-gray-50/80 transition">
                          <td className="py-4 px-5 font-mono font-bold text-brandNavy">
                            <span className="bg-brandGold/15 text-brandNavy px-2.5 py-1 rounded-md border border-brandGold/30">
                              {boleto.codigo_boleto}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-brandNavy text-sm">
                              {boleto.nombre} {boleto.apellido_paterno} {boleto.apellido_materno || ''}
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium">{boleto.tipo_acceso || 'Acceso Completo'}</p>
                          </td>
                          <td className="py-4 px-5">
                            <p className="text-gray-800 font-medium">{boleto.correo}</p>
                            <p className="text-[11px] text-gray-400">{boleto.telefono}</p>
                          </td>
                          <td className="py-4 px-5 font-bold text-brandNavy text-sm">
                            ${(boleto.precio || 350).toFixed(2)} MXN
                          </td>
                          <td className="py-4 px-5">
                            <button
                              onClick={() => handleTogglePayment(boleto.codigo_boleto, boleto.estado_pago || 'PAGADO')}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                                (boleto.estado_pago || 'PAGADO') === 'PAGADO'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title="Haz clic para alternar estado"
                            >
                              {(boleto.estado_pago || 'PAGADO') === 'PAGADO' ? '✓ PAGADO' : '⏳ PENDIENTE'}
                            </button>
                          </td>
                          <td className="py-4 px-5 text-center space-x-2">
                            <Link
                              to={`/boleto/${encodeURIComponent(boleto.codigo_boleto)}`}
                              target="_blank"
                              className="bg-brandNavy text-white hover:bg-brandNavyDark px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition inline-block"
                            >
                              Ver Boleto
                            </Link>
                            <button
                              onClick={() => handleDeleteTicket(boleto.codigo_boleto)}
                              className="text-red-600 hover:text-red-800 font-bold text-xs ml-2 hover:underline"
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
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="inline-block bg-brandGold/15 text-brandGold text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  Cronograma Oficial
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-brandNavy font-serif">Gestor de Agenda del Evento</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega, edita o elimina las ponencias y horarios que se muestran en el sitio web en tiempo real.
                </p>
              </div>

              {/* Selector de Día */}
              <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => setAgendaDay(1)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    agendaDay === 1 ? 'bg-brandNavy text-white shadow-md' : 'text-gray-600 hover:text-brandNavy'
                  }`}
                >
                  Día 1 ({content.agendaDia1.length} actividades)
                </button>
                <button
                  onClick={() => setAgendaDay(2)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    agendaDay === 2 ? 'bg-brandNavy text-white shadow-md' : 'text-gray-600 hover:text-brandNavy'
                  }`}
                >
                  Día 2 ({content.agendaDia2.length} actividades)
                </button>
              </div>
            </div>

            {/* Formulario para agregar / editar actividad */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
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
                    className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
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
                    className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Descripción / Detalles</label>
                  <input
                    type="text"
                    placeholder="Ponente, sala o detalles..."
                    value={agendaForm.description}
                    onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
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
                    className="px-6 py-2.5 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {editingAgenda ? 'Guardar Cambios' : 'Agregar Actividad'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista actual de actividades */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brandNavy mb-4">
                Programa Actual - Día {agendaDay}
              </h3>

              <div className="divide-y divide-gray-100">
                {(agendaDay === 1 ? content.agendaDia1 : content.agendaDia2).map((item) => (
                  <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 p-2 rounded-xl transition">
                    <div className="flex items-start gap-4">
                      <span className="font-mono font-bold text-xs text-brandNavy bg-brandGold/15 px-3 py-1 rounded-lg border border-brandGold/30 shrink-0">
                        {item.time}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-brandNavy">{item.title}</h4>
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
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="inline-block bg-brandGold/15 text-brandGold text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  Líderes y Ponentes
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-brandNavy font-serif">Conferencistas y Fotografías</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega nuevos ponentes o actualiza sus fotos directamente subiendo imágenes desde tu computadora.
                </p>
              </div>
            </div>

            {/* Formulario de Conferencista */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
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
                      placeholder="Ej. Roberto Garza"
                      value={speakerForm.name}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Título / Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej. CEO de Grupo Alianza"
                      value={speakerForm.title}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Foto del Conferencista</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={speakerForm.photo}
                      alt="Vista previa"
                      className="w-20 h-20 rounded-xl object-contain border border-brandGold/30 bg-gray-50 shadow-inner"
                    />
                    <div className="space-y-2 flex-grow">
                      <div className="flex gap-2">
                        <label className="cursor-pointer bg-brandNavy hover:bg-brandNavyDark text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md">
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
                        className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brandGold"
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
                    className="px-6 py-2.5 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {editingSpeaker ? 'Guardar Cambios' : 'Agregar a la Galería'}
                  </button>
                </div>
              </form>
            </div>

            {/* Galería de Conferencistas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {content.speakers.map((sp) => (
                <div key={sp.id} className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 text-center flex flex-col justify-between hover:border-brandGold/40 transition">
                  <div>
                    <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3 border border-brandGold/20">
                      <img src={sp.photo} alt={sp.name} className="w-full h-full object-contain" />
                    </div>
                    <h4 className="font-bold text-sm text-brandNavy font-serif">{sp.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{sp.title}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditingSpeaker(sp);
                        setSpeakerForm({ name: sp.name, title: sp.title, photo: sp.photo });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-brandNavy text-xs font-bold px-3 py-1.5 rounded-lg transition"
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
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
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
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="inline-block bg-brandGold/15 text-brandGold text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  Alianzas Estratégicas
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-brandNavy font-serif">Patrocinadores Oficiales (Cinta Marquee)</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Gestiona las marcas y empresas aliadas que se muestran en la cinta deslizante de la portada.
                </p>
              </div>
            </div>

            {/* Formulario Patrocinador */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
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
                      className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      <img src={sponsorForm.logo} alt="Preview" className="w-16 h-10 object-contain bg-gray-50 border rounded p-1" />
                      <label className="cursor-pointer bg-brandNavy hover:bg-brandNavyDark text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm">
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
                    className="px-6 py-2.5 bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {editingSponsor ? 'Guardar Cambios' : 'Agregar Patrocinador'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Patrocinadores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {content.sponsors.map((spn) => (
                <div key={spn.id} className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 text-center flex flex-col justify-between hover:border-brandGold/40 transition">
                  <div className="h-24 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 mb-3">
                    <img src={spn.logo} alt={spn.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <p className="font-bold text-xs text-brandNavy font-serif">{spn.name}</p>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSponsor(spn);
                        setSponsorForm({ name: spn.name, logo: spn.logo });
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-brandNavy px-2.5 py-1 rounded font-bold transition"
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
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded font-bold transition"
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
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
              <span className="inline-block bg-brandGold/15 text-brandGold text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Textos de Portada
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-brandNavy font-serif mb-4">Textos Principales y Encabezados</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Título del Evento (Hero)</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateHero({ title: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Descripción Principal</label>
                  <textarea
                    rows={4}
                    value={content.hero.subtitle}
                    onChange={(e) => updateHero({ subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brandGold leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Banner Principal (Imagen)</label>
                  <div className="flex items-center gap-4">
                    <img src={content.hero.bannerImage} alt="Banner" className="w-32 h-20 object-cover rounded-xl border border-brandGold/30" />
                    <label className="cursor-pointer bg-brandNavy hover:bg-brandNavyDark text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md">
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
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
              <span className="inline-block bg-brandGold/15 text-brandGold text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Tarifas y Entradas
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-brandNavy font-serif mb-4">Configuración de Boletos</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Precio del Boleto ($ MXN)</label>
                  <input
                    type="number"
                    value={content.ticket.price}
                    onChange={(e) => updateTicketConfig({ price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Nombre del Pase</label>
                  <input
                    type="text"
                    value={content.ticket.title}
                    onChange={(e) => updateTicketConfig({ title: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brandGold"
                  />
                </div>
              </div>
            </div>

            {/* Zona de peligro / reset */}
            <div className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                Restaurar Sitio
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pie de página oficial */}
      <footer className="bg-white border-t border-brandGold/30 py-6 px-6 text-center text-xs text-gray-500">
        <p>© 2026 Summit Empresarial México · Control Center Oficial</p>
      </footer>
    </div>
  );
}
