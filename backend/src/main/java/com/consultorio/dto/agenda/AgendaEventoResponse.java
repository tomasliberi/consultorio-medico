package com.consultorio.dto.agenda;

import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;

public record AgendaEventoResponse(
    Long id,
    Long pacienteId,
    String pacienteNombre,
    String pacienteApellido,
    LocalDate fecha,
    LocalTime hora,
    String motivoConsulta,
    String observaciones,
    String tipoCita,
    Boolean seniaPagada,
    BigDecimal montoSenia,
    String estado
) {}
