CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS pacientes (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    telefono VARCHAR(40),
    email VARCHAR(160),
    obra_social VARCHAR(120),
    numero_afiliado VARCHAR(80),
    observaciones_generales TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS historias_clinicas (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL UNIQUE REFERENCES pacientes(id) ON DELETE CASCADE,
    antecedentes TEXT,
    alergias TEXT,
    medicacion_habitual TEXT,
    enfermedades_previas TEXT,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS consultas (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME,
    tipo_cita VARCHAR(30) NOT NULL DEFAULT 'CONSULTA',
    senia_pagada BOOLEAN NOT NULL DEFAULT FALSE,
    monto_senia NUMERIC(12,2) DEFAULT 0,
    motivo_consulta TEXT NOT NULL,
    evaluacion TEXT,
    diagnostico TEXT,
    evolucion TEXT,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_consultas_fecha_hora UNIQUE (fecha, hora)
);

ALTER TABLE consultas ADD COLUMN IF NOT EXISTS tipo_cita VARCHAR(30);
UPDATE consultas SET tipo_cita = 'CONSULTA' WHERE tipo_cita IS NULL;
ALTER TABLE consultas ALTER COLUMN tipo_cita SET DEFAULT 'CONSULTA';
ALTER TABLE consultas ALTER COLUMN tipo_cita SET NOT NULL;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS senia_pagada BOOLEAN;
UPDATE consultas SET senia_pagada = FALSE WHERE senia_pagada IS NULL;
ALTER TABLE consultas ALTER COLUMN senia_pagada SET DEFAULT FALSE;
ALTER TABLE consultas ALTER COLUMN senia_pagada SET NOT NULL;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS monto_senia NUMERIC(12,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS procedimientos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    tipo_procedimiento VARCHAR(120),
    zona_tratada VARCHAR(160),
    producto_utilizado VARCHAR(160),
    marca VARCHAR(120),
    lote VARCHAR(80),
    fecha_vencimiento DATE,
    cantidad_utilizada VARCHAR(80),
    descripcion TEXT,
    observaciones TEXT,
    requiere_control BOOLEAN DEFAULT FALSE,
    fecha_control DATE,
    estado_control VARCHAR(30) DEFAULT 'NO_REQUIERE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS disponibilidades (
    id BIGSERIAL PRIMARY KEY,
    dia_semana VARCHAR(30) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_citas_minutos INTEGER NOT NULL DEFAULT 30,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS facturaciones (
    id BIGSERIAL PRIMARY KEY,
    procedimiento VARCHAR(200) NOT NULL,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    facturacion_bruta NUMERIC(14,2) NOT NULL,
    facturacion_neta NUMERIC(14,2) NOT NULL,
    fecha DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consultas_paciente_fecha ON consultas (paciente_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_consultas_agenda ON consultas (fecha, hora) WHERE hora IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_procedimientos_paciente_fecha ON procedimientos (paciente_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_facturaciones_fecha ON facturaciones (fecha DESC);
