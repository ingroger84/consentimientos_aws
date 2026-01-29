-- =====================================================
-- Script: Cargar plantillas de consentimiento convencionales
-- Fecha: 2026-01-28
-- =====================================================

-- Verificar plantillas existentes
SELECT 
  'Plantillas globales existentes' as info,
  COUNT(*) as total
FROM consent_templates
WHERE "tenantId" IS NULL;

-- Verificar plantillas por tenant
SELECT 
  t.name as tenant,
  COUNT(ct.id) as plantillas
FROM tenants t
LEFT JOIN consent_templates ct ON ct."tenantId" = t.id
WHERE t."deletedAt" IS NULL
GROUP BY t.id, t.name
ORDER BY t.name;

-- Crear plantillas globales si no existen
DO $$
BEGIN
  -- Plantilla 1: Procedimiento Estético
  IF NOT EXISTS (SELECT 1 FROM consent_templates WHERE name = 'Consentimiento para Procedimiento Estético' AND "tenantId" IS NULL) THEN
    INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault")
    VALUES (
      NULL,
      'Consentimiento para Procedimiento Estético',
      'procedure',
      'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO ESTÉTICO

Yo, {{clientName}}, identificado(a) con {{documentType}} {{documentNumber}}, declaro que:

1. He sido informado(a) sobre el procedimiento: {{serviceName}}

2. Comprendo los siguientes aspectos:
   - Naturaleza del procedimiento
   - Riesgos y beneficios esperados
   - Alternativas disponibles
   - Cuidados post-procedimiento

3. Autorizo al profesional {{professionalName}} para realizar el procedimiento descrito.

Fecha: {{date}}
Sede: {{branchName}}
Empresa: {{companyName}}

_______________________________
Firma del Cliente

_______________________________
Firma del Profesional',
      'Plantilla estándar para procedimientos estéticos',
      true,
      true
    );
    RAISE NOTICE '✓ Plantilla creada: Consentimiento para Procedimiento Estético';
  END IF;

  -- Plantilla 2: Tratamiento de Datos Personales
  IF NOT EXISTS (SELECT 1 FROM consent_templates WHERE name = 'Tratamiento de Datos Personales' AND "tenantId" IS NULL) THEN
    INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault")
    VALUES (
      NULL,
      'Tratamiento de Datos Personales',
      'data_treatment',
      'AUTORIZACIÓN PARA TRATAMIENTO DE DATOS PERSONALES

Yo, {{clientName}}, identificado(a) con {{documentType}} {{documentNumber}}, autorizo a {{companyName}} para:

1. Recolectar, almacenar y procesar mis datos personales
2. Utilizar mis datos para:
   - Prestación de servicios contratados
   - Comunicaciones relacionadas con los servicios
   - Cumplimiento de obligaciones legales

3. Mis datos serán tratados conforme a la Ley 1581 de 2012

Derechos del titular:
- Conocer, actualizar y rectificar datos
- Solicitar prueba de autorización
- Revocar autorización
- Presentar quejas ante la SIC

Fecha: {{date}}
Sede: {{branchName}}

_______________________________
Firma del Cliente',
      'Plantilla para autorización de tratamiento de datos personales según Ley 1581 de 2012',
      true,
      true
    );
    RAISE NOTICE '✓ Plantilla creada: Tratamiento de Datos Personales';
  END IF;

  -- Plantilla 3: Derechos de Imagen
  IF NOT EXISTS (SELECT 1 FROM consent_templates WHERE name = 'Autorización de Derechos de Imagen' AND "tenantId" IS NULL) THEN
    INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault")
    VALUES (
      NULL,
      'Autorización de Derechos de Imagen',
      'image_rights',
      'AUTORIZACIÓN DE USO DE IMAGEN

Yo, {{clientName}}, identificado(a) con {{documentType}} {{documentNumber}}, autorizo a {{companyName}} para:

1. Tomar fotografías y/o videos de mi persona
2. Utilizar dichas imágenes para:
   - Fines médicos y de seguimiento
   - Material educativo y científico
   - Publicidad y promoción (con autorización expresa)

3. Las imágenes serán tratadas con confidencialidad y respeto

Autorizo uso para publicidad: [ ] SÍ  [ ] NO

Fecha: {{date}}
Sede: {{branchName}}

_______________________________
Firma del Cliente',
      'Plantilla para autorización de uso de imagen',
      true,
      false
    );
    RAISE NOTICE '✓ Plantilla creada: Autorización de Derechos de Imagen';
  END IF;

  -- Plantilla 4: Procedimiento Médico General
  IF NOT EXISTS (SELECT 1 FROM consent_templates WHERE name = 'Consentimiento para Procedimiento Médico' AND "tenantId" IS NULL) THEN
    INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault")
    VALUES (
      NULL,
      'Consentimiento para Procedimiento Médico',
      'procedure',
      'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO MÉDICO

Paciente: {{clientName}}
Documento: {{documentType}} {{documentNumber}}
Procedimiento: {{serviceName}}

INFORMACIÓN PROPORCIONADA:

1. Diagnóstico y naturaleza del procedimiento
2. Riesgos y beneficios esperados
3. Alternativas de tratamiento
4. Consecuencias de no realizar el procedimiento
5. Cuidados post-procedimiento

DECLARACIÓN DEL PACIENTE:

He comprendido la información proporcionada y he tenido oportunidad de hacer preguntas. Autorizo la realización del procedimiento descrito.

Fecha: {{date}}
Sede: {{branchName}}
Profesional: {{professionalName}}

_______________________________
Firma del Paciente

_______________________________
Firma del Profesional',
      'Plantilla estándar para procedimientos médicos',
      true,
      false
    );
    RAISE NOTICE '✓ Plantilla creada: Consentimiento para Procedimiento Médico';
  END IF;

