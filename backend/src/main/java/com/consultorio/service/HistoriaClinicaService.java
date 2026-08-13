package com.consultorio.service;

import com.consultorio.dto.historia.HistoriaClinicaRequest;
import com.consultorio.dto.historia.HistoriaClinicaResponse;
import com.consultorio.model.HistoriaClinica;
import com.consultorio.model.Paciente;
import com.consultorio.repository.HistoriaClinicaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final PacienteService pacienteService;

    public HistoriaClinicaService(
            HistoriaClinicaRepository historiaClinicaRepository,
            PacienteService pacienteService
    ) {
        this.historiaClinicaRepository = historiaClinicaRepository;
        this.pacienteService = pacienteService;
    }

    @Transactional(readOnly = true)
    public HistoriaClinicaResponse obtenerPorPaciente(Long pacienteId) {
        Paciente paciente = pacienteService.buscarEntidad(pacienteId);
        HistoriaClinica historiaClinica = historiaClinicaRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> nuevaHistoria(paciente));

        return toResponse(historiaClinica);
    }

    @Transactional
    public HistoriaClinicaResponse actualizar(Long pacienteId, HistoriaClinicaRequest request) {
        Paciente paciente = pacienteService.buscarEntidad(pacienteId);
        HistoriaClinica historiaClinica = historiaClinicaRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> nuevaHistoria(paciente));

        historiaClinica.setAntecedentes(request.antecedentes());
        historiaClinica.setAlergias(request.alergias());
        historiaClinica.setMedicacionHabitual(request.medicacionHabitual());
        historiaClinica.setEnfermedadesPrevias(request.enfermedadesPrevias());
        historiaClinica.setObservaciones(request.observaciones());

        return toResponse(historiaClinicaRepository.save(historiaClinica));
    }

    private HistoriaClinica nuevaHistoria(Paciente paciente) {
        HistoriaClinica historiaClinica = new HistoriaClinica();
        historiaClinica.setPaciente(paciente);
        return historiaClinica;
    }

    private HistoriaClinicaResponse toResponse(HistoriaClinica historiaClinica) {
        return new HistoriaClinicaResponse(
                historiaClinica.getId(),
                historiaClinica.getPaciente().getId(),
                historiaClinica.getAntecedentes(),
                historiaClinica.getAlergias(),
                historiaClinica.getMedicacionHabitual(),
                historiaClinica.getEnfermedadesPrevias(),
                historiaClinica.getObservaciones()
        );
    }
}
