import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Plus,
  Search,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import './styles.css';

const API_URL = 'http://localhost:8080/api';

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

const emptyConsulta = {
  fecha: new Date().toISOString().slice(0, 10),
  motivoConsulta: '',
  evaluacion: '',
  diagnostico: '',
  evolucion: '',
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

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('consultorio_auth');
    return stored ? JSON.parse(stored) : null;
  });
  const [view, setView] = useState('inicio');
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const api = useMemo(() => createApiClient(auth), [auth]);
  const currentUser = {
    name: 'Dra. Florencia Liberi',
    role: 'Administradora',
    photoUrl: '/profile-florencia.jfif',
  };

  function handleLogin(nextAuth) {
    localStorage.setItem('consultorio_auth', JSON.stringify(nextAuth));
    setAuth(nextAuth);
    setView('inicio');
  }

  function handleLogout() {
    localStorage.removeItem('consultorio_auth');
    setAuth(null);
    setSelectedPacienteId(null);
  }

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
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
      {view === 'inicio' && <HomePage onOpenPacientes={() => setView('pacientes')} />}
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
        <PacientePerfilPage api={api} pacienteId={selectedPacienteId} onBack={() => setView('pacientes')} />
      )}
    </Shell>
  );
}

function createApiClient(auth) {
  const headers = auth ? { Authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}` } : {};

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
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
    login: () => request('/auth/login', { method: 'POST' }),
    listPacientes: (buscar) => request(`/pacientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
    getPaciente: (id) => request(`/pacientes/${id}`),
    createPaciente: (data) => request('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
    updatePaciente: (id, data) => request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getHistoria: (pacienteId) => request(`/pacientes/${pacienteId}/historia-clinica`),
    updateHistoria: (pacienteId, data) =>
      request(`/pacientes/${pacienteId}/historia-clinica`, { method: 'PUT', body: JSON.stringify(data) }),
    listConsultas: (pacienteId) => request(`/pacientes/${pacienteId}/consultas`),
    createConsulta: (pacienteId, data) =>
      request(`/pacientes/${pacienteId}/consultas`, { method: 'POST', body: JSON.stringify(data) }),
    listProcedimientos: (pacienteId) => request(`/pacientes/${pacienteId}/procedimientos`),
    createProcedimiento: (pacienteId, data) =>
      request(`/pacientes/${pacienteId}/procedimientos`, { method: 'POST', body: JSON.stringify(data) }),
  };
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const nextAuth = { username, password };
    try {
      await createApiClient(nextAuth).login();
      onLogin(nextAuth);
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
    </main>
  );
}

function Shell({ children, view, onNavigate, onLogout, user }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <LogoMark small />
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
        </nav>
        <SidebarUserProfile user={user} />
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
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

function HomePage({ onOpenPacientes }) {
  const today = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

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
        <div><span>Turnos del día</span><strong>Módulo pendiente</strong></div>
        <div><span>Próximo paciente</span><strong>Sin agenda cargada</strong></div>
        <div><span>Controles pendientes</span><strong>Se activan con procedimientos</strong></div>
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
        <button className="metric-card disabled">
          <span className="card-icon"><CalendarDays size={24} /></span>
          <strong>Agenda</strong>
          <span>Preparada para una agenda interna simple</span>
        </button>
        <button className="metric-card disabled">
          <span className="card-icon"><ClipboardList size={24} /></span>
          <strong>Controles</strong>
          <span>Próximamente listado de controles pendientes</span>
        </button>
      </div>
    </section>
  );
}

