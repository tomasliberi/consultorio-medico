package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

public record DisponibilidadRequest(
    @NotNull
    String diaSemana,

    @NotNull
    LocalTime horaInicio,

    @NotNull
    LocalTime horaFin,

    @Positive
    Integer duracionCitasMinutos,

    Boolean activo
) {}
