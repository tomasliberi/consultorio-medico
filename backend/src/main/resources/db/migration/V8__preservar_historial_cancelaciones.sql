-- El historial es trazabilidad y no debe depender del ciclo de vida de sus entidades origen.
-- Se eliminan las FK para permitir conservar paciente_id/consulta_id como referencias históricas.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'cancelaciones'::regclass
      AND confrelid = 'consultas'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE cancelaciones DROP CONSTRAINT %I', constraint_name);
    END IF;

    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'cancelaciones'::regclass
      AND confrelid = 'pacientes'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE cancelaciones DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;
