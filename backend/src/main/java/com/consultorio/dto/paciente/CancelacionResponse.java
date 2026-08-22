package com.consultorio.dto.paciente;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
public record CancelacionResponse(Long id, Long consultaId, LocalDate fechaTurno, LocalTime horaTurno, LocalDateTime canceladoEn) {}
