package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "cancelaciones", uniqueConstraints = @UniqueConstraint(name = "uk_cancelaciones_consulta", columnNames = "consulta_id"))
public class Cancelacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "paciente_id", nullable = false) private Paciente paciente;
    @Column(name = "consulta_id", nullable = false) private Long consultaId;
    @Column(nullable = false) private LocalDate fechaTurno;
    private LocalTime horaTurno;
    @Column(nullable = false) private LocalDateTime canceladoEn;
    public Long getId() { return id; }
    public Paciente getPaciente() { return paciente; } public void setPaciente(Paciente v) { paciente = v; }
    public Long getConsultaId() { return consultaId; } public void setConsultaId(Long v) { consultaId = v; }
    public LocalDate getFechaTurno() { return fechaTurno; } public void setFechaTurno(LocalDate v) { fechaTurno = v; }
    public LocalTime getHoraTurno() { return horaTurno; } public void setHoraTurno(LocalTime v) { horaTurno = v; }
    public LocalDateTime getCanceladoEn() { return canceladoEn; } public void setCanceladoEn(LocalDateTime v) { canceladoEn = v; }
}
