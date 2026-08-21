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

    public OtroGastoService(OtroGastoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<OtroGasto> listar() {
        return repository.findAllByOrderByFechaDescIdDesc();
    }

    @Transactional
    public OtroGasto crear(OtroGasto gasto) {
        return repository.save(gasto);
    }

    @Transactional
    public OtroGasto actualizar(Long id, OtroGasto datos) {
        OtroGasto gasto = buscar(id);
        gasto.setDescripcion(datos.getDescripcion());
        gasto.setCategoria(datos.getCategoria());
        gasto.setMonto(datos.getMonto());
        gasto.setFecha(datos.getFecha());
        gasto.setObservacion(datos.getObservacion());
        return repository.save(gasto);
    }

    @Transactional
    public void eliminar(Long id) {
        repository.delete(buscar(id));
    }

    private OtroGasto buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado."));
    }
}
