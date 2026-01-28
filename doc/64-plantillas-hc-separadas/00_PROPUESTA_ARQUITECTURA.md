# Propuesta: Separación de Plantillas de Consentimiento HC vs Consentimientos Tradicionales

## 🎯 Objetivo

Separar completamente las plantillas de consentimiento para Historias Clínicas de los consentimientos tradicionales, permitiendo:

1. **Consentimientos Tradicionales**: Mantener el flujo actual desde el módulo "Consentimientos"
2. **Consentimientos HC**: Nuevas plantillas específicas para historias clínicas con variables propias

## 📊 Arquitectura Propuesta

### 1. Modelo de Datos

#### Nueva Tabla: `medical_record_consent_templates`

```sql
CREATE TABLE medical_record_consent_templates (
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
  tenant_id UUID REFERENCES tenants(id),
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  -- Índices
  CONSTRAINT unique_default_per_category_tenant 
    UNIQUE (category, tenant_id, is_default) 
    WHERE is_default = true AND deleted_at IS NULL
);

CREATE INDEX idx_mr_consent_templates_tenant ON medical_record_consent_templates(tenant_id);
CREATE INDEX idx_mr_consent_templates_category ON medical_record_consent_templates(category);
CREATE INDEX idx_mr_consent_templates_active ON medical_record_consent_templates(is_active);
```

#### Modificar Tabla: `medical_record_consents`

```sql
-- Agregar columna para diferenciar el tipo de plantilla usada
ALTER TABLE medical_record_consents 
ADD COLUMN template_type VARCHAR(50) DEFAULT 'traditional'; 
-- 'traditional' = consent_templates (actual)
-- 'medical_record' = medical_record_consent_templates (nuevo)

ALTER TABLE medical_record_consents 
ADD COLUMN mr_template_id UUID REFERENCES medical_record_consent_templates(id);

-- Índice
CREATE INDEX idx_mr_consents_template_type ON medical_record_consents(template_type);
CREATE INDEX idx_mr_consents_mr_template ON medical_record_consents(mr_template_id);
```

### 2. Variables Disponibles

#### Variables de Consentimientos Tradicionales (Actuales)
```javascript
{
  clientName, clientId, clientEmail, clientPhone, clientAddress,
  serviceName, branchName, branchAddress, branchPhone, branchEmail,
  companyName, signDate, signTime, currentDate, currentYear
}
```

#### Variables de Consentimientos HC (Nuevas)
```javascript
{
  // Datos del paciente
  patientName, patientId, patientEmail, patientPhone, patientAddress,
  patientAge, patientGender, patientBirthDate,
  
  // Datos de la HC
  recordNumber, admissionDate, admissionType,
  
  // Anamnesis
  chiefComplaint, currentIllness, medicalHistory,
  familyHistory, allergies, currentMedications,
  
  // Examen físico
  vitalSigns, physicalExamFindings, systemsReview,
  
  // Diagnóstico
  diagnosisCode, diagnosisDescription, diagnosisType,
  
  // Procedimiento/Tratamiento
  procedureName, procedureDescription, procedureRisks,
  treatmentPlan, medications, recommendations,
  
  // Profesional
  doctorName, doctorLicense, doctorSpecialty,
  
  // Sede y empresa
  branchName, branchAddress, branchPhone,
  companyName, companyNIT,
  
  // Fechas
  consentDate, consentTime, currentDate, currentYear
}
```

### 3. Estructura de Backend

```
backend/src/
├── consent-templates/              # Consentimientos tradicionales (MANTENER)
│   ├── consent-templates.controller.ts
│   ├── consent-templates.service.ts
│   ├── consent-templates.module.ts
│   └── entities/
│       └── consent-template.entity.ts
│
└── medical-record-consent-templates/  # Plantillas HC (NUEVO)
    ├── mr-consent-templates.controller.ts
    ├── mr-consent-templates.service.ts
    ├── mr-consent-templates.module.ts
    ├── dto/
    │   ├── create-mr-consent-template.dto.ts
    │   ├── update-mr-consent-template.dto.ts
    │   └── generate-mr-consent.dto.ts
    └── entities/
        └── mr-consent-template.entity.ts
```

### 4. Endpoints API

#### Plantillas HC (Nuevos)

