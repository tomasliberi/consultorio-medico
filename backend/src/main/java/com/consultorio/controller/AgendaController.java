package com.consultorio.controller;

import com.consultorio.dto.agenda.AgendarCitaRequest;
import com.consultorio.dto.agenda.AgendaEventoResponse;
import com.consultorio.dto.agenda.DisponibilidadRequest;
import com.consultorio.dto.agenda.DisponibilidadResponse;
import com.consultorio.dto.agenda.HorariosDisponiblesResponse;
import com.consultorio.service.AgendaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/agenda")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @GetMapping("/eventos")
    public List<AgendaEventoResponse> obtenerEventosCalendario(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        return agendaService.obtenerEventosCalendario(fechaInicio, fechaFin);
    }

    @GetMapping("/horarios-disponibles")
    public HorariosDisponiblesResponse obtenerHorariosDisponibles(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return agendaService.obtenerHorariosDisponibles(fecha);
    }

    @PostMapping("/agendar")
    @ResponseStatus(HttpStatus.CREATED)
    public AgendaEventoResponse agendarCita(@Valid @RequestBody AgendarCitaRequest request) {
        return agendaService.agendarCita(request);
    }

    @PutMapping("/citas/{citaId}")
    public AgendaEventoResponse actualizarCita(
        @PathVariable Long citaId,
        @Valid @RequestBody AgendarCitaRequest request
    ) {
        return agendaService.actualizarCita(citaId, request);
    }

    @DeleteMapping("/citas/{citaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelarCita(@PathVariable Long citaId) {
        agendaService.eliminarCita(citaId);
    }

    @PutMapping("/citas/{citaId}/estado")
    public AgendaEventoResponse actualizarEstado(@PathVariable Long citaId, @RequestBody Map<String, String> body) {
        return agendaService.actualizarEstado(citaId, body.get("estado"));
    }

    @PutMapping("/citas/{citaId}/reasignar")
    public AgendaEventoResponse reasignarCita(
        @PathVariable Long citaId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nuevaFecha,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime nuevaHora
    ) {
        return agendaService.reasignarCita(citaId, nuevaFecha, nuevaHora);
    }

    @PostMapping("/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibilidadResponse crearDisponibilidad(@Valid @RequestBody DisponibilidadRequest request) {
        return agendaService.crearDisponibilidad(request);
    }

    @GetMapping("/disponibilidades")
    public List<DisponibilidadResponse> listarDisponibilidades() {
        return agendaService.listarDisponibilidades();
    }
}
