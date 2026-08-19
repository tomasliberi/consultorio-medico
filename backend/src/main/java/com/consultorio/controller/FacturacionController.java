package com.consultorio.controller;

import com.consultorio.dto.facturacion.FacturacionRequest;
import com.consultorio.dto.facturacion.FacturacionResponse;
import com.consultorio.service.FacturacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/facturaciones")
public class FacturacionController {
    private final FacturacionService service;
    public FacturacionController(FacturacionService service) { this.service = service; }

    @GetMapping public List<FacturacionResponse> listar() { return service.listar(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public FacturacionResponse crear(@Valid @RequestBody FacturacionRequest request) { return service.crear(request); }
    @PutMapping("/{id}")
    public FacturacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody FacturacionRequest request) { return service.actualizar(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
