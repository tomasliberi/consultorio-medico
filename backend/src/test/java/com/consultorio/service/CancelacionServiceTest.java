package com.consultorio.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import com.consultorio.model.Consulta;
import com.consultorio.model.Paciente;
import com.consultorio.repository.CancelacionRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class CancelacionServiceTest {
    @Test void registraUnaSolaCancelacionParaTurnoCancelado() {
        CancelacionRepository repository = mock(CancelacionRepository.class);
        when(repository.existsByConsultaId(4L)).thenReturn(false, true);
        Paciente paciente = new Paciente();
        Consulta consulta = new Consulta();
        ReflectionTestUtils.setField(consulta, "id", 4L);
        consulta.setPaciente(paciente); consulta.setFecha(LocalDate.of(2026, 8, 22)); consulta.setHora(LocalTime.of(16, 30)); consulta.setEstado(Consulta.EstadoCita.CANCELO);
        CancelacionService service = new CancelacionService(repository, mock(PacienteService.class));
        service.registrarSiCorresponde(consulta); service.registrarSiCorresponde(consulta);
        verify(repository, times(1)).save(any());
    }
    @Test void otrosEstadosNoRegistranCancelacion() {
        CancelacionRepository repository = mock(CancelacionRepository.class);
        Consulta consulta = new Consulta(); consulta.setEstado(Consulta.EstadoCita.PENDIENTE);
        new CancelacionService(repository, mock(PacienteService.class)).registrarSiCorresponde(consulta);
        verify(repository, never()).save(any());
    }
}
