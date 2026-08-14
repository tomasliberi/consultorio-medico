package com.consultorio.dto.agenda;

import com.consultorio.model.Disponibilidad;
import java.time.LocalTime;

public record DisponibilidadResponse(
    Long id,
    String diaSemana,
    LocalTime horaInicio,
    LocalTime horaFin,
    Integer duracionCitasMinutos,
    Boolean activo
) {
    public static DisponibilidadResponse from(Disponibilidad disponibilidad) {
        return new DisponibilidadResponse(
            disponibilidad.getId(),
            disponibilidad.getDiaSemana().name(),
            disponibilidad.getHoraInicio(),
            disponibilidad.getHoraFin(),
            disponibilidad.getDuracionCitasMinutos(),
            disponibilidad.getActivo()
        );
    }
}
