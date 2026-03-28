-- Migración: Asociar plantillas de consentimiento a servicios
-- Fecha: 2026-03-17
-- Descripción: Permite asociar múltiples plantillas CN a múltiples servicios

-- 1. Crear tabla intermedia para relación muchos a muchos
CREATE TABLE IF NOT EXISTS consent_template_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "consentTemplateId" UUID NOT NULL,
  "serviceId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_consent_template 
    FOREIGN KEY ("consentTemplateId") 
    REFERENCES consent_templates(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_service 
    FOREIGN KEY ("serviceId") 
    REFERENCES services(id) 
    ON DELETE CASCADE,
  
  -- Evitar duplicados
  CONSTRAINT unique_template_service 
    UNIQUE ("consentTemplateId", "serviceId")
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_cts_template 
  ON consent_template_services("consentTemplateId");

CREATE INDEX IF NOT EXISTS idx_cts_service 
  ON consent_template_services("serviceId");

-- 3. Comentarios para documentación
COMMENT ON TABLE consent_template_services IS 
  'Tabla intermedia para relación muchos a muchos entre plantillas de consentimiento y servicios';

COMMENT ON COLUMN consent_template_services."consentTemplateId" IS 
  'ID de la plantilla de consentimiento';

COMMENT ON COLUMN consent_template_services."serviceId" IS 
  'ID del servicio al que aplica la plantilla';

-- 4. Verificar estructura
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'consent_template_services'
ORDER BY ordinal_position;
