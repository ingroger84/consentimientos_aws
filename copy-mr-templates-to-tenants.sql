-- =====================================================
-- Script: Copiar plantillas HC globales a todos los tenants
-- Fecha: 2026-01-28
-- Descripción: Copia las plantillas de consentimiento HC globales a cada tenant
-- =====================================================

-- Verificar plantillas globales existentes
SELECT 
  'Plantillas globales disponibles:' as info,
  id,
  name,
  category,
  is_active
FROM medical_record_consent_templates
WHERE tenant_id IS NULL
  AND deleted_at IS NULL;

-- Copiar plantillas globales a cada tenant
DO $$
DECLARE
  tenant_record RECORD;
  template_record RECORD;
  copied_count INTEGER := 0;
BEGIN
  -- Iterar sobre cada tenant
  FOR tenant_record IN 
    SELECT id, name, slug 
    FROM tenants 
    WHERE deleted_at IS NULL
  LOOP
    RAISE NOTICE 'Procesando tenant: % (ID: %)', tenant_record.name, tenant_record.id;
    
    -- Iterar sobre cada plantilla global
    FOR template_record IN
      SELECT * 
      FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
        AND is_active = true
        AND deleted_at IS NULL
    LOOP
      -- Verificar si ya existe una plantilla con el mismo nombre para este tenant
      IF NOT EXISTS (
        SELECT 1 
        FROM medical_record_consent_templates
        WHERE tenant_id = tenant_record.id
          AND name = template_record.name
          AND deleted_at IS NULL
      ) THEN
        -- Copiar la plantilla al tenant
        INSERT INTO medical_record_consent_templates (
          name,
          description,
          category,
          content,
          available_variables,
          is_active,
          is_default,
          requires_signature,
          tenant_id,
          created_at,
          updated_at
        ) VALUES (
          template_record.name,
          template_record.description,
          template_record.category,
          template_record.content,
          template_record.available_variables,
          template_record.is_active,
          template_record.is_default,
          template_record.requires_signature,
          tenant_record.id,
          NOW(),
          NOW()
        );
        
        copied_count := copied_count + 1;
        RAISE NOTICE '  ✓ Copiada plantilla: %', template_record.name;
      ELSE
        RAISE NOTICE '  - Plantilla ya existe: %', template_record.name;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de plantillas copiadas: %', copied_count;
  RAISE NOTICE '========================================';
END $$;

-- Verificar resultado
SELECT 
  t.name as tenant,
  t.slug,
  COUNT(mrt.id) as plantillas_hc
FROM tenants t
LEFT JOIN medical_record_consent_templates mrt 
  ON mrt.tenant_id = t.id 
  AND mrt.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, t.slug
ORDER BY t.name;

-- Detalle de plantillas por tenant
SELECT 
  t.name as tenant,
  mrt.name as plantilla,
  mrt.category,
  mrt.is_active,
  mrt.is_default
FROM tenants t
INNER JOIN medical_record_consent_templates mrt 
  ON mrt.tenant_id = t.id
WHERE t.deleted_at IS NULL
  AND mrt.deleted_at IS NULL
ORDER BY t.name, mrt.category, mrt.name;
