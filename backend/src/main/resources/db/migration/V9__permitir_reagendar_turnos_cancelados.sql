-- La disponibilidad se valida en AgendaService excluyendo turnos CANCELO.
-- La restricción global impedía reutilizar el horario de un turno cancelado.
ALTER TABLE consultas DROP CONSTRAINT IF EXISTS uk_consultas_fecha_hora;

-- Mantiene la protección contra dobles reservas activas, pero permite
-- conservar turnos cancelados y reutilizar su fecha y hora.
CREATE UNIQUE INDEX IF NOT EXISTS uk_consultas_fecha_hora_activas
    ON consultas (fecha, hora)
    WHERE hora IS NOT NULL AND estado <> 'CANCELO';