```typescript
// Gestión de plantillas HC
GET    /api/medical-record-consent-templates
POST   /api/medical-record-consent-templates
GET    /api/medical-record-consent-templates/:id
PATCH  /api/medical-record-consent-templates/:id
DELETE /api/medical-record-consent-templates/:id

// Filtros y utilidades
GET    /api/medical-record-consent-templates/by-category/:category
GET    /api/medical-record-consent-templates/variables
POST   /api/medical-record-consent-templates/initialize-defaults

// Generación desde HC
POST   /api/medical-records/:id/generate-consent
```

#### Consentimientos Tradicionales (Mantener)

```typescript
// Sin cambios - mantener endpoints actuales
GET    /api/consent-templates
POST   /api/consent-templates
// ... etc
```

### 5. Estructura de Frontend

```
frontend/src/
├── pages/
│   ├── ConsentTemplatesPage.tsx           # Tradicionales (MANTENER)
│   └── MRConsentTemplatesPage.tsx         # HC (NUEVO)
│
├── components/
│   ├── templates/                         # Tradicionales (MANTENER)
│   │   ├── CreateTemplateModal.tsx
│   │   └── EditTemplateModal.tsx
│   │
│   ├── mr-consent-templates/              # HC (NUEVO)
│   │   ├── CreateMRTemplateModal.tsx
│   │   ├── EditMRTemplateModal.tsx
│   │   ├── MRTemplateList.tsx
│   │   └── MRVariablesHelper.tsx
│   │
│   └── medical-records/
│       └── GenerateConsentModal.tsx       # MODIFICAR para usar plantillas HC
│
└── services/
    ├── template.service.ts                # Tradicionales (MANTENER)
    └── mr-consent-template.service.ts     # HC (NUEVO)
```

### 6. Permisos

#### Nuevos Permisos para HC

```typescript
// Plantillas HC
'view_mr_consent_templates'
'create_mr_consent_templates'
'edit_mr_consent_templates'
'delete_mr_consent_templates'

// Generación de consentimientos HC
'generate_mr_consents'
'view_mr_consents'
```

#### Permisos Tradicionales (Mantener)

```typescript
'view_templates'
'create_templates'
'edit_templates'
'delete_templates'
```

### 7. Flujo de Usuario

#### Consentimientos Tradicionales (Sin Cambios)

```
1. Usuario va a "Consentimientos"
2. Crea consentimiento usando plantillas tradicionales
3. Selecciona cliente, servicio, etc.
4. Genera PDF con variables tradicionales
```

#### Consentimientos HC (Nuevo)

```
1. Usuario va a "Historias Clínicas"
2. Abre una HC específica
3. Click en "Generar Consentimiento"
4. Modal muestra SOLO plantillas HC (medical_record_consent_templates)
5. Selecciona una o más plantillas HC
6. Sistema extrae datos de la HC automáticamente
7. Genera PDF con variables de HC
8. PDF se vincula a la HC
```

### 8. Menú de Navegación

```
Dashboard
├── Consentimientos                    # Tradicionales
│   └── Plantillas de Consentimiento   # consent_templates
│
├── Historias Clínicas
│   ├── Lista de HC
│   └── Plantillas HC                  # medical_record_consent_templates (NUEVO)
│
└── Configuración
```

## 🔄 Migración y Compatibilidad

### Datos Existentes

1. **Consentimientos tradicionales**: Sin cambios, siguen funcionando igual
2. **Plantillas tradicionales**: Sin cambios, siguen en `consent_templates`
3. **HC existentes**: Pueden empezar a usar plantillas HC sin afectar datos anteriores

### Estrategia de Migración

```sql
-- 1. Crear nueva tabla
CREATE TABLE medical_record_consent_templates (...);

-- 2. Modificar tabla existente
ALTER TABLE medical_record_consents 
ADD COLUMN template_type VARCHAR(50) DEFAULT 'traditional',
ADD COLUMN mr_template_id UUID;

-- 3. Actualizar registros existentes (ya tienen 'traditional' por defecto)
-- No se requiere UPDATE

-- 4. Crear plantillas HC por defecto
INSERT INTO medical_record_consent_templates (name, category, content, tenant_id)
VALUES 
  ('Consentimiento Informado General HC', 'general', '...', NULL),
  ('Consentimiento para Procedimiento', 'procedure', '...', NULL),
  ('Consentimiento para Tratamiento', 'treatment', '...', NULL);
```

## 📝 Plantillas por Defecto HC

### 1. Consentimiento General HC

```handlebars
CONSENTIMIENTO INFORMADO PARA ATENCIÓN MÉDICA

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
Registro: {{doctorLicense}}
```

