UPDATE consultas SET estado = 'ASISTIO' WHERE estado IN ('ATENDIDO', 'ASISTIÓ', 'ASISTIO');
UPDATE consultas SET estado = 'CANCELO' WHERE estado IN ('CANCELADO', 'CANCELÓ', 'CANCELO');
UPDATE consultas SET estado = 'PENDIENTE' WHERE estado = 'CONFIRMADO' OR estado IS NULL;
ALTER TABLE consultas ALTER COLUMN estado SET DEFAULT 'PENDIENTE';
