package com.consultorio.controller;

import com.consultorio.model.OtroGasto;
import com.consultorio.service.OtroGastoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otros-gastos")
public class OtroGastoController {
    private final OtroGastoService service;

    public OtroGastoController(OtroGastoService service) {
        this.service = service;
    }

    @GetMapping
    public List<OtroGasto> listar() { return service.listar(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OtroGasto crear(@Valid @RequestBody OtroGasto gasto) { return service.crear(gasto); }

    @PutMapping("/{id}")
    public OtroGasto actualizar(@PathVariable Long id, @Valid @RequestBody OtroGasto gasto) {
        return service.actualizar(id, gasto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