### 2. Consentimiento para Procedimiento

```handlebars
CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO MÉDICO

Paciente: {{patientName}} ({{patientId}})
Historia Clínica: {{recordNumber}}

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

Declaro que he comprendido la información proporcionada y autorizo
la realización del procedimiento descrito.

Fecha: {{consentDate}} {{consentTime}}

_______________________________
Firma del Paciente

_______________________________
Firma del Médico
Dr(a). {{doctorName}}
```

## 🎨 Interfaz de Usuario

### Página: Plantillas HC

```
┌─────────────────────────────────────────────────────────┐
│  Plantillas de Consentimiento para Historias Clínicas  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Nueva Plantilla HC]    [📥 Importar]  [Variables] │
│                                                         │
│  Filtros: [Todas ▼] [Activas ▼] [🔍 Buscar...]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📄 Consentimiento General HC                    │  │
│  │ Categoría: General | Activa ✓                   │  │
│  │ Variables: 15 | Última actualización: Hoy       │  │
│  │ [✏️ Editar] [👁️ Vista previa] [🗑️ Eliminar]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📄 Consentimiento para Procedimiento            │  │
│  │ Categoría: Procedimiento | Activa ✓             │  │
│  │ Variables: 18 | Última actualización: Ayer      │  │
│  │ [✏️ Editar] [👁️ Vista previa] [🗑️ Eliminar]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Modal: Generar Consentimiento desde HC

```
┌─────────────────────────────────────────────────────────┐
│  Generar Consentimiento - HC-2026-000001                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Paciente: Juan Pérez (CC 123456789)                   │
│  Diagnóstico: Hipertensión arterial (I10)              │
│                                                         │
│  Selecciona plantillas de consentimiento HC:           │
│                                                         │
│  ☑️ Consentimiento General HC                          │
│  ☐ Consentimiento para Procedimiento                   │
│  ☐ Consentimiento para Tratamiento                     │
│                                                         │
│  ℹ️ Las variables se llenarán automáticamente con      │
│     los datos de la historia clínica                   │
│                                                         │
│  Variables disponibles: [Ver lista ▼]                  │
│                                                         │
│  [Cancelar]  [Generar PDF]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad y Permisos

### Matriz de Permisos

| Rol | Ver Plantillas HC | Crear Plantillas HC | Generar Consentimientos HC |
|-----|-------------------|---------------------|----------------------------|
| Super Admin | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ |
| Médico | ✅ | ❌ | ✅ |
| Operador | ✅ | ❌ | ✅ |

## 📈 Ventajas de esta Arquitectura

1. **Separación Clara**: Dos sistemas independientes sin interferencias
2. **Escalabilidad**: Cada sistema puede evolucionar independientemente
3. **Variables Específicas**: Plantillas HC tienen acceso a datos clínicos
4. **Compatibilidad**: No afecta funcionalidad existente
5. **Mantenibilidad**: Código organizado y fácil de mantener
6. **Flexibilidad**: Permite diferentes flujos de trabajo
7. **Auditoría**: Trazabilidad completa de cada tipo de consentimiento

## 🚀 Plan de Implementación

### Fase 1: Backend (2-3 días)
1. Crear migración de base de datos
2. Crear entidad `MRConsentTemplate`
3. Crear servicio y controlador
4. Agregar permisos
5. Crear plantillas por defecto

### Fase 2: Frontend (2-3 días)
1. Crear página de gestión de plantillas HC
2. Crear componentes de creación/edición
3. Modificar modal de generación en HC
4. Agregar menú de navegación

### Fase 3: Testing (1-2 días)
1. Pruebas unitarias
2. Pruebas de integración
3. Pruebas de usuario

### Fase 4: Documentación (1 día)
1. Guía de usuario
2. Documentación técnica
3. Videos tutoriales

**Total estimado: 6-9 días**

## ✅ Criterios de Aceptación

1. ✅ Plantillas HC completamente separadas de plantillas tradicionales
2. ✅ Variables específicas de HC disponibles
3. ✅ Generación de PDF desde HC usa solo plantillas HC
4. ✅ Consentimientos tradicionales siguen funcionando sin cambios
5. ✅ Permisos configurables por rol
6. ✅ Interfaz intuitiva y fácil de usar
7. ✅ Documentación completa
8. ✅ Sin regresiones en funcionalidad existente

---

**¿Proceder con la implementación?**
