package com.consultorio.service;

import com.consultorio.dto.paciente.PacienteRequest;
import com.consultorio.dto.paciente.PacienteResponse;
import com.consultorio.exception.DuplicateResourceException;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.Consulta;
import com.consultorio.model.HistoriaClinica;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.HistoriaClinicaRepository;
import com.consultorio.repository.PacienteRepository;
import java.time.LocalDate;
import java.time.Period;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {

    private static final ZoneId AGENDA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final PacienteRepository pacienteRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final ConsultaRepository consultaRepository;

    public PacienteService(
            PacienteRepository pacienteRepository,
            HistoriaClinicaRepository historiaClinicaRepository,
            ConsultaRepository consultaRepository
    ) {
        this.pacienteRepository = pacienteRepository;
        this.historiaClinicaRepository = historiaClinicaRepository;
        this.consultaRepository = consultaRepository;
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

    @Transactional
    public void eliminar(Long id) {
        Paciente paciente = buscarEntidad(id);
        pacienteRepository.delete(paciente);
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
        HistoriaClinica historiaClinica = historiaClinicaRepository.findByPacienteId(paciente.getId()).orElse(null);
        Optional<Consulta> proximaCita = buscarProximaCita(paciente.getId());
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
                paciente.getObservacionesGenerales(),
                historiaClinica != null ? historiaClinica.getAntecedentes() : null,
                historiaClinica != null ? historiaClinica.getAlergias() : null,
                historiaClinica != null ? historiaClinica.getMedicacionHabitual() : null,
                proximaCita.map(Consulta::getFecha).orElse(null),
                proximaCita.map(Consulta::getHora).orElse(null)
        );
    }

    private Optional<Consulta> buscarProximaCita(Long pacienteId) {
        LocalDate hoy = LocalDate.now(AGENDA_ZONE);
        LocalTime ahora = LocalTime.now(AGENDA_ZONE).withSecond(0).withNano(0);

        return consultaRepository.findByPacienteIdOrderByFechaAscHoraAsc(pacienteId).stream()
                .filter(consulta -> consulta.getFecha() != null)
                .filter(consulta -> consulta.getHora() != null)
                .filter(consulta -> consulta.getFecha().isAfter(hoy)
                        || (consulta.getFecha().isEqual(hoy) && !consulta.getHora().isBefore(ahora)))
                .findFirst();
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
