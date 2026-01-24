-- Corregir relación con tabla clients
-- La columna client_id ya existe y contiene el documento del cliente
-- Necesitamos una nueva columna para la relación FK

-- Eliminar índice anterior si existe
DROP INDEX IF EXISTS "IDX_consents_client";

-- Agregar nueva columna para la relación con clients
ALTER TABLE consents ADD COLUMN IF NOT EXISTS client_uuid uuid NULL;

-- Crear índice para client_uuid
CREATE INDEX IF NOT EXISTS "IDX_consents_client_uuid" 
ON consents (client_uuid);

-- Crear foreign key entre consents y clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'FK_consents_client_uuid'
  ) THEN
    ALTER TABLE consents 
    ADD CONSTRAINT FK_consents_client_uuid 
    FOREIGN KEY (client_uuid) 
    REFERENCES clients(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Verificar
SELECT 'Columna client_uuid agregada correctamente' as status 
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'consents' AND column_name = 'client_uuid'
);
