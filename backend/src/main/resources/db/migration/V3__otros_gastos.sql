CREATE TABLE IF NOT EXISTS otros_gastos (id BIGSERIAL PRIMARY KEY, descripcion VARCHAR(200) NOT NULL, categoria VARCHAR(80) NOT NULL, monto NUMERIC(14,2) NOT NULL, fecha DATE NOT NULL, observacion TEXT);
CREATE INDEX IF NOT EXISTS idx_otros_gastos_fecha ON otros_gastos (fecha DESC);
