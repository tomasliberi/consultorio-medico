package com.consultorio.service;

import com.consultorio.model.Auditoria;
import com.consultorio.repository.AuditoriaRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditoriaService {
    private final AuditoriaRepository repository;
    public AuditoriaService(AuditoriaRepository repository) { this.repository = repository; }

    public void registrar(String accion, String recurso, Long recursoId, Long pacienteId, String detalle) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("No hay usuario autenticado para registrar la auditoría.");
        }
        Auditoria item = new Auditoria();
        item.setUsuario(auth.getName());
        item.setFechaHora(LocalDateTime.now());
        item.setAccion(accion);
        item.setRecurso(recurso);
        item.setRecursoId(recursoId);
        item.setPacienteId(pacienteId);
        item.setDetalle(detalle == null || detalle.isBlank() ? "{}" : detalle);
        repository.save(item);
    }
}
