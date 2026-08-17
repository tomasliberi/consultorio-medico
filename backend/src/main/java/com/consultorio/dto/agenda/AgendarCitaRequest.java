package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;

public record AgendarCitaRequest(
    @NotNull
    Long pacienteId,

    @NotNull
    LocalDate fecha,

    @NotNull
    LocalTime hora,

    String tipoCita,

    @NotBlank
    String motivoConsulta,

    String observaciones,

    Boolean seniaPagada,

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    BigDecimal montoSenia
) {}
