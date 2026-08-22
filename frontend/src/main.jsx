import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  Images,
  FileText,
  Home,
  LogOut,
  Plus,
  Receipt,
  Search,
  Stethoscope,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import './styles.css';
import CalendarComponent from './CalendarComponent.jsx';

const API_URL = '/api';

const emptyPaciente = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  obraSocial: '',
  numeroAfiliado: '',
  observacionesGenerales: '',
};

const emptyHistoria = {
  antecedentes: '',
  alergias: '',
  medicacionHabitual: '',
  enfermedadesPrevias: '',
  observaciones: '',
};

const emptyProcedimiento = {
  fecha: new Date().toISOString().slice(0, 10),
  nombre: '',
  tipoProcedimiento: '',
  zonaTratada: '',
  productoUtilizado: '',
  marca: '',
  lote: '',
  fechaVencimiento: '',
  cantidadUtilizada: '',
  descripcion: '',
  observaciones: '',
  requiereControl: false,
  fechaControl: '',
  estadoControl: 'NO_REQUIERE',
};

const emptyFacturacion = {
  tipo: 'PROCEDIMIENTO',
  procedimiento: '',
  pacienteId: '',
  facturacionBruta: '',
  facturacionNeta: '',
  fecha: new Date().toLocaleDateString('en-CA'),
};

function App() {
  const [auth, setAuth] = useState(undefined);
  const [view, setView] = useState('inicio');
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const api = useMemo(() => createApiClient(), []);
  const currentUser = {
    name: 'Dra. Florencia Liberi',
    role: 'Administradora',
    photoUrl: '/profile-florencia.jfif',
  };

  useEffect(() => {
    api.getCurrentUser().then(setAuth).catch(() => setAuth(null));
  }, [api]);

  function handleLogin(nextAuth) {
    setAuth(nextAuth);
    setView('inicio');
  }

  async function handleLogout() {
    try { await api.logout(); } catch { /* La sesión local se limpia igualmente. */ }
    setAuth(null);
    setSelectedPacienteId(null);
  }

  if (auth === undefined) {
    return <main className="login-page"><section className="login-panel">Verificando sesión…</section></main>;
  }

  if (auth === null) {
    return <LoginPage api={api} onLogin={handleLogin} />;
  }

  return (
    <Shell
      view={view}
      user={currentUser}
      onLogout={handleLogout}
      onNavigate={(nextView) => {
        setView(nextView);
        if (nextView !== 'perfil') {
          setSelectedPacienteId(null);
        }
      }}
    >
      {view === 'inicio' && <HomePage api={api} onOpenPacientes={() => setView('pacientes')} onOpenAgenda={() => setView('agenda')} onOpenToday={() => setView('hoy')} onOpenControls={() => setView('controles')} />}
      {view === 'hoy' && <TurnosHoyPage api={api} onOpenAgenda={() => setView('agenda')} />}
      {view === 'controles' && <ControlesPendientesPage api={api} onOpenPaciente={(id) => { setSelectedPacienteId(id); setView('perfil'); }} />}
      {view === 'agenda' && <CalendarComponent api={api} />}
      {view === 'facturacion' && <FacturacionPage api={api} />}
      {view === 'pacientes' && (
        <PacientesPage
          api={api}
          onOpenPaciente={(id) => {
            setSelectedPacienteId(id);
            setView('perfil');
          }}
        />
      )}
            {view === 'perfil' && selectedPacienteId && (
        <PacientePerfilPage
          api={api}
          pacienteId={selectedPacienteId}
          onBack={() => setView('pacientes')}
          onOpenAgenda={() => setView('agenda')}
        />
      )}
    </Shell>
  );
}

function createApiClient() {
  let csrfToken = null;

  async function getCsrfToken() {
    if (csrfToken) return csrfToken;
    const response = await fetch(`${API_URL}/auth/csrf`, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('No se pudo iniciar una sesión segura.');
    csrfToken = (await response.json()).token;
    return csrfToken;
  }

  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const requiresCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method) && path !== '/auth/login';
    const securityHeaders = requiresCsrf ? { 'X-XSRF-TOKEN': await getCsrfToken() } : {};
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...securityHeaders,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = 'No se pudo completar la operación.';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {
        message = response.status === 401 ? 'Usuario o contraseña incorrectos.' : message;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  return {
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    getCurrentUser: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    listPacientes: (buscar) => request(`/pacientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
    getPaciente: (id) => request(`/pacientes/${id}`),
    createPaciente: (data) => request('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
    updatePaciente: (id, data) => request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePaciente: (id) => request(`/pacientes/${id}`, { method: 'DELETE' }),
    getHistoria: (pacienteId) => request(`/pacientes/${pacienteId}/historia-clinica`),
    listCancelaciones: (pacienteId) => request(`/pacientes/${pacienteId}/cancelaciones`),
    updateHistoria: (pacienteId, data) =>
      request(`/pacientes/${pacienteId}/historia-clinica`, { method: 'PUT', body: JSON.stringify(data) }),
    listProcedimientos: (pacienteId) => request(`/pacientes/${pacienteId}/procedimientos`),
    createProcedimiento: (pacienteId, data) =>
      request(`/pacientes/${pacienteId}/procedimientos`, { method: 'POST', body: JSON.stringify(data) }),
    deleteProcedimiento: (id) => request(`/procedimientos/${id}`, { method: 'DELETE' }),
    listControlesPendientes: () => request('/procedimientos/controles-pendientes'),
    listAgendaEventos: (fechaInicio, fechaFin) =>
      request(`/agenda/eventos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
    agendarCita: (data) => request('/agenda/agendar', { method: 'POST', body: JSON.stringify(data) }),
    actualizarCita: (id, data) => request(`/agenda/citas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    cancelarCita: (id) => request(`/agenda/citas/${id}`, { method: 'DELETE' }),
    actualizarEstadoCita: (id, estado) => request(`/agenda/citas/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado }) }),
    listFacturaciones: () => request('/facturaciones'),
    createFacturacion: (data) => request('/facturaciones', { method: 'POST', body: JSON.stringify(data) }),
    updateFacturacion: (id, data) => request(`/facturaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteFacturacion: (id) => request(`/facturaciones/${id}`, { method: 'DELETE' }),
    listOtrosGastos: () => request('/otros-gastos'),
    createOtroGasto: (data) => request('/otros-gastos', { method: 'POST', body: JSON.stringify(data) }),
    updateOtroGasto: (id, data) => request(`/otros-gastos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOtroGasto: (id) => request(`/otros-gastos/${id}`, { method: 'DELETE' }),
  };
}

