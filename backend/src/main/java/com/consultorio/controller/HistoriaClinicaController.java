package com.consultorio.controller;

import com.consultorio.dto.historia.HistoriaClinicaRequest;
import com.consultorio.dto.historia.HistoriaClinicaResponse;
import com.consultorio.service.HistoriaClinicaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pacientes/{pacienteId}/historia-clinica")
public class HistoriaClinicaController {

    private final HistoriaClinicaService historiaClinicaService;

    public HistoriaClinicaController(HistoriaClinicaService historiaClinicaService) {
        this.historiaClinicaService = historiaClinicaService;
    }

    @GetMapping
    public HistoriaClinicaResponse obtener(@PathVariable Long pacienteId) {
        return historiaClinicaService.obtenerPorPaciente(pacienteId);
    }

    @PutMapping
    public HistoriaClinicaResponse actualizar(
            @PathVariable Long pacienteId,
            @RequestBody HistoriaClinicaRequest request
    ) {
        return historiaClinicaService.actualizar(pacienteId, request);
    }
}
