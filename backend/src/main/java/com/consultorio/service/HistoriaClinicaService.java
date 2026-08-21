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
    private final AuditoriaService auditoriaService;

    public HistoriaClinicaService(
            HistoriaClinicaRepository historiaClinicaRepository,
            PacienteService pacienteService,
            AuditoriaService auditoriaService
    ) {
        this.historiaClinicaRepository = historiaClinicaRepository;
        this.pacienteService = pacienteService;
        this.auditoriaService = auditoriaService;
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

        boolean nueva = historiaClinica.getId() == null;
        StringBuilder cambios = new StringBuilder("{\"changedFields\":[");
        if (!java.util.Objects.equals(historiaClinica.getAntecedentes(), request.antecedentes())) cambios.append("\"antecedentes\",");
        if (!java.util.Objects.equals(historiaClinica.getAlergias(), request.alergias())) cambios.append("\"alergias\",");
        if (!java.util.Objects.equals(historiaClinica.getMedicacionHabitual(), request.medicacionHabitual())) cambios.append("\"medicacionHabitual\",");
        if (!java.util.Objects.equals(historiaClinica.getEnfermedadesPrevias(), request.enfermedadesPrevias())) cambios.append("\"enfermedadesPrevias\",");
        if (!java.util.Objects.equals(historiaClinica.getObservaciones(), request.observaciones())) cambios.append("\"observaciones\",");
        if (cambios.charAt(cambios.length() - 1) == ',') cambios.setLength(cambios.length() - 1);
        cambios.append("]}");
        historiaClinica.setAntecedentes(request.antecedentes());
        historiaClinica.setAlergias(request.alergias());
        historiaClinica.setMedicacionHabitual(request.medicacionHabitual());
        historiaClinica.setEnfermedadesPrevias(request.enfermedadesPrevias());
        historiaClinica.setObservaciones(request.observaciones());

        HistoriaClinica guardada = historiaClinicaRepository.save(historiaClinica);
        auditoriaService.registrar(nueva ? "CREAR" : "MODIFICAR", "HISTORIA_CLINICA", guardada.getId(), pacienteId, cambios.toString());
        return toResponse(guardada);
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