function LoginPage({ api, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] =useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authenticatedUser = await api.login(username, password);
      onLogin(authenticatedUser);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <LogoMark />
        <h1>Consultorio</h1>
        <p>Dra. Florencia Liberi · Medicina Estética</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <Field label="Usuario" value={username} onChange={setUsername} />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} />
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-button" disabled={loading}>
            <User size={18} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
      <AppFooter />
    </main>
  );
}

function Shell({ children, view, onNavigate, onLogout, user }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
    src="/flor.jfif"
    alt="Dra. Florencia Liberi"
    className="header-photo"
  />
          <div>
            <strong>Dra. Florencia Liberi</strong>
            <span>Medicina Estética</span>
          </div>
        </div>
        <nav>
          <button className={view === 'inicio' ? 'active' : ''} onClick={() => onNavigate('inicio')}>
            <Home size={19} />
            Inicio
          </button>
          <button className={view === 'pacientes' || view === 'perfil' ? 'active' : ''} onClick={() => onNavigate('pacientes')}>
            <Users size={19} />
            Pacientes
          </button>
          <button className={view === 'agenda' ? 'active' : ''} onClick={() => onNavigate('agenda')}>
            <CalendarDays size={19} />
            Agenda
          </button>
          <button className={view === 'hoy' ? 'active' : ''} onClick={() => onNavigate('hoy')}>
            <Clock3 size={19} />
            Turnos de hoy
          </button>
          <button className={view === 'facturacion' ? 'active' : ''} onClick={() => onNavigate('facturacion')}>
            <Receipt size={19} />
            Facturación
          </button>
        </nav>
        <SidebarUserProfile user={user} />
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </aside>
      <main className="workspace">
        <div className="workspace-content">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
}

function AppFooter() {
  return( <footer className="app-footer">
    Diseñado por{' '}
    <a
      href="https://neodevs-digital.tomasliberi.chatgpt.site/"
      target="_blank"
      rel="noopener noreferrer"
      className = "footer-link"
    >
      NeoDevs
    </a>
  </footer>);
}

function SidebarUserProfile({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="sidebar-user-profile">
      {user.photoUrl && !imageFailed ? (
        <img className="user-avatar" src={user.photoUrl} alt={user.name} onError={() => setImageFailed(true)} />
      ) : (
        <div className="user-avatar placeholder" aria-hidden="true">FL</div>
      )}
      <div className="user-profile-copy">
        <strong>{user.name}</strong>
        <span>{user.role}</span>
      </div>
    </div>
  );
}

function LogoMark({ small = false }) {
  return (
    <div className={small ? 'logo-mark small' : 'logo-mark'}>
      <img src="/logo-fl.svg" alt="Logo Dra. Florencia Liberi" />
    </div>
  );
}

function HomePage({ api, onOpenPacientes, onOpenAgenda, onOpenToday, onOpenControls }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingControls, setPendingControls] = useState([]);
  const today = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const loadTodayAppointments = useCallback(async () => {
    const date = new Date().toLocaleDateString('en-CA');
    try {
      const items = await api.listAgendaEventos(date, date);
      setTodayAppointments(items.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')));
    } catch {
      setTodayAppointments([]);
    }
  }, [api]);

  useEffect(() => {
    loadTodayAppointments();
    api.listControlesPendientes().then(setPendingControls).catch(() => setPendingControls([]));
    window.addEventListener('consultorio:agenda-updated', loadTodayAppointments);
    return () => window.removeEventListener('consultorio:agenda-updated', loadTodayAppointments);
  }, [api, loadTodayAppointments]);

  const currentTime = new Date().toTimeString().slice(0, 5);
  const nextAppointment = todayAppointments.find((item) => item.hora?.slice(0, 5) >= currentTime);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dra. Florencia Liberi</span>
          <h2>Medicina Estética</h2>
          <p className="header-subtitle">{today}</p>
        </div>
      </div>
      <div className="daily-panel">
        <button type="button" onClick={onOpenToday}><span>Turnos del día</span><strong>{todayAppointments.length === 1 ? '1 turno programado' : `${todayAppointments.length} turnos programados`}</strong></button>
        <button type="button" onClick={onOpenToday}><span>Próximo paciente</span><strong>{nextAppointment ? `${nextAppointment.hora.slice(0, 5)} · ${nextAppointment.pacienteNombre} ${nextAppointment.pacienteApellido}` : 'Sin próximos turnos hoy'}</strong></button>
        <button type="button" onClick={onOpenControls}><span>Controles pendientes</span><strong>{pendingControls.length === 1 ? '1 control pendiente' : `${pendingControls.length} controles pendientes`}</strong></button>
      </div>
      <div className="home-grid">
        <button className="metric-card" onClick={onOpenPacientes}>
          <span className="card-icon"><Users size={24} /></span>
          <strong>Buscar paciente</strong>
          <span>Abrir el perfil clínico para consultar antecedentes y registros</span>
        </button>
        <button className="metric-card" onClick={onOpenPacientes}>
          <span className="card-icon"><Plus size={24} /></span>
          <strong>Nuevo paciente</strong>
          <span>Cargar datos personales e iniciar historia clínica</span>
        </button>
        <button className="metric-card" onClick={onOpenAgenda}>
          <span className="card-icon"><CalendarDays size={24} /></span>
          <strong>Agenda</strong>
          <span>Ver calendario y agendar un nuevo turno</span>
        </button>
        <button className="metric-card" onClick={onOpenControls}>
          <span className="card-icon"><ClipboardList size={24} /></span>
          <strong>Controles</strong>
          <span>Ver controles pendientes y acceder a la ficha de cada paciente</span>
        </button>
      </div>
    </section>
  );
}

