import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { addMinutes, endOfMonth, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, CalendarDays, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles/calendar.css';

const localizer = dateFnsLocalizer({
  format, parse, getDay, locales: { es },
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
});
const emptyForm = { pacienteId: '', fecha: format(new Date(), 'yyyy-MM-dd'), hora: '09:00', tipoCita: 'CONSULTA', motivoConsulta: '', observaciones: '', seniaPagada: false, montoSenia: '' };
const appointmentStatusLabel = { PENDIENTE: 'PENDIENTE', ASISTIO: 'ASISTIÓ', CANCELO: 'CANCELÓ' };
const emptyPatient = { nombreCompleto: '', dni: '' };
const toLocalDate = (fecha, hora = '00:00') => parse(`${fecha} ${(hora || '00:00').slice(0, 5)}`, 'yyyy-MM-dd HH:mm', new Date());
const workTimes = Array.from({ length: 31 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

export default function CalendarComponent({ api }) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState(emptyPatient);
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientNotice, setPatientNotice] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [error, setError] = useState('');
  const patientAutocompleteRef = useRef(null);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setEvents(await api.listAgendaEventos(format(startOfMonth(date), 'yyyy-MM-dd'), format(endOfMonth(date), 'yyyy-MM-dd')));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [api, date]);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { api.listPacientes('').then(setPacientes).catch((e) => setError(e.message)); }, [api]);

  useEffect(() => {
    if (!showPatientSuggestions) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (!patientAutocompleteRef.current?.contains(event.target)) {
        setShowPatientSuggestions(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setShowPatientSuggestions(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showPatientSuggestions]);

  const calendarEvents = useMemo(() => events.map((event) => {
    const start = toLocalDate(event.fecha, event.hora);
    return { ...event, title: `${event.hora?.slice(0, 5)} · ${event.pacienteNombre} ${event.pacienteApellido}`, start, end: addMinutes(start, 30) };
  }), [events]);

  const availableTimes = useMemo(() => {
    if (form.fecha !== format(new Date(), 'yyyy-MM-dd')) return workTimes;
    const currentTime = format(new Date(), 'HH:mm');
    return workTimes.filter((time) => time >= currentTime);
  }, [form.fecha]);

  const filteredPacientes = useMemo(() => {
    const query = patientSearch.trim().toLocaleLowerCase('es');
    if (!query) return pacientes;
    return pacientes.filter((patient) =>
      `${patient.nombre} ${patient.apellido} ${patient.dni || ''}`
        .toLocaleLowerCase('es')
        .includes(query),
    );
  }, [pacientes, patientSearch]);

  function selectPatient(patient) {
    setForm((current) => ({ ...current, pacienteId: String(patient.id) }));
    setPatientSearch(`${patient.apellido}, ${patient.nombre} · DNI ${patient.dni}`);
    setShowPatientSuggestions(false);
  }

  function openForm(start = new Date()) {
    const selectedTime = format(start, 'HH:mm');
    setForm({ ...emptyForm, fecha: format(start, 'yyyy-MM-dd'), hora: workTimes.includes(selectedTime) ? selectedTime : '' });
    setEditingEventId(null); setShowNewPatient(false); setNewPatient(emptyPatient);
    setError(''); setPatientNotice(''); setPatientSearch(''); setShowPatientSuggestions(false); setShowForm(true);
  }

  function editEvent(event) {
    setForm({ pacienteId: String(event.pacienteId), fecha: event.fecha, hora: event.hora?.slice(0, 5) || '', tipoCita: event.tipoCita, motivoConsulta: event.motivoConsulta || '', observaciones: event.observaciones || '', seniaPagada: Boolean(event.seniaPagada), montoSenia: event.montoSenia || '' });
    const patient = pacientes.find((item) => item.id === event.pacienteId);
    setEditingEventId(event.id); setSelectedEvent(null); setShowNewPatient(false); setError(''); setPatientNotice('');
    setPatientSearch(patient ? `${patient.apellido}, ${patient.nombre} · DNI ${patient.dni}` : `${event.pacienteApellido}, ${event.pacienteNombre}`);
    setShowPatientSuggestions(false); setShowForm(true);
  }

  async function createPatient() {
    if (!newPatient.nombreCompleto.trim() || !newPatient.dni.trim()) {
      setError('Completá el nombre completo y DNI del paciente.');
      return;
    }
    setSavingPatient(true); setError('');
    try {
      const parts = newPatient.nombreCompleto.trim().split(/\s+/);
      const saved = await api.createPaciente({ nombre: parts.shift(), apellido: parts.join(' ') || '-', dni: newPatient.dni.trim(), fechaNacimiento: null, telefono: '', email: '', obraSocial: '', numeroAfiliado: '', observacionesGenerales: '' });
      setPacientes((current) => [...current.filter((patient) => patient.id !== saved.id), saved].sort((a, b) => a.apellido.localeCompare(b.apellido)));
      selectPatient(saved);
      setPatientNotice(`${saved.nombre} ${saved.apellido} fue guardado y seleccionado.`);
      setShowNewPatient(false); setNewPatient(emptyPatient);
    } catch (e) { setError(e.message); } finally { setSavingPatient(false); }
  }

  async function submitTurno(event) {
    event.preventDefault();
    if (!form.pacienteId) { setError('Seleccioná un paciente antes de guardar el turno.'); return; }
    if (!form.fecha) { setError('Seleccioná la fecha del turno.'); return; }
    if (!form.hora) { setError('Seleccioná la hora del turno.'); return; }
    const selectedDateTime = toLocalDate(form.fecha, form.hora);
    if (selectedDateTime < new Date()) { setError('No se pueden agendar turnos en una fecha u hora anterior.'); return; }
    if (form.hora < '06:00' || form.hora > '21:00') { setError('El horario laboral es de 06:00 a 21:00.'); return; }
    if (!form.motivoConsulta.trim()) { setError('Escribí el motivo del turno antes de guardarlo.'); return; }
    setSaving(true); setError('');
    try {
      const monto = Number(form.montoSenia || 0);
      const payload = { ...form, pacienteId: Number(form.pacienteId), hora: `${form.hora}:00`, montoSenia: monto, seniaPagada: monto > 0 };
      if (editingEventId) await api.actualizarCita(editingEventId, payload);
      else await api.agendarCita(payload);
      setShowForm(false); await loadEvents(); window.dispatchEvent(new CustomEvent('consultorio:agenda-updated'));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function deleteTurno() {
    if (!window.confirm('¿Cancelar este turno?')) return;
    try { await api.cancelarCita(selectedEvent.id); setSelectedEvent(null); await loadEvents(); window.dispatchEvent(new CustomEvent('consultorio:agenda-updated')); }
    catch (e) { setError(e.message); }
  }

  async function updateStatus(status) {
    try {
      const updated = await api.actualizarEstadoCita(selectedEvent.id, status);
      setSelectedEvent(null);
      setEvents((current) => current.map((item) => item.id === updated.id ? updated : item));
      window.dispatchEvent(new CustomEvent('consultorio:agenda-updated'));
    } catch (e) { setError(e.message); }
  }

  return <section className="page agenda-page">
    <div className="page-header agenda-titlebar"><div><span className="eyebrow">Organización diaria</span><h2>Agenda</h2><p className="header-subtitle">Turnos, pacientes y seguimiento de señas.</p></div><button className="primary-button" onClick={() => openForm()}><Plus size={18}/>Nuevo turno</button></div>
    {error && <div className="form-error agenda-error">{error}</div>}
    {loading && <div className="agenda-loading">Cargando agenda…</div>}
    <div className="calendar-container">
      <div className="calendar-legend"><span><i className="legend-dot paid"/>Seña pagada</span><span><i className="legend-dot pending"/>Seña pendiente</span></div>
      <Calendar localizer={localizer} culture="es" events={calendarEvents} date={date} view={view} onNavigate={setDate} onView={setView} onSelectSlot={({ start }) => openForm(start)} onSelectEvent={setSelectedEvent} selectable popup startAccessor="start" endAccessor="end" views={['month','week','day','agenda']} messages={{ next:'Siguiente', previous:'Anterior', today:'Hoy', month:'Mes', week:'Semana', day:'Día', agenda:'Lista', date:'Fecha', time:'Hora', event:'Turno', noEventsInRange:'No hay turnos en este período.' }} eventPropGetter={(event) => ({ className: `appointment-status-${(event.estado || 'PENDIENTE').toLowerCase()}` })}/>
    </div>

    {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><section className="modal agenda-modal" onMouseDown={(e) => e.stopPropagation()}>
      <div className="modal-header"><div><span className="eyebrow">{editingEventId?'Editar turno':'Nuevo turno'}</span><h3>{editingEventId?'Modificar reserva':'Agendar paciente'}</h3></div><button onClick={() => setShowForm(false)}><X size={20}/></button></div>
      <form className="agenda-form" onSubmit={submitTurno} noValidate>
        {error && <div className="form-error agenda-full modal-form-error">{error}</div>}
        {patientNotice && <div className="success-message agenda-full">{patientNotice}</div>}
        <div className="agenda-full patient-picker">
          <label>Paciente
            <div className="patient-autocomplete" ref={patientAutocompleteRef}>
              <input type="search" required placeholder="Buscar por nombre, apellido o DNI" value={patientSearch} autoComplete="off"
                onFocus={() => setShowPatientSuggestions(true)}
                onClick={() => setShowPatientSuggestions(true)}
                onChange={(e) => { setPatientSearch(e.target.value); setForm({...form,pacienteId:''}); setShowPatientSuggestions(true); }}
              />
              {showPatientSuggestions && <div className="patient-suggestions">
                {filteredPacientes.length === 0 && <div className="patient-no-results">No se encontraron pacientes</div>}
                {filteredPacientes.map((p) => <button type="button" key={p.id} onClick={() => selectPatient(p)}>
                  <strong>{p.apellido}, {p.nombre}</strong><span>DNI {p.dni}</span>
                </button>)}
              </div>}
            </div>
          </label>
          {form.pacienteId && <div className="patient-selected">Paciente seleccionado</div>}
          <div className="patient-picker-actions"><button type="button" className="new-patient-button" onClick={()=>{setNewPatient(emptyPatient);setShowNewPatient(!showNewPatient)}}><Plus size={16}/>Crear paciente nuevo</button></div>
        </div>
        {showNewPatient && <div className="new-patient-panel agenda-full"><div className="new-patient-heading"><strong>Datos del nuevo paciente</strong><span>Solo necesitamos estos datos para reservar el turno.</span></div><label>Nombre completo<input placeholder="Nombre y apellido" value={newPatient.nombreCompleto} onChange={(e)=>setNewPatient({...newPatient,nombreCompleto:e.target.value})}/></label><label>DNI<input value={newPatient.dni} onChange={(e)=>setNewPatient({...newPatient,dni:e.target.value})}/></label><div className="new-patient-save"><button type="button" className="primary-button" disabled={savingPatient} onClick={createPatient}>{savingPatient?'Guardando…':'Guardar y seleccionar paciente'}</button></div></div>}
        <label>Fecha<input required type="date" min={format(new Date(),'yyyy-MM-dd')} value={form.fecha} onChange={(e)=>setForm({...form,fecha:e.target.value,hora:''})}/></label><label>Hora<select required value={form.hora} onChange={(e)=>setForm({...form,hora:e.target.value})}><option value="">Seleccionar horario</option>{availableTimes.map((time)=><option key={time} value={time}>{time}</option>)}</select></label>
        <label className="agenda-full">Tipo<select value={form.tipoCita} onChange={(e)=>setForm({...form,tipoCita:e.target.value})}><option value="CONSULTA">Consulta</option><option value="PROCEDIMIENTO">Procedimiento</option></select></label>
        <label className="agenda-full">Motivo<input required placeholder="Ej.: control, aplicación, evaluación" value={form.motivoConsulta} onChange={(e)=>setForm({...form,motivoConsulta:e.target.value})}/></label>
        <label className="agenda-full">Observaciones<textarea value={form.observaciones} onChange={(e)=>setForm({...form,observaciones:e.target.value})}/></label>
        <label className="agenda-full deposit-amount">Seña pagada ($)<input type="number" min="0" step="0.01" placeholder="0,00" value={form.montoSenia} onChange={(e)=>setForm({...form,montoSenia:e.target.value,seniaPagada:Number(e.target.value)>0})}/><small>Dejá 0 o vacío si todavía no pagó. Podés modificarlo después.</small></label>
        {error && <div className="form-error agenda-full turno-submit-error">{error}</div>}
        <div className="agenda-actions agenda-full"><button type="button" className="secondary-button" onClick={()=>setShowForm(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving?'Guardando…':editingEventId?'Guardar cambios':'Guardar turno'}</button></div>
      </form>
    </section></div>}

    {selectedEvent && <div className="modal-backdrop" onMouseDown={()=>setSelectedEvent(null)}><section className="modal agenda-modal event-card" onMouseDown={(e)=>e.stopPropagation()}>
      <div className="modal-header"><div><span className="eyebrow">Detalle del turno</span><h3>{selectedEvent.pacienteNombre} {selectedEvent.pacienteApellido}</h3></div><button onClick={()=>setSelectedEvent(null)}><X size={20}/></button></div>
      <div className="event-card-body"><div className="event-date"><CalendarDays size={20}/><strong>{format(selectedEvent.start,"EEEE d 'de' MMMM · HH:mm",{locale:es})}</strong></div><p><b>DNI:</b> {pacientes.find((p)=>p.id===selectedEvent.pacienteId)?.dni || '—'}</p><p><b>Tipo:</b> {selectedEvent.tipoCita==='PROCEDIMIENTO'?'Procedimiento':'Consulta'}</p><p><b>Estado:</b> {appointmentStatusLabel[selectedEvent.estado] || 'PENDIENTE'}</p><p><b>Motivo:</b> {selectedEvent.motivoConsulta}</p>{selectedEvent.observaciones&&<p><b>Observaciones:</b> {selectedEvent.observaciones}</p>}<div className={`deposit-status ${selectedEvent.seniaPagada?'paid':'pending'}`}>{selectedEvent.seniaPagada?<CheckCircle size={18}/>:<AlertCircle size={18}/>} {selectedEvent.seniaPagada?`Seña pagada: $${Number(selectedEvent.montoSenia || 0).toLocaleString('es-AR')}`:'Seña pendiente'}</div></div>
      <div className="agenda-actions"><button className="secondary-button" onClick={()=>updateStatus('PENDIENTE')}>Pendiente</button><button className="secondary-button status-action-attended" onClick={()=>updateStatus('ASISTIO')}>Asistió</button><button className="danger-button status-action-cancelled" onClick={()=>updateStatus('CANCELO')}>Canceló</button><button className="secondary-button" onClick={()=>editEvent(selectedEvent)}>Editar turno</button><button className="secondary-button" onClick={()=>setSelectedEvent(null)}>Cerrar</button></div>
    </section></div>}
  </section>;
}
