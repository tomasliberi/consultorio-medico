package com.consultorio.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="otros_gastos")
public class OtroGasto {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @NotBlank @Column(nullable=false,length=200) private String descripcion;
 @NotBlank @Column(nullable=false,length=80) private String categoria;
 @NotNull @DecimalMin("0.0") @Column(nullable=false,precision=14,scale=2) private BigDecimal monto;
 @NotNull @Column(nullable=false) private LocalDate fecha;
 @Column(columnDefinition="TEXT") private String observacion;
 public Long getId(){return id;} public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
 public String getCategoria(){return categoria;} public void setCategoria(String v){categoria=v;} public BigDecimal getMonto(){return monto;} public void setMonto(BigDecimal v){monto=v;}
 public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){fecha=v;} public String getObservacion(){return observacion;} public void setObservacion(String v){observacion=v;}
}