function ControlesPendientesPage({ api, onOpenPaciente }) {
  const [controles, setControles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listControlesPendientes()
      .then(setControles)
      .catch((exception) => setError(exception.message))
      .finally(() => setLoading(false));
  }, [api]);

  const today = new Date().toLocaleDateString('en-CA');

  return <section className="page controls-page">
    <div className="page-header"><div><span className="eyebrow">Seguimiento</span><h2>Controles pendientes</h2><p className="header-subtitle">Próximos controles indicados en procedimientos.</p></div></div>
    {error && <div className="form-error wide">{error}</div>}
    {loading && <div className="today-empty">Cargando controles…</div>}
    {!loading && controles.length === 0 && <div className="today-empty"><ClipboardList size={30}/><strong>No hay controles pendientes</strong><span>Los controles aparecerán acá cuando un procedimiento los requiera.</span></div>}
    {!loading && controles.length > 0 && <div className="controls-list">
      {controles.map((control) => <article className={control.fechaControl && control.fechaControl < today ? 'control-card overdue' : 'control-card'} key={control.procedimientoId}>
        <div className="control-date"><span>Fecha de control</span><strong>{control.fechaControl ? formatDate(control.fechaControl) : 'Sin fecha'}</strong>{control.fechaControl && control.fechaControl < today && <em>Vencido</em>}</div>
        <div className="control-patient"><strong>{control.pacienteNombre} {control.pacienteApellido}</strong><span>{control.procedimiento}{control.zonaTratada ? ` · ${control.zonaTratada}` : ''}</span></div>
        <button className="secondary-button" onClick={() => onOpenPaciente(control.pacienteId)}>Ver paciente</button>
      </article>)}
    </div>}
  </section>;
}

function TurnosHoyPage({ api, onOpenAgenda }) {
  const [turnos, setTurnos] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date().toLocaleDateString('en-CA');

  const loadTurnos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await api.listAgendaEventos(today, today);
      setTurnos(items.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')));
    } catch (exception) {
      setError(exception.message);
    } finally {
      setLoading(false);
    }
  }, [api, today]);

  useEffect(() => {
    loadTurnos();
    window.addEventListener('consultorio:agenda-updated', loadTurnos);
    return () => window.removeEventListener('consultorio:agenda-updated', loadTurnos);
  }, [loadTurnos]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  function isExpired(turno) {
    if (!turno.hora) return true;
    const [hours, minutes] = turno.hora.slice(0, 5).split(':').map(Number);
    const [year, month, day] = turno.fecha.split('-').map(Number);
    const appointmentTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return appointmentTime < currentTime;
  }

  async function updateStatus(turno, estado) {
    setError('');
    try {
      const updated = await api.actualizarEstadoCita(turno.id, estado);
      setTurnos((current) => current.map((item) => item.id === turno.id ? updated : item));
    } catch (exception) {
      setError(exception.message);
    }
  }

  const todayLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  return (
    <section className="page today-page">
      <div className="page-header">
        <div><span className="eyebrow">Agenda diaria</span><h2>Turnos de hoy</h2><p className="header-subtitle">{todayLabel}</p></div>
        <button className="primary-button" onClick={onOpenAgenda}><CalendarDays size={18} />Ver agenda completa</button>
      </div>
      {error && <div className="form-error wide">{error}</div>}
      <div className="today-summary"><strong>{turnos.length}</strong><span>{turnos.length === 1 ? 'turno del día' : 'turnos del día'}</span></div>
      {loading && <div className="today-empty">Cargando turnos…</div>}
      {!loading && turnos.length === 0 && <div className="today-empty"><CalendarDays size={30} /><strong>No hay turnos para hoy</strong><span>Podés crear uno desde la agenda.</span><button className="primary-button" onClick={onOpenAgenda}>Agendar turno</button></div>}
      {!loading && turnos.length > 0 && <div className="today-appointments">
        {turnos.map((turno) => <article className={`today-appointment appointment-state-${(turno.estado || 'PENDIENTE').toLowerCase()}${isExpired(turno) ? ' expired' : ''}`} key={turno.id}>
          <div className="today-time">{turno.hora?.slice(0, 5)}</div>
          <div className="today-patient"><strong>{turno.pacienteNombre} {turno.pacienteApellido}</strong><span>{turno.motivoConsulta || 'Sin motivo especificado'}</span></div>
          <span className="today-type">{turno.tipoCita === 'PROCEDIMIENTO' ? 'Procedimiento' : 'Consulta'}</span>
          <label className={`today-status status-${(turno.estado || 'PENDIENTE').toLowerCase()}`}>Estado<select value={turno.estado || 'PENDIENTE'} onChange={(event) => updateStatus(turno, event.target.value)}><option value="PENDIENTE">PENDIENTE</option><option value="ASISTIO">ASISTIÓ</option><option value="CANCELO">CANCELÓ</option></select></label>
          <span className={turno.seniaPagada ? 'today-deposit paid' : 'today-deposit pending'}>{turno.seniaPagada ? 'Seña pagada' : 'Seña pendiente'}</span>
        </article>)}
      </div>}
    </section>
  );
}

