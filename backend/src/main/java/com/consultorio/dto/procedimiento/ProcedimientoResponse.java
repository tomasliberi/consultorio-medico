package com.consultorio.dto.procedimiento;

import java.time.LocalDate;

public record ProcedimientoResponse(
        Long id,
        Long pacienteId,
        LocalDate fecha,
        String nombre,
        String tipoProcedimiento,
        String zonaTratada,
        String productoUtilizado,
        String marca,
        String lote,
        LocalDate fechaVencimiento,
        String cantidadUtilizada,
        String descripcion,
        String observaciones,
        Boolean requiereControl,
        LocalDate fechaControl,
        String estadoControl
) {
}
