-- Crear tabla de configuración de impuestos
CREATE TABLE IF NOT EXISTS tax_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar UNIQUE NOT NULL,
  rate decimal(5,2) NOT NULL,
  "applicationType" varchar NOT NULL DEFAULT 'additional',
  "isActive" boolean DEFAULT true,
  "isDefault" boolean DEFAULT false,
  description text,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice
CREATE INDEX IF NOT EXISTS "IDX_TAX_CONFIG_DEFAULT" ON tax_configs ("isDefault", "isActive");

-- Insertar configuración por defecto
INSERT INTO tax_configs (name, rate, "applicationType", "isActive", "isDefault", description)
VALUES ('IVA 19%', 19.00, 'additional', true, true, 'Impuesto al Valor Agregado estándar en Colombia')
ON CONFLICT (name) DO NOTHING;

-- Agregar columna taxConfigId a invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "taxConfigId" uuid;

-- Crear foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_invoices_taxConfigId'
  ) THEN
    ALTER TABLE invoices
    ADD CONSTRAINT "FK_invoices_taxConfigId"
    FOREIGN KEY ("taxConfigId")
    REFERENCES tax_configs(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Actualizar facturas existentes con el impuesto por defecto
UPDATE invoices
SET "taxConfigId" = (SELECT id FROM tax_configs WHERE "isDefault" = true LIMIT 1)
WHERE "taxConfigId" IS NULL;
