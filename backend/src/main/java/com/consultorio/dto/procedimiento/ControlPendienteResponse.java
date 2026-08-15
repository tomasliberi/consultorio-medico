package com.consultorio.dto.procedimiento;

import java.time.LocalDate;

public record ControlPendienteResponse(
        Long procedimientoId,
        Long pacienteId,
        String pacienteNombre,
        String pacienteApellido,
        String procedimiento,
        String zonaTratada,
        LocalDate fechaProcedimiento,
        LocalDate fechaControl
) {
}
