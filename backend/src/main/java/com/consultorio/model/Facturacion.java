package com.consultorio.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "facturaciones")
public class Facturacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String procedimiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal facturacionBruta;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal facturacionNeta;

    @Column(nullable = false)
    private LocalDate fecha;

    public Long getId() { return id; }
    public String getProcedimiento() { return procedimiento; }
    public void setProcedimiento(String procedimiento) { this.procedimiento = procedimiento; }
    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }
    public BigDecimal getFacturacionBruta() { return facturacionBruta; }
    public void setFacturacionBruta(BigDecimal facturacionBruta) { this.facturacionBruta = facturacionBruta; }
    public BigDecimal getFacturacionNeta() { return facturacionNeta; }
    public void setFacturacionNeta(BigDecimal facturacionNeta) { this.facturacionNeta = facturacionNeta; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
