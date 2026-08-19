package com.consultorio.dto;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.consultorio.dto.facturacion.FacturacionRequest;
import jakarta.validation.Validation;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class FacturacionRequestValidationTest {
    @Test
    void rechazaImportesNegativosYOExcesivos() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertFalse(validator.validate(new FacturacionRequest(
                    "Consulta", 1L, new BigDecimal("-1"), BigDecimal.ZERO, LocalDate.now()
            )).isEmpty());
            assertFalse(validator.validate(new FacturacionRequest(
                    "Consulta", 1L, new BigDecimal("1234567890123.00"), BigDecimal.ZERO, LocalDate.now()
            )).isEmpty());
            assertTrue(validator.validate(new FacturacionRequest(
                    "Consulta", 1L, new BigDecimal("1000.50"), new BigDecimal("800.25"), LocalDate.now()
            )).isEmpty());
        }
    }
}
