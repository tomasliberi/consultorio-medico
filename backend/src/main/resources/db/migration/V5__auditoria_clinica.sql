CREATE TABLE IF NOT EXISTS auditorias_clinicas (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(120) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    accion VARCHAR(30) NOT NULL,
    recurso VARCHAR(80) NOT NULL,
    recurso_id BIGINT NOT NULL,
    paciente_id BIGINT,
    detalle TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auditorias_recurso ON auditorias_clinicas (recurso, recurso_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_paciente ON auditorias_clinicas (paciente_id, fecha_hora DESC);