function FacturacionPage({ api }) {
  const [allItems, setItems] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [buscarPaciente, setBuscarPaciente] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [facturaciones, gastosRegistrados, pacientesRegistrados] = await Promise.all([api.listFacturaciones(), api.listOtrosGastos(), api.listPacientes('')]);
      setItems(facturaciones); setGastos(gastosRegistrados); setPacientes(pacientesRegistrados);
    } catch (exception) { setError(exception.message); } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { loadData(); }, [loadData]);
  const totals = useMemo(() => {
    const procedimientos = allItems.reduce((result, item) => ({ bruta: result.bruta + Number(item.facturacionBruta), neta: result.neta + Number(item.facturacionNeta) }), { bruta: 0, neta: 0 });
    const gastosGenerales = gastos.reduce((total, item) => total + Number(item.monto), 0);
    return { ...procedimientos, gastosGenerales, gastosTotales: procedimientos.bruta - procedimientos.neta + gastosGenerales, netaFinal: procedimientos.neta - gastosGenerales };
  }, [allItems, gastos]);
  const itemsFiltrados = useMemo(() => {
    const query = buscarPaciente.trim().toLocaleLowerCase();
    if (!query) return allItems;
    return allItems.filter((item) => `${item.pacienteNombre || ''} ${item.pacienteApellido || ''} ${item.procedimiento || ''}`.toLocaleLowerCase().includes(query));
  }, [allItems, buscarPaciente]);
  const items = itemsFiltrados;
  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar la facturación de ${item.procedimiento}?`)) return;
    setDeletingId(item.id); setError('');
    try { await api.deleteFacturacion(item.id); await loadData(); }
    catch (exception) { setError(exception.message); }
    finally { setDeletingId(null); }
  }
  const searchField = <form className="search-bar billing-search" onSubmit={(event) => event.preventDefault()}><Search size={18} /><input aria-label="Buscar paciente en facturación" placeholder="Buscar paciente por nombre o apellido" value={buscarPaciente} onChange={(event) => setBuscarPaciente(event.target.value)} /></form>;
  return <section className="page billing-page">
    <div className="page-header"><div><span className="eyebrow">Administración</span><h2>Facturación</h2><p className="header-subtitle">Ingresos por procedimientos y gastos generales.</p></div><button className="primary-button patient-action-button" onClick={() => setEditing(emptyFacturacion)}><Plus size={18} />Nuevo registro</button></div>
    <div className="billing-summary"><div><span>Facturación bruta</span><strong>{formatCurrency(totals.bruta)}</strong></div><div><span>Gastos totales</span><strong>{formatCurrency(totals.gastosTotales)}</strong></div><div><span>Facturación neta</span><strong>{formatCurrency(totals.netaFinal)}</strong></div></div>
    {searchField}
    {error && <div className="form-error wide">{error}</div>}
    <div className="table-wrap billing-table"><table><thead><tr><th>Procedimiento</th><th>Cliente</th><th>Facturación bruta</th><th>Facturación neta</th><th>Diferencia</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>
      {loading && <tr><td colSpan="7">Cargando facturaciones...</td></tr>}
      {!loading && items.length === 0 && <tr><td colSpan="7">No hay facturaciones cargadas.</td></tr>}
      {!loading && items.map((item) => <tr key={item.id}><td><strong>{item.procedimiento}</strong></td><td>{item.pacienteApellido}, {item.pacienteNombre}</td><td>{formatCurrency(item.facturacionBruta)}</td><td>{formatCurrency(item.facturacionNeta)}</td><td>{formatCurrency(item.diferencia)}</td><td>{formatDate(item.fecha)}</td><td className="row-actions"><button onClick={() => setEditing(item)}>Editar</button><button className="delete-patient-button" disabled={deletingId === item.id} onClick={() => handleDelete(item)}><Trash2 size={16} />{deletingId === item.id ? 'Eliminando…' : 'Eliminar'}</button></td></tr>)}
    </tbody></table></div>
    <OtrosGastosPanel items={gastos} onEdit={(gasto) => setEditing({ ...gasto, tipo: 'GASTO' })} onDeleted={loadData} api={api} />
    {editing && <FacturacionModal api={api} item={editing} pacientes={pacientes} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadData(); }} />}
  </section>;
}

function OtrosGastosPanel({ items, onEdit, onDeleted, api }) {
  const total = items.reduce((sum, item) => sum + Number(item.monto), 0);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  async function remove(item) {
    if (!window.confirm(`¿Eliminar el gasto "${item.descripcion}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(item.id); setError('');
    try { await api.deleteOtroGasto(item.id); await onDeleted(); }
    catch (exception) { setError(exception.message); }
    finally { setDeletingId(null); }
  }
  return <section className="other-expenses"><div className="section-heading"><div><span className="eyebrow">Egresos</span><h3>Gastos generales</h3></div><strong>{formatCurrency(total)}</strong></div>{error && <div className="form-error wide">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Concepto</th><th>Monto</th><th>Acciones</th></tr></thead><tbody>{items.length === 0 && <tr><td colSpan="5">No hay gastos generales registrados.</td></tr>}{items.map((item) => <tr key={item.id}><td>{formatDate(item.fecha)}</td><td>{item.categoria}</td><td>{item.descripcion}</td><td>{formatCurrency(item.monto)}</td><td className="row-actions"><button onClick={() => onEdit(item)}>Editar</button><button className="expense-delete-button" disabled={deletingId === item.id} onClick={() => remove(item)}><Trash2 size={15}/>{deletingId === item.id ? 'Eliminando…' : 'Eliminar'}</button></td></tr>)}</tbody></table></div></section>;
}

