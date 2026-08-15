package com.consultorio.controller;

import com.consultorio.dto.procedimiento.ProcedimientoRequest;
import com.consultorio.dto.procedimiento.ProcedimientoResponse;
import com.consultorio.dto.procedimiento.ControlPendienteResponse;
import com.consultorio.service.ProcedimientoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProcedimientoController {

    private final ProcedimientoService procedimientoService;

    public ProcedimientoController(ProcedimientoService procedimientoService) {
        this.procedimientoService = procedimientoService;
    }

    @GetMapping("/pacientes/{pacienteId}/procedimientos")
    public List<ProcedimientoResponse> listarPorPaciente(@PathVariable Long pacienteId) {
        return procedimientoService.listarPorPaciente(pacienteId);
    }

    @PostMapping("/pacientes/{pacienteId}/procedimientos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProcedimientoResponse crear(
            @PathVariable Long pacienteId,
            @Valid @RequestBody ProcedimientoRequest request
    ) {
        return procedimientoService.crear(pacienteId, request);
    }

    @GetMapping("/procedimientos/{id}")
    public ProcedimientoResponse obtenerPorId(@PathVariable Long id) {
        return procedimientoService.obtenerPorId(id);
    }

    @GetMapping("/procedimientos/controles-pendientes")
    public List<ControlPendienteResponse> listarControlesPendientes() {
        return procedimientoService.listarControlesPendientes();
    }

    @PutMapping("/procedimientos/{id}")
    public ProcedimientoResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProcedimientoRequest request
    ) {
        return procedimientoService.actualizar(id, request);
    }
}
