package com.consultorio.service;

import com.consultorio.dto.paciente.CancelacionResponse;
import com.consultorio.model.Cancelacion;
import com.consultorio.model.Consulta;
import com.consultorio.repository.CancelacionRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CancelacionService {
    private final CancelacionRepository repository;
    private final PacienteService pacienteService;
    public CancelacionService(CancelacionRepository repository, PacienteService pacienteService) { this.repository = repository; this.pacienteService = pacienteService; }

    @Transactional
    public void registrarSiCorresponde(Consulta consulta) {
        if (consulta.getEstado() != Consulta.EstadoCita.CANCELO || repository.existsByConsultaId(consulta.getId())) return;
        Cancelacion cancelacion = new Cancelacion();
        cancelacion.setPaciente(consulta.getPaciente());
        cancelacion.setConsultaId(consulta.getId());
        cancelacion.setFechaTurno(consulta.getFecha());
        cancelacion.setHoraTurno(consulta.getHora());
        cancelacion.setCanceladoEn(LocalDateTime.now());
        repository.save(cancelacion);
    }

    @Transactional(readOnly = true)
    public List<CancelacionResponse> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidad(pacienteId);
        return repository.findByPacienteIdOrderByCanceladoEnDesc(pacienteId).stream().map(c -> new CancelacionResponse(c.getId(), c.getConsultaId(), c.getFechaTurno(), c.getHoraTurno(), c.getCanceladoEn())).toList();
    }
}
