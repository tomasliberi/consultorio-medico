package com.consultorio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.consultorio.model.Consulta;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.HistoriaClinicaRepository;
import com.consultorio.repository.PacienteRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {
    @Mock PacienteRepository pacienteRepository;
    @Mock HistoriaClinicaRepository historiaClinicaRepository;
    @Mock ConsultaRepository consultaRepository;

    @Test
    void siguienteCitaExcluyeCanceladasYEligeLaMasProxima() {
        Paciente paciente = new Paciente();
        ReflectionTestUtils.setField(paciente, "id", 1L);
        paciente.setNombre("Ana");
        paciente.setApellido("Prueba");
        paciente.setDni("1");
        LocalDate fecha = LocalDate.now().plusDays(1);

        Consulta cancelada = cita(paciente, fecha, LocalTime.of(9, 0), Consulta.EstadoCita.CANCELO);
        Consulta proxima = cita(paciente, fecha, LocalTime.of(10, 0), Consulta.EstadoCita.PENDIENTE);
        Consulta posterior = cita(paciente, fecha.plusDays(1), LocalTime.of(8, 0), Consulta.EstadoCita.ASISTIO);

        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(historiaClinicaRepository.findByPacienteId(1L)).thenReturn(Optional.empty());
        when(consultaRepository.findByPacienteIdAndHoraIsNotNullOrderByFechaAscHoraAsc(1L))
                .thenReturn(List.of(cancelada, proxima, posterior));

        PacienteService service = new PacienteService(
                pacienteRepository, historiaClinicaRepository, consultaRepository,
                "America/Argentina/Buenos_Aires"
        );

        var response = service.obtenerPorId(1L);
        assertEquals(fecha, response.proximaCitaFecha());
        assertEquals(LocalTime.of(10, 0), response.proximaCitaHora());
    }

    private Consulta cita(Paciente paciente, LocalDate fecha, LocalTime hora, Consulta.EstadoCita estado) {
        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setFecha(fecha);
        consulta.setHora(hora);
        consulta.setEstado(estado);
        consulta.setMotivoConsulta("Control");
        return consulta;
    }
}
