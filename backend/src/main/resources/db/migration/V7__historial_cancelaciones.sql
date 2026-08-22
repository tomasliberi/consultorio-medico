CREATE TABLE IF NOT EXISTS cancelaciones (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    consulta_id BIGINT NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    fecha_turno DATE NOT NULL,
    hora_turno TIME,
    cancelado_en TIMESTAMP NOT NULL,
    CONSTRAINT uk_cancelaciones_consulta UNIQUE (consulta_id)
);
CREATE INDEX IF NOT EXISTS idx_cancelaciones_paciente ON cancelaciones (paciente_id, cancelado_en DESC);
