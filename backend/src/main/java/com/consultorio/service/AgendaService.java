package com.consultorio.service;

import com.consultorio.dto.agenda.AgendarCitaRequest;
import com.consultorio.dto.agenda.AgendaEventoResponse;
import com.consultorio.dto.agenda.DisponibilidadRequest;
import com.consultorio.dto.agenda.DisponibilidadResponse;
import com.consultorio.dto.agenda.HorariosDisponiblesResponse;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.Consulta;
import com.consultorio.model.Disponibilidad;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.DisponibilidadRepository;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendaService {

    private static final ZoneId AGENDA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final LocalTime DEFAULT_OPENING = LocalTime.of(6, 0);
    private static final LocalTime DEFAULT_CLOSING = LocalTime.of(21, 0);
    private static final int DEFAULT_DURATION_MINUTES = 30;

    private final ConsultaRepository consultaRepository;
    private final DisponibilidadRepository disponibilidadRepository;
    private final PacienteService pacienteService;

    public AgendaService(
        ConsultaRepository consultaRepository,
        DisponibilidadRepository disponibilidadRepository,
        PacienteService pacienteService
    ) {
        this.consultaRepository = consultaRepository;
        this.disponibilidadRepository = disponibilidadRepository;
        this.pacienteService = pacienteService;
    }

    @Transactional(readOnly = true)
    public List<AgendaEventoResponse> obtenerEventosCalendario(LocalDate fechaInicio, LocalDate fechaFin) {
        return consultaRepository.findByFechaBetweenOrderByFechaDescHoraDesc(fechaInicio, fechaFin).stream()
                .map(this::toAgendaEventoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HorariosDisponiblesResponse obtenerHorariosDisponibles(LocalDate fecha) {
        DayOfWeek dayOfWeek = fecha.getDayOfWeek();
        Disponibilidad.DiaSemana diaSemana = convertDayOfWeek(dayOfWeek);

        List<Disponibilidad> disponibilidades = disponibilidadRepository
                .findByDiaSemanaAndActivoTrue(diaSemana);

        List<Consulta> citasDelDia = consultaRepository.findByFechaOrderByHoraAsc(fecha);

        List<LocalTime> horariosDisponibles = new ArrayList<>();
        LocalTime horaActual = disponibilidades.isEmpty() ? DEFAULT_OPENING : disponibilidades.get(0).getHoraInicio();
        LocalTime horaFin = disponibilidades.isEmpty() ? DEFAULT_CLOSING : disponibilidades.get(0).getHoraFin();
        int duracion = disponibilidades.isEmpty() ? DEFAULT_DURATION_MINUTES : disponibilidades.get(0).getDuracionCitasMinutos();

        while (horaActual.plusMinutes(duracion).compareTo(horaFin) <= 0) {
            if (!estaOcupado(horaActual, horaActual.plusMinutes(duracion), citasDelDia, duracion)) {
                horariosDisponibles.add(horaActual);
            }
            horaActual = horaActual.plusMinutes(duracion);
        }

        return new HorariosDisponiblesResponse(horariosDisponibles);
    }

    @Transactional
    public AgendaEventoResponse agendarCita(AgendarCitaRequest request) {
        Paciente paciente = pacienteService.buscarEntidad(request.pacienteId());
        
        // Validar que el horario esté disponible
        validarDisponibilidad(request.fecha(), request.hora());
        
        // Validar que no haya otra cita en el mismo horario
        validarSinConflictos(request.fecha(), request.hora());

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setFecha(request.fecha());
        consulta.setHora(request.hora());
        consulta.setMotivoConsulta(request.motivoConsulta() != null ? request.motivoConsulta() : "");
        consulta.setObservaciones(request.observaciones());
        
        if (request.tipoCita() != null) {
            consulta.setTipoCita(Consulta.TipoCita.valueOf(request.tipoCita()));
        }
        
        if (request.seniaPagada() != null) {
            consulta.setSeniaPagada(request.seniaPagada());
        }
        consulta.setMontoSenia(request.montoSenia());

        Consulta consultaGuardada = consultaRepository.save(consulta);
        return toAgendaEventoResponse(consultaGuardada);
    }

    @Transactional
    public AgendaEventoResponse actualizarCita(Long citaId, AgendarCitaRequest request) {
        Consulta consulta = consultaRepository.findById(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada."));
        Paciente paciente = pacienteService.buscarEntidad(request.pacienteId());
        validarDisponibilidad(request.fecha(), request.hora());
        validarSinConflictos(request.fecha(), request.hora(), citaId);

        consulta.setPaciente(paciente);
        consulta.setFecha(request.fecha());
        consulta.setHora(request.hora());
        consulta.setMotivoConsulta(request.motivoConsulta() != null ? request.motivoConsulta() : "");
        consulta.setObservaciones(request.observaciones());
        consulta.setTipoCita(request.tipoCita() == null
                ? Consulta.TipoCita.CONSULTA
                : Consulta.TipoCita.valueOf(request.tipoCita()));
        consulta.setSeniaPagada(Boolean.TRUE.equals(request.seniaPagada()));
        consulta.setMontoSenia(request.montoSenia());

        return toAgendaEventoResponse(consultaRepository.save(consulta));
    }

    @Transactional
    public DisponibilidadResponse crearDisponibilidad(DisponibilidadRequest request) {
        if (!request.horaInicio().isBefore(request.horaFin())) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin.");
        }
        if (request.duracionCitasMinutos() != null && request.duracionCitasMinutos() <= 0) {
            throw new IllegalArgumentException("La duración de las citas debe ser mayor que cero.");
        }
        Disponibilidad disponibilidad = new Disponibilidad();
        disponibilidad.setDiaSemana(Disponibilidad.DiaSemana.valueOf(request.diaSemana()));
        disponibilidad.setHoraInicio(request.horaInicio());
        disponibilidad.setHoraFin(request.horaFin());
        if (request.duracionCitasMinutos() != null) {
            disponibilidad.setDuracionCitasMinutos(request.duracionCitasMinutos());
        }
        if (request.activo() != null) {
            disponibilidad.setActivo(request.activo());
        }

        Disponibilidad guardada = disponibilidadRepository.save(disponibilidad);
        return DisponibilidadResponse.from(guardada);
    }

    @Transactional(readOnly = true)
    public List<DisponibilidadResponse> listarDisponibilidades() {
        return disponibilidadRepository.findByActivoTrue().stream()
                .map(DisponibilidadResponse::from)
                .toList();
    }

    @Transactional
    public void eliminarCita(Long citaId) {
        Consulta consulta = consultaRepository.findById(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada."));
        consultaRepository.delete(consulta);
    }

    @Transactional
    public AgendaEventoResponse reasignarCita(Long citaId, LocalDate nuevaFecha, LocalTime nuevaHora) {
        Consulta consulta = consultaRepository.findById(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada."));

        validarDisponibilidad(nuevaFecha, nuevaHora);
        validarSinConflictos(nuevaFecha, nuevaHora, citaId);

        consulta.setFecha(nuevaFecha);
        consulta.setHora(nuevaHora);
        Consulta actualizada = consultaRepository.save(consulta);
        return toAgendaEventoResponse(actualizada);
    }

    private void validarDisponibilidad(LocalDate fecha, LocalTime hora) {
        validarFechaYHorarioLaboral(fecha, hora);

        DayOfWeek dayOfWeek = fecha.getDayOfWeek();
        Disponibilidad.DiaSemana diaSemana = convertDayOfWeek(dayOfWeek);

        List<Disponibilidad> disponibilidades = disponibilidadRepository
                .findByDiaSemanaAndActivoTrue(diaSemana);

        if (disponibilidades.isEmpty()) {
            validarAlineacionDelTurno(hora, DEFAULT_OPENING, DEFAULT_CLOSING, DEFAULT_DURATION_MINUTES);
            return;
        }

        Disponibilidad disponibilidad = disponibilidades.get(0);
        if (hora.isBefore(disponibilidad.getHoraInicio()) ||
            hora.isAfter(disponibilidad.getHoraFin().minusMinutes(disponibilidad.getDuracionCitasMinutos()))) {
            throw new IllegalArgumentException("El horario no está dentro de la disponibilidad establecida.");
        }
        validarAlineacionDelTurno(
                hora,
                disponibilidad.getHoraInicio(),
                disponibilidad.getHoraFin(),
                disponibilidad.getDuracionCitasMinutos()
        );
    }

    private void validarAlineacionDelTurno(LocalTime hora, LocalTime inicio, LocalTime fin, int duracion) {
        long minutosDesdeInicio = Duration.between(inicio, hora).toMinutes();
        if (hora.isAfter(fin.minusMinutes(duracion)) || minutosDesdeInicio < 0 || minutosDesdeInicio % duracion != 0) {
            throw new IllegalArgumentException("El horario seleccionado no corresponde a un turno disponible.");
        }
    }

    private void validarFechaYHorarioLaboral(LocalDate fecha, LocalTime hora) {
        LocalDateTime ahora = LocalDateTime.now(AGENDA_ZONE).withSecond(0).withNano(0);
        if (LocalDateTime.of(fecha, hora).isBefore(ahora)) {
            throw new IllegalArgumentException("No se pueden agendar turnos en una fecha u hora anterior.");
        }

        if (hora.isBefore(DEFAULT_OPENING) || hora.isAfter(DEFAULT_CLOSING)) {
            throw new IllegalArgumentException("El horario laboral es de 06:00 a 21:00.");
        }
    }

    private void validarSinConflictos(LocalDate fecha, LocalTime hora) {
        validarSinConflictos(fecha, hora, null);
    }

    private void validarSinConflictos(LocalDate fecha, LocalTime hora, Long citaIdExcluida) {
        List<Consulta> citasDelDia = consultaRepository.findByFechaOrderByHoraAsc(fecha).stream()
                .filter(cita -> citaIdExcluida == null || !cita.getId().equals(citaIdExcluida))
                .toList();

        boolean mismoHorarioOcupado = citasDelDia.stream()
                .anyMatch(cita -> cita.getHora() != null
                        && cita.getHora().equals(hora));
        if (mismoHorarioOcupado) {
            throw new IllegalArgumentException("Ya existe un turno agendado para esa fecha y hora.");
        }
        
        DayOfWeek dayOfWeek = fecha.getDayOfWeek();
        Disponibilidad.DiaSemana diaSemana = convertDayOfWeek(dayOfWeek);
        List<Disponibilidad> disponibilidades = disponibilidadRepository
                .findByDiaSemanaAndActivoTrue(diaSemana);

        if (disponibilidades.isEmpty()) {
            return;
        }

        Disponibilidad disponibilidad = disponibilidades.get(0);
        int duracion = disponibilidad.getDuracionCitasMinutos();
        LocalTime horaFin = hora.plusMinutes(duracion);

        if (estaOcupado(hora, horaFin, citasDelDia, duracion)) {
            throw new IllegalArgumentException("El horario ya está ocupado.");
        }
    }

    private boolean estaOcupado(LocalTime horaInicio, LocalTime horaFin, List<Consulta> citas, int duracion) {
        for (Consulta cita : citas) {
            if (cita.getHora() != null) {
                LocalTime horaActual = cita.getHora();
                LocalTime horaFinalCita = horaActual.plusMinutes(duracion);

                if (horaInicio.isBefore(horaFinalCita) && horaFin.isAfter(horaActual)) {
                    return true;
                }
            }
        }
        return false;
    }

    private Disponibilidad.DiaSemana convertDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> Disponibilidad.DiaSemana.LUNES;
            case TUESDAY -> Disponibilidad.DiaSemana.MARTES;
            case WEDNESDAY -> Disponibilidad.DiaSemana.MIERCOLES;
            case THURSDAY -> Disponibilidad.DiaSemana.JUEVES;
            case FRIDAY -> Disponibilidad.DiaSemana.VIERNES;
            case SATURDAY -> Disponibilidad.DiaSemana.SABADO;
            case SUNDAY -> Disponibilidad.DiaSemana.DOMINGO;
        };
    }

    private AgendaEventoResponse toAgendaEventoResponse(Consulta consulta) {
        return new AgendaEventoResponse(
            consulta.getId(),
            consulta.getPaciente().getId(),
            consulta.getPaciente().getNombre(),
            consulta.getPaciente().getApellido(),
            consulta.getFecha(),
            consulta.getHora(),
            consulta.getMotivoConsulta(),
            consulta.getObservaciones(),
            consulta.getTipoCita().name(),
            consulta.getSeniaPagada(),
            consulta.getMontoSenia(),
            "confirmada"
        );
    }
}
