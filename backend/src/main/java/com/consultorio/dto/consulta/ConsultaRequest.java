package com.consultorio.dto.consulta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ConsultaRequest(
        @NotNull LocalDate fecha,
        @NotBlank String motivoConsulta,
        String evaluacion,
        String diagnostico,
        String evolucion,
        String observaciones
) {
}
