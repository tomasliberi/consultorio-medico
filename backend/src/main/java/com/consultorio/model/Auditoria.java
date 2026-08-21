package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditorias_clinicas")
public class Auditoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String usuario;
    @Column(nullable = false) private LocalDateTime fechaHora;
    @Column(nullable = false, length = 30) private String accion;
    @Column(nullable = false, length = 80) private String recurso;
    @Column(nullable = false) private Long recursoId;
    private Long pacienteId;
    @Column(nullable = false, columnDefinition = "TEXT") private String detalle;

    @PrePersist void onCreate() { if (fechaHora == null) fechaHora = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getUsuario() { return usuario; } public void setUsuario(String v) { usuario = v; }
    public LocalDateTime getFechaHora() { return fechaHora; } public void setFechaHora(LocalDateTime v) { fechaHora = v; }
    public String getAccion() { return accion; } public void setAccion(String v) { accion = v; }
    public String getRecurso() { return recurso; } public void setRecurso(String v) { recurso = v; }
    public Long getRecursoId() { return recursoId; } public void setRecursoId(Long v) { recursoId = v; }
    public Long getPacienteId() { return pacienteId; } public void setPacienteId(Long v) { pacienteId = v; }
    public String getDetalle() { return detalle; } public void setDetalle(String v) { detalle = v; }
}
