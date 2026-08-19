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

    public FacturacionService(FacturacionRepository repository, PacienteService pacienteService) {
        this.repository = repository;
        this.pacienteService = pacienteService;
    }

    @Transactional(readOnly = true)
    public List<FacturacionResponse> listar() {
        return repository.findAllByOrderByFechaDescIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public FacturacionResponse crear(FacturacionRequest request) {
        Facturacion facturacion = new Facturacion();
        aplicar(facturacion, request);
        return toResponse(repository.save(facturacion));
    }

    @Transactional
    public FacturacionResponse actualizar(Long id, FacturacionRequest request) {
        Facturacion facturacion = buscar(id);
        aplicar(facturacion, request);
        return toResponse(facturacion);
    }

    @Transactional
    public void eliminar(Long id) { repository.delete(buscar(id)); }

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
