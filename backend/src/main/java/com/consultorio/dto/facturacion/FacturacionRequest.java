package com.consultorio.dto.facturacion;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FacturacionRequest(
        @NotBlank @Size(max = 200) String procedimiento,
        @NotNull Long pacienteId,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) @Digits(integer = 12, fraction = 2) BigDecimal facturacionBruta,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) @Digits(integer = 12, fraction = 2) BigDecimal facturacionNeta,
        @NotNull LocalDate fecha
) {}
