package com.consultorio.controller;

import com.consultorio.dto.consulta.ConsultaRequest;
import com.consultorio.dto.consulta.ConsultaResponse;
import com.consultorio.service.ConsultaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping("/pacientes/{pacienteId}/consultas")
    public List<ConsultaResponse> listarPorPaciente(@PathVariable Long pacienteId) {
        return consultaService.listarPorPaciente(pacienteId);
    }

    @PostMapping("/pacientes/{pacienteId}/consultas")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaResponse crear(
            @PathVariable Long pacienteId,
            @Valid @RequestBody ConsultaRequest request
    ) {
        return consultaService.crear(pacienteId, request);
    }

    @GetMapping("/consultas/{id}")
    public ConsultaResponse obtenerPorId(@PathVariable Long id) {
        return consultaService.obtenerPorId(id);
    }

    @PutMapping("/consultas/{id}")
    public ConsultaResponse actualizar(@PathVariable Long id, @Valid @RequestBody ConsultaRequest request) {
        return consultaService.actualizar(id, request);
    }
}
