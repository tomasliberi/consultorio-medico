package com.consultorio.dto.procedimiento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ProcedimientoRequest(
        @NotNull LocalDate fecha,
        @NotBlank String nombre,
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
