package com.consultorio.service;

import com.consultorio.dto.procedimiento.ProcedimientoRequest;
import com.consultorio.dto.procedimiento.ProcedimientoResponse;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.EstadoControl;
import com.consultorio.model.Paciente;
import com.consultorio.model.Procedimiento;
import com.consultorio.repository.ProcedimientoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProcedimientoService {

    private final ProcedimientoRepository procedimientoRepository;
    private final PacienteService pacienteService;

    public ProcedimientoService(
            ProcedimientoRepository procedimientoRepository,
            PacienteService pacienteService
    ) {
        this.procedimientoRepository = procedimientoRepository;
        this.pacienteService = pacienteService;
    }

    @Transactional(readOnly = true)
    public List<ProcedimientoResponse> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidad(pacienteId);
        return procedimientoRepository.findByPacienteIdOrderByFechaDescIdDesc(pacienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProcedimientoResponse obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Transactional
    public ProcedimientoResponse crear(Long pacienteId, ProcedimientoRequest request) {
        Paciente paciente = pacienteService.buscarEntidad(pacienteId);
        Procedimiento procedimiento = new Procedimiento();
        procedimiento.setPaciente(paciente);
        aplicarDatos(procedimiento, request);
        return toResponse(procedimientoRepository.save(procedimiento));
    }

    @Transactional
    public ProcedimientoResponse actualizar(Long id, ProcedimientoRequest request) {
        Procedimiento procedimiento = buscarEntidad(id);
        aplicarDatos(procedimiento, request);
        return toResponse(procedimiento);
    }

    private Procedimiento buscarEntidad(Long id) {
        return procedimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado."));
    }

    private void aplicarDatos(Procedimiento procedimiento, ProcedimientoRequest request) {
        procedimiento.setFecha(request.fecha());
        procedimiento.setNombre(request.nombre());
        procedimiento.setTipoProcedimiento(request.tipoProcedimiento());
        procedimiento.setZonaTratada(request.zonaTratada());
        procedimiento.setProductoUtilizado(request.productoUtilizado());
        procedimiento.setMarca(request.marca());
        procedimiento.setLote(request.lote());
        procedimiento.setFechaVencimiento(request.fechaVencimiento());
        procedimiento.setCantidadUtilizada(request.cantidadUtilizada());
        procedimiento.setDescripcion(request.descripcion());
        procedimiento.setObservaciones(request.observaciones());
        procedimiento.setRequiereControl(Boolean.TRUE.equals(request.requiereControl()));
        procedimiento.setFechaControl(request.fechaControl());
        procedimiento.setEstadoControl(resolveEstadoControl(request));
    }

    private ProcedimientoResponse toResponse(Procedimiento procedimiento) {
        return new ProcedimientoResponse(
                procedimiento.getId(),
                procedimiento.getPaciente().getId(),
                procedimiento.getFecha(),
                procedimiento.getNombre(),
                procedimiento.getTipoProcedimiento(),
                procedimiento.getZonaTratada(),
                procedimiento.getProductoUtilizado(),
                procedimiento.getMarca(),
                procedimiento.getLote(),
                procedimiento.getFechaVencimiento(),
                procedimiento.getCantidadUtilizada(),
                procedimiento.getDescripcion(),
                procedimiento.getObservaciones(),
                procedimiento.getRequiereControl(),
                procedimiento.getFechaControl(),
                procedimiento.getEstadoControl() == null ? EstadoControl.NO_REQUIERE.name() : procedimiento.getEstadoControl().name()
        );
    }

    private EstadoControl resolveEstadoControl(ProcedimientoRequest request) {
        if (!Boolean.TRUE.equals(request.requiereControl())) {
            return EstadoControl.NO_REQUIERE;
        }

        if (request.estadoControl() == null || request.estadoControl().isBlank()) {
            return EstadoControl.PENDIENTE;
        }

        return EstadoControl.valueOf(request.estadoControl());
    }
}