END $$;

-- Copiar plantillas globales a cada tenant
DO $$
DECLARE
  tenant_record RECORD;
  template_record RECORD;
  copied_count INTEGER := 0;
BEGIN
  FOR tenant_record IN 
    SELECT id, name, slug 
    FROM tenants 
    WHERE deleted_at IS NULL
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE 'Procesando tenant: % (%)', tenant_record.name, tenant_record.slug;
    
    FOR template_record IN
      SELECT * 
      FROM consent_templates
      WHERE "tenantId" IS NULL
        AND "isActive" = true
    LOOP
      IF NOT EXISTS (
        SELECT 1 
        FROM consent_templates
        WHERE "tenantId" = tenant_record.id
          AND name = template_record.name
      ) THEN
        INSERT INTO consent_templates (
          "tenantId", name, type, content, description, "isActive", "isDefault"
        ) VALUES (
          tenant_record.id,
          template_record.name,
          template_record.type,
          template_record.content,
          template_record.description,
          template_record."isActive",
          template_record."isDefault"
        );
        
        copied_count := copied_count + 1;
        RAISE NOTICE '  ✓ Copiada: %', template_record.name;
      ELSE
        RAISE NOTICE '  - Ya existe: %', template_record.name;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de plantillas copiadas: %', copied_count;
  RAISE NOTICE '========================================';
END $$;

-- Verificar resultado final
SELECT 
  'RESUMEN FINAL' as info,
  COUNT(*) as total_plantillas,
  COUNT(CASE WHEN "tenantId" IS NULL THEN 1 END) as globales,
  COUNT(CASE WHEN "tenantId" IS NOT NULL THEN 1 END) as por_tenant
FROM consent_templates;

SELECT 
  t.name as tenant,
  COUNT(ct.id) as plantillas
FROM tenants t
LEFT JOIN consent_templates ct ON ct."tenantId" = t.id
WHERE t."deletedAt" IS NULL
GROUP BY t.id, t.name
ORDER BY t.name;
