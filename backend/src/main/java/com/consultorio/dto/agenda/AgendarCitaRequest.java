package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
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

    String motivoConsulta,

    String observaciones,

    Boolean seniaPagada,

    BigDecimal montoSenia
) {}
