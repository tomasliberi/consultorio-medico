package com.consultorio.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.consultorio.model.Paciente;
import com.consultorio.model.Procedimiento;
import com.consultorio.repository.ProcedimientoRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ProcedimientoServiceTest {
    @Test
    void eliminarMarcaInactivoConservaLaFilaYAudita() {
        ProcedimientoRepository repository = mock(ProcedimientoRepository.class);
        AuditoriaService auditoria = mock(AuditoriaService.class);
        Paciente paciente = new Paciente();
        Procedimiento procedimiento = new Procedimiento();
        procedimiento.setPaciente(paciente);
        procedimiento.setNombre("Control");
        when(repository.findById(9L)).thenReturn(Optional.of(procedimiento));

        new ProcedimientoService(repository, mock(PacienteService.class), auditoria).eliminar(9L);

        assertFalse(procedimiento.getActivo());
        verify(repository).save(procedimiento);
        verify(repository, never()).delete(any());
        verify(auditoria).registrar(eq("ELIMINAR"), eq("PROCEDIMIENTO"), eq(9L), any(), anyString());
    }
}
