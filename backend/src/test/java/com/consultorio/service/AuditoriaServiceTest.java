package com.consultorio.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

import com.consultorio.model.Auditoria;
import com.consultorio.repository.AuditoriaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class AuditoriaServiceTest {
    private final AuditoriaRepository repository = Mockito.mock(AuditoriaRepository.class);

    @AfterEach
    void clearContext() { SecurityContextHolder.clearContext(); }

    @Test
    void registraUsuarioYFechaDelBackendSinSecretos() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("profesional", "ignored", java.util.List.of()));
        new AuditoriaService(repository).registrar("MODIFICAR", "HISTORIA_CLINICA", 7L, 3L,
                "{\"changedFields\":[\"alergias\"]}");

        ArgumentCaptor<Auditoria> captor = ArgumentCaptor.forClass(Auditoria.class);
        verify(repository).save(captor.capture());
        Auditoria item = captor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals("profesional", item.getUsuario());
        org.junit.jupiter.api.Assertions.assertNotNull(item.getFechaHora());
        org.junit.jupiter.api.Assertions.assertTrue(item.getDetalle().contains("alergias"));
        org.junit.jupiter.api.Assertions.assertFalse(item.getDetalle().toLowerCase().contains("password"));
        org.junit.jupiter.api.Assertions.assertFalse(item.getDetalle().toLowerCase().contains("csrf"));
    }

    @Test
    void rechazaAuditoriaSinSesion() {
        SecurityContextHolder.clearContext();
        assertThrows(IllegalStateException.class,
                () -> new AuditoriaService(repository).registrar("CREAR", "PROCEDIMIENTO", 1L, 2L, "{}"));
    }
}
