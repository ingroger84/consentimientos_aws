-- =====================================================
-- Migración: Crear tabla medical_record_consent_templates
-- Fecha: 2026-01-25
-- Descripción: Separar plantillas de consentimiento HC de plantillas tradicionales
-- =====================================================

-- 1. Crear tabla de plantillas de consentimiento para HC
CREATE TABLE IF NOT EXISTS medical_record_consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'anamnesis', 'procedure', 'treatment', 'general'
  
  -- Contenido
  content TEXT NOT NULL, -- Plantilla con variables Handlebars
  
  -- Variables disponibles específicas de HC
  available_variables JSONB DEFAULT '[]',
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT true,
  
  -- Multi-tenancy
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraint: Solo una plantilla default por categoría y tenant
  CONSTRAINT unique_default_per_category_tenant 
    UNIQUE (category, tenant_id)
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX idx_mr_consent_templates_tenant ON medical_record_consent_templates(tenant_id);
CREATE INDEX idx_mr_consent_templates_category ON medical_record_consent_templates(category);
CREATE INDEX idx_mr_consent_templates_active ON medical_record_consent_templates(is_active);
CREATE INDEX idx_mr_consent_templates_deleted ON medical_record_consent_templates(deleted_at);

-- 3. Modificar tabla medical_record_consents para soportar ambos tipos
ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'traditional';

ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS mr_template_id UUID REFERENCES medical_record_consent_templates(id) ON DELETE SET NULL;

-- 4. Crear índices en medical_record_consents
CREATE INDEX IF NOT EXISTS idx_mr_consents_template_type ON medical_record_consents(template_type);
CREATE INDEX IF NOT EXISTS idx_mr_consents_mr_template ON medical_record_consents(mr_template_id);

-- 5. Comentarios para documentación
COMMENT ON TABLE medical_record_consent_templates IS 'Plantillas de consentimiento específicas para Historias Clínicas';
COMMENT ON COLUMN medical_record_consent_templates.category IS 'Categoría: anamnesis, procedure, treatment, general';
COMMENT ON COLUMN medical_record_consent_templates.available_variables IS 'Variables disponibles en formato JSON para esta plantilla';
COMMENT ON COLUMN medical_record_consents.template_type IS 'Tipo de plantilla: traditional (consent_templates) o medical_record (medical_record_consent_templates)';
COMMENT ON COLUMN medical_record_consents.mr_template_id IS 'ID de la plantilla HC si template_type = medical_record';

-- 6. Insertar plantillas por defecto para HC
INSERT INTO medical_record_consent_templates (name, category, content, description, is_active, is_default, tenant_id)
VALUES 
  (
    'Consentimiento Informado General HC',
    'general',
    'CONSENTIMIENTO INFORMADO PARA ATENCIÓN MÉDICA

Yo, {{patientName}}, identificado(a) con {{patientId}}, declaro que:

1. He sido informado(a) sobre mi condición médica:
   - Motivo de consulta: {{chiefComplaint}}
   - Diagnóstico: {{diagnosisDescription}} (CIE-10: {{diagnosisCode}})

2. Autorizo al Dr(a). {{doctorName}} ({{doctorSpecialty}}) para:
   - Realizar los procedimientos médicos necesarios
   - Acceder a mi historia clínica
   - Compartir información con el equipo médico

3. He sido informado sobre:
   - Riesgos y beneficios del tratamiento
   - Alternativas disponibles
   - Consecuencias de no recibir tratamiento

Historia Clínica: {{recordNumber}}
Fecha de admisión: {{admissionDate}}
Fecha de consentimiento: {{consentDate}}

_______________________________
Firma del Paciente
{{patientName}}
{{patientId}}

_______________________________
Firma del Médico
{{doctorName}}
Registro: {{doctorLicense}}',
    'Plantilla general de consentimiento informado para atención médica en historias clínicas',
    true,
    true,
    NULL
  ),
  (
    'Consentimiento para Procedimiento Médico',
    'procedure',
    'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO MÉDICO

Paciente: {{patientName}} ({{patientId}})
Historia Clínica: {{recordNumber}}
Edad: {{patientAge}} años

PROCEDIMIENTO A REALIZAR:
{{procedureName}}

DESCRIPCIÓN:
{{procedureDescription}}

DIAGNÓSTICO:
{{diagnosisDescription}} (CIE-10: {{diagnosisCode}})

RIESGOS INFORMADOS:
{{procedureRisks}}

PLAN DE TRATAMIENTO:
{{treatmentPlan}}

MEDICAMENTOS:
{{medications}}

RECOMENDACIONES:
{{recommendations}}

Declaro que he comprendido la información proporcionada y autorizo
la realización del procedimiento descrito.

Fecha: {{consentDate}} {{consentTime}}
Sede: {{branchName}}
Empresa: {{companyName}}

_______________________________
Firma del Paciente

_______________________________
Firma del Médico
Dr(a). {{doctorName}}
Especialidad: {{doctorSpecialty}}
Registro: {{doctorLicense}}',
    'Plantilla de consentimiento para procedimientos médicos específicos',
    true,
    true,
    NULL
  ),
  (
    'Consentimiento para Tratamiento',
    'treatment',
    'CONSENTIMIENTO INFORMADO PARA TRATAMIENTO MÉDICO

DATOS DEL PACIENTE:
Nombre: {{patientName}}
Identificación: {{patientId}}
Edad: {{patientAge}} años
Género: {{patientGender}}
Historia Clínica: {{recordNumber}}

DIAGNÓSTICO:
{{diagnosisDescription}} (CIE-10: {{diagnosisCode}})

PLAN DE TRATAMIENTO:
{{treatmentPlan}}

MEDICAMENTOS PRESCRITOS:
{{medications}}

ALERGIAS CONOCIDAS:
{{allergies}}

MEDICAMENTOS ACTUALES:
{{currentMedications}}

RECOMENDACIONES:
{{recommendations}}

SIGNOS VITALES:
{{vitalSigns}}

He sido informado(a) sobre:
- El diagnóstico y pronóstico de mi condición
- El tratamiento propuesto y sus beneficios esperados
- Los riesgos y efectos secundarios posibles
- Las alternativas de tratamiento disponibles
- Las consecuencias de no seguir el tratamiento

Autorizo el inicio del tratamiento descrito y me comprometo a seguir
las indicaciones médicas proporcionadas.

Fecha: {{consentDate}}
Sede: {{branchName}}
Médico tratante: Dr(a). {{doctorName}}

_______________________________
Firma del Paciente

_______________________________
Firma del Médico',
    'Plantilla de consentimiento para tratamientos médicos',
    true,
    true,
    NULL
  );

-- 7. Verificación
SELECT 
  'Tabla creada exitosamente' as status,
  COUNT(*) as plantillas_creadas
FROM medical_record_consent_templates;
