package com.consultorio.service;

import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.OtroGasto;
import com.consultorio.repository.OtroGastoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OtroGastoService {
    private final OtroGastoRepository repository;
    private final AuditoriaService auditoriaService;

    public OtroGastoService(OtroGastoRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<OtroGasto> listar() {
        return repository.findAllByOrderByFechaDescIdDesc();
    }

    @Transactional
    public OtroGasto crear(OtroGasto gasto) {
        OtroGasto guardado = repository.save(gasto);
        auditoriaService.registrar("CREAR", "OTRO_GASTO", guardado.getId(), null, detalle(guardado));
        return guardado;
    }

    @Transactional
    public OtroGasto actualizar(Long id, OtroGasto datos) {
        OtroGasto gasto = buscar(id);
        String detalleOriginal = detalle(gasto);
        gasto.setDescripcion(datos.getDescripcion());
        gasto.setCategoria(datos.getCategoria());
        gasto.setMonto(datos.getMonto());
        gasto.setFecha(datos.getFecha());
        gasto.setObservacion(datos.getObservacion());
        OtroGasto actualizado = repository.save(gasto);
        auditoriaService.registrar("MODIFICAR", "OTRO_GASTO", id, null, "{\"before\":" + detalleOriginal + ",\"after\":" + detalle(actualizado) + "}");
        return actualizado;
    }

    @Transactional
    public void eliminar(Long id) {
        OtroGasto gasto = buscar(id);
        auditoriaService.registrar("ELIMINAR", "OTRO_GASTO", id, null, "{\"before\":" + detalle(gasto) + "}");
        repository.delete(gasto);
    }

    private OtroGasto buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado."));
    }
    private String detalle(OtroGasto gasto) { return "{\"descripcion\":\"" + safe(gasto.getDescripcion()) + "\",\"categoria\":\"" + safe(gasto.getCategoria()) + "\",\"monto\":" + gasto.getMonto() + ",\"fecha\":\"" + gasto.getFecha() + "\"}"; }
    private String safe(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