function PacientesPage({ api, onOpenPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

function PacientePerfilPage({ api, pacienteId, onBack }) {
  const [paciente, setPaciente] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [activeTab, setActiveTab] = useState('datos');
  const [error, setError] = useState('');

  async function loadPaciente() {
    setError('');
    try {
      const [nextPaciente, nextHistoria] = await Promise.all([api.getPaciente(pacienteId), api.getHistoria(pacienteId)]);
      setPaciente(nextPaciente);
      setHistoria(nextHistoria);
    } catch (exception) {
      setError(exception.message);
    }
  }

  useEffect(() => {
    loadPaciente();
  }, [pacienteId]);

  if (error) return <div className="form-error wide">{error}</div>;
  if (!paciente) return <section className="page">Cargando paciente...</section>;

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
          <button className="primary-button" onClick={() => setActiveTab('consultas')}><Plus size={17} />Nueva consulta</button>
          <button className="primary-button" onClick={() => setActiveTab('procedimientos')}><Plus size={17} />Nuevo procedimiento</button>
        </div>
      </div>
      <ClinicalSummary historia={historia} />
      <div className="tabs">
        <button className={activeTab === 'datos' ? 'active' : ''} onClick={() => setActiveTab('datos')}><User size={17} />Datos</button>
        <button className={activeTab === 'historia' ? 'active' : ''} onClick={() => setActiveTab('historia')}><FileText size={17} />Historia clínica</button>
        <button className={activeTab === 'consultas' ? 'active' : ''} onClick={() => setActiveTab('consultas')}><ClipboardList size={17} />Consultas</button>
        <button className={activeTab === 'procedimientos' ? 'active' : ''} onClick={() => setActiveTab('procedimientos')}><Stethoscope size={17} />Procedimientos</button>
      </div>
      {activeTab === 'datos' && <DatosPersonales paciente={paciente} />}
      {activeTab === 'historia' && <HistoriaClinicaTab api={api} pacienteId={pacienteId} />}
      {activeTab === 'consultas' && <ConsultasTab api={api} pacienteId={pacienteId} />}
      {activeTab === 'procedimientos' && <ProcedimientosTab api={api} pacienteId={pacienteId} />}
    </section>
  );
}

function ClinicalSummary({ historia }) {
  return (
    <div className="clinical-summary">
      <Info label="Alergias" value={historia?.alergias || 'Sin alergias registradas'} />
      <Info label="Antecedentes" value={historia?.antecedentes || 'Sin antecedentes registrados'} />
      <Info label="Medicación" value={historia?.medicacionHabitual || 'Sin medicación habitual registrada'} />
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

function HistoriaClinicaTab({ api, pacienteId }) {
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

function ConsultasTab({ api, pacienteId }) {
  return (
    <TimelineTab
      title="Nueva consulta"
      emptyItem={emptyConsulta}
      loadItems={() => api.listConsultas(pacienteId)}
      createItem={(data) => api.createConsulta(pacienteId, data)}
      fields={[
        ['fecha', 'Fecha', 'date'],
        ['motivoConsulta', 'Motivo de consulta', 'textarea'],
        ['evaluacion', 'Evaluación', 'textarea'],
        ['diagnostico', 'Diagnóstico', 'textarea'],
        ['evolucion', 'Evolución', 'textarea'],
        ['observaciones', 'Observaciones', 'textarea'],
      ]}
      renderItem={(item) => (
        <>
          <strong>{item.fecha}</strong>
          <p>{item.motivoConsulta}</p>
          {item.evaluacion && <span>Evaluación: {item.evaluacion}</span>}
          {item.diagnostico && <span>Diagnóstico: {item.diagnostico}</span>}
        </>
      )}
    />
  );
}

function ProcedimientosTab({ api, pacienteId }) {
  return (
    <TimelineTab
      title="Nuevo procedimiento"
      emptyItem={emptyProcedimiento}
      loadItems={() => api.listProcedimientos(pacienteId)}
      createItem={(data) => api.createProcedimiento(pacienteId, data)}
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
          <strong>{item.fecha} · {item.tipoProcedimiento || item.nombre}</strong>
          {item.zonaTratada && <span>Zona: {item.zonaTratada}</span>}
          {item.productoUtilizado && <span>Producto: {item.productoUtilizado}</span>}
          {item.descripcion && <p>{item.descripcion}</p>}
          {item.requiereControl && <span>Control: {item.fechaControl || 'pendiente de fecha'} · {item.estadoControl}</span>}
          {item.observaciones && <span>{item.observaciones}</span>}
        </>
      )}
    />
  );
}

function TimelineTab({ title, emptyItem, loadItems, createItem, fields, renderItem }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [error, setError] = useState('');

  async function load() {
    setItems(await loadItems());
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
        <button className="primary-button" type="submit">Guardar</button>
      </form>
      <div className="timeline">
        {items.length === 0 && <p className="empty-state">No hay registros cargados.</p>}
        {items.map((item) => <article className="timeline-item" key={item.id}>{renderItem(item)}</article>)}
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
          <option value="Otros">Otros</option>
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

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label>
      {label}
      <input type={type} value={value || ''} required={required} onChange={(event) => onChange(event.target.value)} />
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
