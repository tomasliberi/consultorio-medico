package com.consultorio.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FacturacionResponse(
        Long id, String procedimiento, Long pacienteId, String pacienteNombre,
        String pacienteApellido, BigDecimal facturacionBruta, BigDecimal facturacionNeta,
        BigDecimal diferencia, LocalDate fecha
) {}
