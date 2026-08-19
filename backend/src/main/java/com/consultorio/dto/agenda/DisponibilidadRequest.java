package com.consultorio.dto.agenda;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.consultorio.model.Disponibilidad.DiaSemana;
import java.time.LocalTime;

public record DisponibilidadRequest(
    @NotNull
    DiaSemana diaSemana,

    @NotNull
    LocalTime horaInicio,

    @NotNull
    LocalTime horaFin,

    @Min(5) @Max(480)
    Integer duracionCitasMinutos,

    Boolean activo
) {}
