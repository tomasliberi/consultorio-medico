package com.consultorio.service;

import com.consultorio.dto.consulta.ConsultaRequest;
import com.consultorio.dto.consulta.ConsultaResponse;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.Consulta;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteService pacienteService;

    public ConsultaService(ConsultaRepository consultaRepository, PacienteService pacienteService) {
        this.consultaRepository = consultaRepository;
        this.pacienteService = pacienteService;
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidad(pacienteId);
        return consultaRepository.findByPacienteIdOrderByFechaDescIdDesc(pacienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultaResponse obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Transactional
    public ConsultaResponse crear(Long pacienteId, ConsultaRequest request) {
        Paciente paciente = pacienteService.buscarEntidad(pacienteId);
        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        aplicarDatos(consulta, request);
        return toResponse(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponse actualizar(Long id, ConsultaRequest request) {
        Consulta consulta = buscarEntidad(id);
        aplicarDatos(consulta, request);
        return toResponse(consulta);
    }

    private Consulta buscarEntidad(Long id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta no encontrada."));
    }

    private void aplicarDatos(Consulta consulta, ConsultaRequest request) {
        consulta.setFecha(request.fecha());
        consulta.setMotivoConsulta(request.motivoConsulta());
        consulta.setEvaluacion(request.evaluacion());
        consulta.setDiagnostico(request.diagnostico());
        consulta.setEvolucion(request.evolucion());
        consulta.setObservaciones(request.observaciones());
    }

    private ConsultaResponse toResponse(Consulta consulta) {
        return new ConsultaResponse(
                consulta.getId(),
                consulta.getPaciente().getId(),
                consulta.getFecha(),
                consulta.getMotivoConsulta(),
                consulta.getEvaluacion(),
                consulta.getDiagnostico(),
                consulta.getEvolucion(),
                consulta.getObservaciones()
        );
    }
}
