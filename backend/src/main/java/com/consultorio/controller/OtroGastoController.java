package com.consultorio.controller;
import com.consultorio.model.OtroGasto; import com.consultorio.service.OtroGastoService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/otros-gastos") public class OtroGastoController { private final OtroGastoService service; public OtroGastoController(OtroGastoService s){service=s;} @GetMapping public List<OtroGasto> listar(){return service.listar();} @PostMapping public OtroGasto crear(@Valid @RequestBody OtroGasto gasto){return service.crear(gasto);} }
