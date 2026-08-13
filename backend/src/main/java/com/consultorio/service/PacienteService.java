package com.consultorio.service;

import com.consultorio.dto.paciente.PacienteRequest;
import com.consultorio.dto.paciente.PacienteResponse;
import com.consultorio.exception.DuplicateResourceException;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.HistoriaClinica;
import com.consultorio.model.Paciente;
import com.consultorio.repository.PacienteRepository;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional(readOnly = true)
    public List<PacienteResponse> listar(String buscar) {
        List<Paciente> pacientes = buscar == null || buscar.isBlank()
                ? pacienteRepository.findAll()
                : pacienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrDniContainingIgnoreCase(
                        buscar,
                        buscar,
                        buscar
                );

        return pacientes.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponse obtenerPorId(Long id) {
        return toResponse(buscarEntidad(id));
    }

    @Transactional
    public PacienteResponse crear(PacienteRequest request) {
        if (pacienteRepository.existsByDni(request.dni())) {
            throw new DuplicateResourceException("Ya existe un paciente con ese DNI.");
        }

        Paciente paciente = new Paciente();
        aplicarDatos(paciente, request);

        HistoriaClinica historiaClinica = new HistoriaClinica();
        paciente.setHistoriaClinica(historiaClinica);

        return toResponse(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponse actualizar(Long id, PacienteRequest request) {
        Paciente paciente = buscarEntidad(id);

        if (pacienteRepository.existsByDniAndIdNot(request.dni(), id)) {
            throw new DuplicateResourceException("Ya existe otro paciente con ese DNI.");
        }

        aplicarDatos(paciente, request);
        return toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public Paciente buscarEntidad(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado."));
    }

    private void aplicarDatos(Paciente paciente, PacienteRequest request) {
        paciente.setNombre(request.nombre());
        paciente.setApellido(request.apellido());
        paciente.setDni(request.dni());
        paciente.setFechaNacimiento(request.fechaNacimiento());
        paciente.setTelefono(request.telefono());
        paciente.setEmail(request.email());
        paciente.setObraSocial(request.obraSocial());
        paciente.setNumeroAfiliado(request.numeroAfiliado());
        paciente.setObservacionesGenerales(request.observacionesGenerales());
    }

    private PacienteResponse toResponse(Paciente paciente) {
        return new PacienteResponse(
                paciente.getId(),
                String.format("HC-%06d", paciente.getId()),
                paciente.getNombre(),
                paciente.getApellido(),
                paciente.getDni(),
                paciente.getFechaNacimiento(),
                calcularEdad(paciente.getFechaNacimiento()),
                paciente.getTelefono(),
                paciente.getEmail(),
                paciente.getObraSocial(),
                paciente.getNumeroAfiliado(),
                paciente.getObservacionesGenerales()
        );
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
