package com.consultorio.service;

import com.consultorio.dto.facturacion.FacturacionRequest;
import com.consultorio.dto.facturacion.FacturacionResponse;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.Facturacion;
import com.consultorio.repository.FacturacionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FacturacionService {
    private final FacturacionRepository repository;
    private final PacienteService pacienteService;
    private final AuditoriaService auditoriaService;

    public FacturacionService(FacturacionRepository repository, PacienteService pacienteService, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.pacienteService = pacienteService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<FacturacionResponse> listar() {
        return repository.findAllByOrderByFechaDescIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public FacturacionResponse crear(FacturacionRequest request) {
        Facturacion facturacion = new Facturacion();
        aplicar(facturacion, request);
        Facturacion guardada = repository.save(facturacion);
        auditoriaService.registrar("CREAR", "FACTURACION", guardada.getId(), guardada.getPaciente().getId(), detalle(guardada));
        return toResponse(guardada);
    }

    @Transactional
    public FacturacionResponse actualizar(Long id, FacturacionRequest request) {
        Facturacion facturacion = buscar(id);
        String anterior = detalle(facturacion);
        aplicar(facturacion, request);
        Facturacion actualizada = repository.save(facturacion);
        auditoriaService.registrar("MODIFICAR", "FACTURACION", id, actualizada.getPaciente().getId(), "{\"before\":" + anterior + ",\"after\":" + detalle(actualizada) + "}");
        return toResponse(actualizada);
    }

    @Transactional
    public void eliminar(Long id) { Facturacion facturacion = buscar(id); auditoriaService.registrar("ELIMINAR", "FACTURACION", id, facturacion.getPaciente().getId(), "{\"deleted\":true,\"fecha\":\"" + facturacion.getFecha() + "\"}"); repository.delete(facturacion); }

    private String detalle(Facturacion item) { return "{\"procedimiento\":\"" + safe(item.getProcedimiento()) + "\",\"bruta\":" + item.getFacturacionBruta() + ",\"neta\":" + item.getFacturacionNeta() + ",\"fecha\":\"" + item.getFecha() + "\"}"; }
    private String safe(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }

    private Facturacion buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Facturación no encontrada."));
    }

    private void aplicar(Facturacion entity, FacturacionRequest request) {
        entity.setProcedimiento(request.procedimiento().trim());
        entity.setPaciente(pacienteService.buscarEntidad(request.pacienteId()));
        entity.setFacturacionBruta(request.facturacionBruta());
        entity.setFacturacionNeta(request.facturacionNeta());
        entity.setFecha(request.fecha());
    }

    private FacturacionResponse toResponse(Facturacion item) {
        return new FacturacionResponse(item.getId(), item.getProcedimiento(), item.getPaciente().getId(),
                item.getPaciente().getNombre(), item.getPaciente().getApellido(), item.getFacturacionBruta(),
                item.getFacturacionNeta(), item.getFacturacionBruta().subtract(item.getFacturacionNeta()), item.getFecha());
    }
}