function FacturacionModal({ api, item, pacientes, onClose, onSaved }) {
  const [form, setForm] = useState({ tipo: item.tipo || 'PROCEDIMIENTO', procedimiento: item.procedimiento || '', pacienteId: item.pacienteId || '', facturacionBruta: item.facturacionBruta ?? '', facturacionNeta: item.facturacionNeta ?? '', concepto: item.descripcion || '', categoria: item.categoria || 'Otros', monto: item.monto ?? '', observacion: item.observacion || '', fecha: item.fecha || new Date().toLocaleDateString('en-CA') });
  const initialPatient = pacientes.find((paciente) => Number(paciente.id) === Number(item.pacienteId));
  const [patientSearch, setPatientSearch] = useState(initialPatient ? `${initialPatient.apellido}, ${initialPatient.nombre} · DNI ${initialPatient.dni}` : '');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const patientAutocompleteRef = useRef(null);
  const isEdit = Boolean(item.id); const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const difference = Number(form.facturacionBruta || 0) - Number(form.facturacionNeta || 0);
  const selectedPatient = pacientes.find((paciente) => Number(paciente.id) === Number(form.pacienteId));
  const selectedPatientLabel = selectedPatient ? `${selectedPatient.apellido}, ${selectedPatient.nombre} · DNI ${selectedPatient.dni}` : '';
  const filteredPatients = form.pacienteId && patientSearch === selectedPatientLabel
    ? pacientes
    : pacientes.filter((paciente) => `${paciente.nombre} ${paciente.apellido} ${paciente.dni}`.toLocaleLowerCase().includes(patientSearch.trim().toLocaleLowerCase()));
  useEffect(() => {
    if (!showPatientSuggestions) return undefined;
    const closeOnOutsidePointer = (event) => {
      if (!patientAutocompleteRef.current?.contains(event.target)) setShowPatientSuggestions(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowPatientSuggestions(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showPatientSuggestions]);
  function selectPatient(paciente) {
    update('pacienteId', String(paciente.id));
    setPatientSearch(`${paciente.apellido}, ${paciente.nombre} · DNI ${paciente.dni}`);
    setShowPatientSuggestions(false);
  }
  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    if (form.tipo === 'GASTO') {
      const monto = Number(form.monto);
      if (!form.concepto.trim() || !Number.isFinite(monto) || monto < 0) { setError('Ingresá un concepto y un monto válido.'); return; }
      setSaving(true);
      const payload = { descripcion: form.concepto.trim(), categoria: form.categoria.trim() || 'Otros', monto, fecha: form.fecha, observacion: form.observacion };
      try { if (isEdit) await api.updateOtroGasto(item.id, payload); else await api.createOtroGasto(payload); onSaved(); }
      catch (exception) { setError(exception.message); } finally { setSaving(false); }
      return;
    }
    const bruta = Number(form.facturacionBruta); const neta = Number(form.facturacionNeta);
    if (!form.pacienteId || !form.procedimiento.trim()) { setError('Seleccioná un paciente e ingresá el procedimiento.'); return; }
    if (!Number.isFinite(bruta) || !Number.isFinite(neta) || bruta < 0 || neta < 0) { setError('Los importes deben ser números válidos y no negativos.'); return; }
    if (!isEdit && !confirming) { setConfirming(true); return; }
    setSaving(true);
    try { const payload = { ...form, pacienteId: Number(form.pacienteId), facturacionBruta: bruta, facturacionNeta: neta }; if (isEdit) await api.updateFacturacion(item.id, payload); else await api.createFacturacion(payload); onSaved(); }
    catch (exception) { setError(exception.message); } finally { setSaving(false); }
  }
  if (confirming) return <div className="modal-backdrop"><section className="modal confirmation-modal"><div className="modal-header"><h3>Confirmar procedimiento</h3><button type="button" onClick={() => setConfirming(false)}>Volver</button></div><div className="confirmation-summary"><p><span>Paciente</span><strong>{selectedPatient?.nombre} {selectedPatient?.apellido}</strong></p><p><span>Procedimiento</span><strong>{form.procedimiento}</strong></p><p><span>Fecha</span><strong>{formatDate(form.fecha)}</strong></p><p><span>Facturación bruta</span><strong>{formatCurrency(form.facturacionBruta)}</strong></p><p><span>Facturación neta</span><strong>{formatCurrency(form.facturacionNeta)}</strong></p></div>{error && <div className="form-error wide">{error}</div>}<div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="button" className="primary-button" disabled={saving} onClick={handleSubmit}>{saving ? 'Guardando…' : 'Confirmar y guardar'}</button></div></section></div>;
  return <div className="modal-backdrop"><section className="modal billing-modal"><div className="modal-header"><h3>{isEdit ? (form.tipo === 'GASTO' ? 'Editar gasto general' : 'Editar procedimiento facturado') : 'Nuevo registro'}</h3><button onClick={onClose}>Cerrar</button></div><form className="form-grid" onSubmit={handleSubmit}>
    {!isEdit && <div className="billing-type-selector"><button type="button" className={form.tipo === 'PROCEDIMIENTO' ? 'active' : ''} onClick={() => update('tipo', 'PROCEDIMIENTO')}><Stethoscope size={18}/>Procedimiento</button><button type="button" className={form.tipo === 'GASTO' ? 'active' : ''} onClick={() => update('tipo', 'GASTO')}><Receipt size={18}/>Gasto general</button></div>}
    {form.tipo === 'PROCEDIMIENTO' ? <>
      <Field label="Procedimiento" value={form.procedimiento} onChange={(value) => update('procedimiento', value)} required />
      <label className="wide patient-picker">Paciente<div className="patient-autocomplete" ref={patientAutocompleteRef}><input type="search" required autoComplete="off" placeholder="Buscar por nombre, apellido o DNI" value={patientSearch} onFocus={() => setShowPatientSuggestions(true)} onClick={() => setShowPatientSuggestions(true)} onChange={(event) => { setPatientSearch(event.target.value); update('pacienteId', ''); setShowPatientSuggestions(true); }} />{showPatientSuggestions && <div className="patient-suggestions">{filteredPatients.length === 0 && <div className="patient-no-results">No se encontraron pacientes</div>}{filteredPatients.map((paciente) => <button type="button" key={paciente.id} onClick={() => selectPatient(paciente)}><strong>{paciente.apellido}, {paciente.nombre}</strong><span>DNI {paciente.dni}</span></button>)}</div>}</div>{form.pacienteId && <span className="patient-selected">Paciente seleccionado</span>}</label>
      <Field label="Facturación bruta" type="number" value={form.facturacionBruta} onChange={(value) => update('facturacionBruta', value)} required min="0" step="0.01" />
      <Field label="Facturación neta" type="number" value={form.facturacionNeta} onChange={(value) => update('facturacionNeta', value)} required min="0" step="0.01" />
      <div className="calculated-field"><span>Gasto / diferencia</span><strong>{formatCurrency(difference)}</strong></div>
    </> : <>
      <Field label="Concepto del gasto" value={form.concepto} onChange={(value) => update('concepto', value)} placeholder="Ej.: Alquiler, luz, insumos" required />
      <Field label="Categoría" value={form.categoria} onChange={(value) => update('categoria', value)} required />
      <Field label="Monto" type="number" value={form.monto} onChange={(value) => update('monto', value)} required min="0" step="0.01" />
      <TextArea label="Observación" value={form.observacion} onChange={(value) => update('observacion', value)} />
    </>}
    <Field label="Fecha" type="date" value={form.fecha} onChange={(value) => update('fecha', value)} required />
    {form.tipo === 'PROCEDIMIENTO' && pacientes.length === 0 && <div className="form-error wide">Primero debe registrar un paciente para asociarlo al procedimiento.</div>}{error && <div className="form-error wide">{error}</div>}
    <div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button patient-action-button" disabled={saving || (form.tipo === 'PROCEDIMIENTO' && pacientes.length === 0)}>{saving ? 'Guardando…' : form.tipo === 'PROCEDIMIENTO' && !isEdit ? 'Revisar y continuar' : 'Guardar'}</button></div>
  </form></section></div>;
}

function PacientesPage({ api, onOpenPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function loadPacientes(query = buscar) {
    setLoading(true);
    setError('');
    try {
      setPacientes(await api.listPacientes(query.trim()));
    } catch (exception) {
      setError(exception.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPacientes('');
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadPacientes(buscar);
  }

  async function handleDelete(paciente) {
    const confirmed = window.confirm(
      `¿Eliminar a ${paciente.nombre} ${paciente.apellido}?\n\nTambién se eliminarán su historia clínica, procedimientos y turnos. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingId(paciente.id);
    setError('');
    try {
      await api.deletePaciente(paciente.id);
      await loadPacientes(buscar);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Pacientes</span>
          <h2>Listado de pacientes</h2>
        </div>
        <button className="primary-button patient-action-button" onClick={() => setEditing(emptyPaciente)}>
          <Plus size={18} />
          Nuevo paciente
        </button>
      </div>
      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={18} />
        <input placeholder="Buscar por nombre, apellido o DNI" value={buscar} onChange={(event) => setBuscar(event.target.value)} />
        <button type="submit">Buscar</button>
      </form>
      {error && <div className="form-error wide">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>DNI</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Obra social</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6">Cargando pacientes...</td></tr>}
            {!loading && pacientes.length === 0 && <tr><td colSpan="6">No hay pacientes cargados.</td></tr>}
            {!loading && pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td><strong>{paciente.apellido}, {paciente.nombre}</strong><span>{paciente.email || paciente.numeroHistoriaClinica}</span></td>
                <td>{paciente.dni}</td>
                <td>{paciente.edad}</td>
                <td>{paciente.telefono || '-'}</td>
                <td>{paciente.obraSocial || '-'}</td>
                <td className="row-actions">
                  <button onClick={() => onOpenPaciente(paciente.id)}>Ver</button>
                  <button onClick={() => setEditing(paciente)}>Editar</button>
                  <button className="delete-patient-button" disabled={deletingId === paciente.id} onClick={() => handleDelete(paciente)}>
                    <Trash2 size={16} />
                    {deletingId === paciente.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <PacienteModal
          api={api}
          paciente={editing}
          onClose={() => setEditing(null)}
          onSaved={async (saved) => {
            setEditing(null);
            await loadPacientes('');
            onOpenPaciente(saved.id);
          }}
        />
      )}
    </section>
  );
}

function PacienteModal({ api, paciente, onClose, onSaved }) {
  const [form, setForm] = useState(toPacienteForm(paciente));
  const [error, setError] = useState('');
  const isEdit = Boolean(paciente.id);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const saved = isEdit ? await api.updatePaciente(paciente.id, form) : await api.createPaciente(form);
      onSaved(saved);
    } catch (exception) {
      setError(exception.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar paciente' : 'Nuevo paciente'}</h3>
          <button onClick={onClose}>Cerrar</button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <Field label="Nombre" value={form.nombre} onChange={(value) => update('nombre', value)} required />
          <Field label="Apellido" value={form.apellido} onChange={(value) => update('apellido', value)} required />
          <Field label="DNI" value={form.dni} onChange={(value) => update('dni', value)} required />
          <Field label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={(value) => update('fechaNacimiento', value)} required />
          <Field label="Teléfono" value={form.telefono} onChange={(value) => update('telefono', value)} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
          <Field label="Obra social" value={form.obraSocial} onChange={(value) => update('obraSocial', value)} />
          <Field label="Número de afiliado" value={form.numeroAfiliado} onChange={(value) => update('numeroAfiliado', value)} />
          <TextArea label="Observaciones generales" value={form.observacionesGenerales} onChange={(value) => update('observacionesGenerales', value)} />
          {error && <div className="form-error wide">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button patient-action-button">Guardar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PacientePerfilPage({ api, pacienteId, onBack, onOpenAgenda }) {
  const [paciente, setPaciente] = useState(null);
  const [procedimientos, setProcedimientos] = useState([]);
  const [cancelaciones, setCancelaciones] = useState([]);
  const [editingPaciente, setEditingPaciente] = useState(false);
  const [activeTab, setActiveTab] = useState('datos');
  const [error, setError] = useState('');

  const loadPaciente = useCallback(async () => {
    setError('');
    try {
      const [nextPaciente, nextProcedimientos] = await Promise.all([
        api.getPaciente(pacienteId),
        api.listProcedimientos(pacienteId),
      ]);
      setPaciente(nextPaciente);
      setProcedimientos(nextProcedimientos);
      setCancelaciones(await api.listCancelaciones(pacienteId));
    } catch (exception) {
      setError(exception.message);
    }
  }, [api, pacienteId]);

  useEffect(() => {
    loadPaciente();
  }, [loadPaciente]);

  useEffect(() => {
    const handleAgendaUpdate = () => {
      loadPaciente();
    };

    window.addEventListener('consultorio:agenda-updated', handleAgendaUpdate);
    return () => window.removeEventListener('consultorio:agenda-updated', handleAgendaUpdate);
  }, [loadPaciente]);

  if (error) return <div className="form-error wide">{error}</div>;
  if (!paciente) return <section className="page">Cargando paciente...</section>;

  const proximoControl = procedimientos
    .filter((item) => item.requiereControl && item.estadoControl === 'PENDIENTE' && item.fechaControl)
    .sort((a, b) => a.fechaControl.localeCompare(b.fechaControl))[0];

  return (
    <section className="page">
      <button className="back-button" onClick={onBack}>Volver a pacientes</button>
      <div className="profile-header">
        <div>
          <span className="eyebrow">Perfil del paciente</span>
          <h2>{paciente.nombre} {paciente.apellido}</h2>
          <p>{paciente.numeroHistoriaClinica} · DNI {paciente.dni} · {paciente.edad} años · {paciente.telefono || 'Sin teléfono'}</p>
          <p>{paciente.obraSocial ? `${paciente.obraSocial} ${paciente.numeroAfiliado || ''}` : 'Sin obra social cargada'}</p>
        </div>
        <div className="profile-actions">
          <button onClick={() => setEditingPaciente(true)}><User size={17} />Editar datos</button>
          <button onClick={() => setActiveTab('historia')}><FileText size={17} />Editar historia</button>
          <button className="primary-button" onClick={() => setActiveTab('procedimientos')}><Plus size={17} />Nuevo procedimiento</button>
        </div>
      </div>
      <ClinicalSummary paciente={paciente} />
      <div className={paciente.proximaCitaFecha ? 'next-control-card' : 'next-control-card empty'}>
        <Clock3 size={22} />
        <div>
          <span>Próxima cita</span>
          {paciente.proximaCitaFecha ? (
            <strong>
              {formatDate(paciente.proximaCitaFecha)} · {formatTime(paciente.proximaCitaHora)}
            </strong>
          ) : (
            <strong>Sin próximas citas</strong>
          )}
        </div>
        {paciente.proximaCitaFecha && <button onClick={onOpenAgenda}>Ver agenda</button>}
      </div>
      <div className="tabs">
        <button className={activeTab === 'datos' ? 'active' : ''} onClick={() => setActiveTab('datos')}><User size={17} />Datos</button>
        <button className={activeTab === 'historia' ? 'active' : ''} onClick={() => setActiveTab('historia')}><FileText size={17} />Historia clínica</button>
        <button className={activeTab === 'procedimientos' ? 'active' : ''} onClick={() => setActiveTab('procedimientos')}><Stethoscope size={17} />Procedimientos</button>
        <button className="disabled" disabled title="Se incorporará en una próxima etapa"><Images size={17} />Fotografías · próximamente</button>
      </div>
      {activeTab === 'datos' && <DatosPersonales paciente={paciente} />}
      {activeTab === 'historia' && <HistoriaClinicaTab api={api} pacienteId={pacienteId} onSaved={loadPaciente} />}
      {activeTab === 'procedimientos' && (
        <ProcedimientosTab api={api} pacienteId={pacienteId} onItemsLoaded={setProcedimientos} />
      )}
      <section className="cancellation-history"><h3>Historial de cancelaciones</h3><strong>Cancelaciones totales: {cancelaciones.length}</strong>{cancelaciones.length > 0 && <ul>{cancelaciones.map((item) => <li key={item.id}>{formatDate(item.fechaTurno)} · {item.horaTurno?.slice(0, 5) || 'Sin hora'} <small>Marcado el {formatDateTime(item.canceladoEn)}</small></li>)}</ul>}</section>
      {editingPaciente && (
        <PacienteModal
          api={api}
          paciente={paciente}
          onClose={() => setEditingPaciente(false)}
          onSaved={(saved) => {
            setPaciente(saved);
            setEditingPaciente(false);
          }}
        />
      )}
    </section>
  );
}

function ClinicalSummary({ paciente }) {
  return (
    <div className="clinical-summary">
      <Info label="Alergias" value={summaryValue(paciente.alergias, 'Sin alergias registradas')} />
      <Info label="Antecedentes" value={summaryValue(paciente.antecedentes, 'Sin antecedentes registrados')} />
      <Info label="Medicación" value={summaryValue(paciente.medicacionHabitual, 'Sin medicación habitual registrada')} />
    </div>
  );
}

function DatosPersonales({ paciente }) {
  return (
    <div className="details-grid">
      <Info label="Historia clínica" value={paciente.numeroHistoriaClinica} />
      <Info label="Nombre" value={paciente.nombre} />
      <Info label="Apellido" value={paciente.apellido} />
      <Info label="DNI" value={paciente.dni} />
      <Info label="Fecha de nacimiento" value={paciente.fechaNacimiento} />
      <Info label="Teléfono" value={paciente.telefono} />
      <Info label="Email" value={paciente.email} />
      <Info label="Obra social" value={paciente.obraSocial} />
      <Info label="Número de afiliado" value={paciente.numeroAfiliado} />
      <Info label="Observaciones" value={paciente.observacionesGenerales} wide />
    </div>
  );
}

function HistoriaClinicaTab({ api, pacienteId, onSaved }) {
  const [form, setForm] = useState(emptyHistoria);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.getHistoria(pacienteId).then((historia) => setForm({ ...emptyHistoria, ...historia }));
  }, [pacienteId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    await api.updateHistoria(pacienteId, form);
    setStatus('Historia clínica guardada.');
    onSaved?.();
  }

  return (
    <form className="clinical-form" onSubmit={handleSubmit}>
      <TextArea label="Antecedentes" value={form.antecedentes} onChange={(value) => update('antecedentes', value)} />
      <TextArea label="Alergias" value={form.alergias} onChange={(value) => update('alergias', value)} />
      <TextArea label="Medicación habitual" value={form.medicacionHabitual} onChange={(value) => update('medicacionHabitual', value)} />
      <TextArea label="Enfermedades previas" value={form.enfermedadesPrevias} onChange={(value) => update('enfermedadesPrevias', value)} />
      <TextArea label="Observaciones" value={form.observaciones} onChange={(value) => update('observaciones', value)} />
      {status && <div className="success-message">{status}</div>}
      <button className="primary-button" type="submit">Guardar historia</button>
    </form>
  );
}
function ProcedimientosTab({ api, pacienteId, onItemsLoaded }) {
  return (
    <TimelineTab
      title="Nuevo procedimiento"
      emptyItem={emptyProcedimiento}
      loadItems={() => api.listProcedimientos(pacienteId)}
      createItem={(data) => api.createProcedimiento(pacienteId, data)}
      deleteItem={(item) => api.deleteProcedimiento(item.id)}
      onItemsLoaded={onItemsLoaded}
      fields={[
        ['fecha', 'Fecha', 'date'],
        ['nombre', 'Nombre del procedimiento', 'text'],
        ['tipoProcedimiento', 'Tipo de procedimiento', 'selectProcedimiento'],
        ['zonaTratada', 'Zona tratada', 'text'],
        ['productoUtilizado', 'Producto utilizado', 'text'],
        ['marca', 'Marca', 'text'],
        ['lote', 'Lote', 'text'],
        ['fechaVencimiento', 'Fecha de vencimiento', 'date'],
        ['cantidadUtilizada', 'Cantidad utilizada', 'text'],
        ['descripcion', 'Descripción', 'textarea'],
        ['observaciones', 'Observaciones', 'textarea'],
        ['requiereControl', 'Requiere control', 'checkbox'],
        ['fechaControl', 'Fecha del próximo control', 'date'],
        ['estadoControl', 'Estado del control', 'selectControl'],
      ]}
      renderItem={(item) => (
        <>
          <strong>{formatDate(item.fecha)} · {item.tipoProcedimiento || item.nombre}</strong>
          {item.zonaTratada && <span>Zona: {item.zonaTratada}</span>}
          {item.productoUtilizado && (
            <span>Producto: {item.productoUtilizado}{item.marca ? ` · ${item.marca}` : ''}</span>
          )}
          {item.lote && <span>Lote: {item.lote}{item.fechaVencimiento ? ` · Vence ${formatDate(item.fechaVencimiento)}` : ''}</span>}
          {item.cantidadUtilizada && <span>Cantidad: {item.cantidadUtilizada}</span>}
          {item.descripcion && <p>{item.descripcion}</p>}
          {item.requiereControl && <span className="control-detail">Control: {item.fechaControl ? formatDate(item.fechaControl) : 'pendiente de fecha'} · {formatControlStatus(item.estadoControl)}</span>}
          {item.observaciones && <span>{item.observaciones}</span>}
        </>
      )}
    />
  );
}

function TimelineTab({ title, emptyItem, loadItems, createItem, deleteItem, fields, renderItem, onItemsLoaded }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const nextItems = await loadItems();
    setItems(nextItems);
    onItemsLoaded?.(nextItems);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await createItem(form);
      setForm(emptyItem);
      await load();
      setSuccess('✓ Procedimiento registrado correctamente');
    } catch (exception) {
      setError(exception.message);
    }
  }

  return (
    <div className="split-panel">
      <form className="side-form" onSubmit={handleSubmit}>
        <h3>{title}</h3>
        {fields.map(([field, label, type]) => (
          <DynamicField
            key={field}
            label={label}
            type={type}
            value={form[field]}
            onChange={(value) => {
              update(field, value);
              if (field === 'requiereControl' && !value) {
                update('estadoControl', 'NO_REQUIERE');
                update('fechaControl', '');
              }
              if (field === 'requiereControl' && value) {
                update('estadoControl', 'PENDIENTE');
              }
            }}
          />
        ))}
        {error && <div className="form-error">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button className="primary-button" type="submit">Guardar</button>
      </form>
      <div className="timeline">
        {items.length === 0 && <p className="empty-state">No hay registros cargados.</p>}
        {items.map((item) => <article className="timeline-item" key={item.id}>{renderItem(item)}{deleteItem && <button type="button" className="procedure-delete-button" onClick={async () => { if (!window.confirm('¿Seguro que querés eliminar este procedimiento?')) return; try { await deleteItem(item); await load(); setSuccess('Procedimiento eliminado correctamente'); } catch (exception) { setError(exception.message); } }}><Trash2 size={15}/>Eliminar</button>}</article>)}
      </div>
    </div>
  );
}

function DynamicField({ label, type, value, onChange }) {
  if (type === 'textarea') return <TextArea label={label} value={value} onChange={onChange} />;
  if (type === 'checkbox') {
    return (
      <label className="checkbox-field">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        {label}
      </label>
    );
  }
  if (type === 'selectProcedimiento') {
    return (
      <label>
        {label}
        <select value={value || ''} onChange={(event) => onChange(event.target.value)}>
          <option value="">Seleccionar</option>
          <option value="Toxina botulínica">Toxina botulínica</option>
          <option value="Ácido hialurónico">Ácido hialurónico</option>
          <option value="Bioestimuladores">Bioestimuladores</option>
          <option value="Mesoterapia">Mesoterapia</option>
          <option value="PRP">PRP</option>
          <option value="Peeling">Peeling</option>
          <option value="Otro">Otro</option>
        </select>
      </label>
    );
  }
  if (type === 'selectControl') {
    return (
      <label>
        {label}
        <select value={value || 'NO_REQUIERE'} onChange={(event) => onChange(event.target.value)}>
          <option value="NO_REQUIERE">No requiere</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="REALIZADO">Realizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </label>
    );
  }
  return <Field type={type} label={label} value={value} onChange={onChange} />;
}

function Field({ label, value, onChange, type = 'text', required = false, min, step, placeholder }) {
  return (
    <label>
      {label}
      <input type={type} value={value ?? ''} required={required} min={min} step={step} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="wide">
      {label}
      <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? 'info wide' : 'info'}>
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function formatTime(value) {
  if (!value) return '';
  return value.slice(0, 5);
}

function summaryValue(value, fallback) {
  const normalized = typeof value === 'string' ? value.trim() : value;
  return normalized ? normalized : fallback;
}

function formatControlStatus(value) {
  return {
    PENDIENTE: 'Pendiente',
    REALIZADO: 'Realizado',
    CANCELADO: 'Cancelado',
    NO_REQUIERE: 'No requiere',
  }[value] || value;
}

function toPacienteForm(paciente) {
  return {
    nombre: paciente.nombre || '',
    apellido: paciente.apellido || '',
    dni: paciente.dni || '',
    fechaNacimiento: paciente.fechaNacimiento || '',
    telefono: paciente.telefono || '',
    email: paciente.email || '',
    obraSocial: paciente.obraSocial || '',
    numeroAfiliado: paciente.numeroAfiliado || '',
    observacionesGenerales: paciente.observacionesGenerales || '',
  };
}

createRoot(document.getElementById('root')).render(<App />);
