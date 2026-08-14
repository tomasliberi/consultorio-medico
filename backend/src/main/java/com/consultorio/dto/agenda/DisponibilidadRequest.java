package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record DisponibilidadRequest(
    @NotNull
    String diaSemana,

    @NotNull
    LocalTime horaInicio,

    @NotNull
    LocalTime horaFin,

    Integer duracionCitasMinutos,

    Boolean activo
) {}
