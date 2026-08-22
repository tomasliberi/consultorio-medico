ALTER TABLE procedimientos ADD COLUMN IF NOT EXISTS activo BOOLEAN;
UPDATE procedimientos SET activo = TRUE WHERE activo IS NULL;
ALTER TABLE procedimientos ALTER COLUMN activo SET DEFAULT TRUE;
ALTER TABLE procedimientos ALTER COLUMN activo SET NOT NULL;
