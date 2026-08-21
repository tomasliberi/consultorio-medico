package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.consultorio.model.Consulta.TipoCita;
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

    TipoCita tipoCita,

    @NotBlank
    @Size(max = 2000) String motivoConsulta,

    @Size(max = 5000) String observaciones,

    Boolean seniaPagada,

    @PositiveOrZero
    BigDecimal montoSenia
) {}
