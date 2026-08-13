package com.consultorio.dto.consulta;

import java.time.LocalDate;

public record ConsultaResponse(
        Long id,
        Long pacienteId,
        LocalDate fecha,
        String motivoConsulta,
        String evaluacion,
        String diagnostico,
        String evolucion,
        String observaciones
) {
}
