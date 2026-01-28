# Flujo Completo de Historias Clínicas - Implementación Actual

## Contexto

Este documento explica cómo se implementó el módulo de historias clínicas en el sistema, basado en:
- **Normativa Colombiana**: Resolución 1995/1999, Ley 1438/2011
- **Mejores Prácticas**: Arquitectura multi-tenant, seguridad, auditoría
- **Experiencia del Proyecto**: Integración con módulos existentes

---

## 📊 Arquitectura Implementada

### Modelo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                  HISTORIA CLÍNICA                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  medical_records (Principal)                                │
│  ├── id, recordNumber, admissionDate                        │
│  ├── status (active, closed, archived)                      │
│  ├── client_id → clients                                    │
│  ├── branch_id → branches                                   │
│  └── tenant_id → tenants                                    │
│                                                             │
│  anamnesis (Motivo de consulta y antecedentes)             │
│  ├── chiefComplaint, currentIllness                         │
│  ├── personalHistory, familyHistory (JSONB)                 │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  physical_exams (Signos vitales y examen físico)           │
│  ├── bloodPressure, heartRate, temperature                  │
│  ├── weight, height, bmi                                    │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  diagnoses (Diagnósticos CIE-10)                            │
│  ├── cie10Code, cie10Description                            │
│  ├── diagnosisType, isConfirmed                             │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  evolutions (Evoluciones SOAP)                              │
│  ├── subjective, objective, assessment, plan                │
│  ├── signedBy, signedAt                                     │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  medical_record_audit (Auditoría completa)                  │
│  ├── action, entityType, entityId                           │
│  ├── oldValues, newValues (JSONB)                           │
│  └── userId, ipAddress, userAgent                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo: Desde Apertura hasta Cierre

### FASE 1: APERTURA DE HISTORIA CLÍNICA

#### Acción: Crear Nueva HC

**Usuario**: Profesional de salud con permiso `create_medical_records`

**Pasos**:
1. Click en "Nueva Historia Clínica"
2. Seleccionar cliente/paciente
3. Completar datos básicos:
   - Tipo de admisión (consulta, urgencia, hospitalización)
   - Fecha de admisión
   - Sede (opcional)
4. Sistema genera automáticamente:
   - Número de HC único
   - Estado: `active`
   - Registro de auditoría

**Validaciones Backend**:
```typescript
// Verificar que el cliente pertenece al tenant
if (client.tenantId !== tenantId) {
  throw new ForbiddenException('Cliente no pertenece a este tenant');
}

// Generar número único de HC
const recordNumber = await this.generateRecordNumber(tenantId);

// Crear registro con auditoría
const record = await this.medicalRecordsRepository.save({
  ...data,
  recordNumber,
  status: 'active',
  tenantId,
  createdBy: userId
});

// Registrar en auditoría
await this.auditService.log({
  action: 'CREATE',
  entityType: 'medical_record',
  entityId: record.id,
  newValues: record
});
```

**Resultado**: HC creada en estado `active`, lista para recibir información clínica

---

### FASE 2: REGISTRO DE INFORMACIÓN CLÍNICA

#### 2.1 Anamnesis (Motivo de Consulta y Antecedentes)

**Cuándo**: Al inicio de la consulta

**Información Requerida**:
- **Motivo de consulta**: ¿Por qué viene el paciente?
- **Enfermedad actual**: Descripción detallada del problema
- **Antecedentes personales** (JSONB):
  - Enfermedades previas
  - Cirugías
  - Alergias
  - Medicamentos actuales
- **Antecedentes familiares** (JSONB):
  - Enfermedades hereditarias
  - Causas de muerte de familiares
- **Hábitos** (JSONB):
  - Tabaquismo
  - Alcoholismo
  - Actividad física
  - Alimentación
- **Revisión por sistemas** (JSONB):
  - Cardiovascular
  - Respiratorio
  - Digestivo
  - Etc.

**Implementación**:
```typescript
// POST /api/medical-records/:id/anamnesis
{
  chiefComplaint: "Dolor abdominal intenso",
  currentIllness: "Paciente refiere dolor...",
  personalHistory: {
    diseases: ["Hipertensión", "Diabetes"],
    surgeries: ["Apendicectomía 2015"],
    allergies: ["Penicilina"],
    medications: ["Metformina 850mg"]
  },
  familyHistory: {
    father: "Diabetes, IAM",
    mother: "Hipertensión"
  },
  habits: {
    smoking: false,
    alcohol: "Ocasional",
    exercise: "3 veces/semana"
  }
}
```

**Auditoría**: Se registra quién, cuándo y qué información se agregó

---

#### 2.2 Examen Físico y Signos Vitales

**Cuándo**: Durante la consulta

**Información Requerida**:
- **Signos vitales**:
  - Presión arterial (sistólica/diastólica)
  - Frecuencia cardíaca
  - Frecuencia respiratoria
  - Temperatura
  - Saturación de oxígeno
  - Peso y talla
  - IMC (calculado automáticamente)
- **Examen físico por sistemas** (JSONB):
  - Aspecto general
  - Cabeza y cuello
  - Tórax y pulmones
  - Cardiovascular
  - Abdomen
  - Extremidades
  - Neurológico

**Implementación**:
```typescript
// POST /api/medical-records/:id/physical-exams
{
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  heartRate: 72,
  respiratoryRate: 16,
  temperature: 36.5,
  oxygenSaturation: 98,
  weight: 70.5,
  height: 1.75,
  // BMI se calcula automáticamente: 23.02
  generalAppearance: "Paciente consciente, orientado...",
  physicalExamData: {
    head: "Normocéfalo, sin lesiones",
    chest: "Murmullo vesicular conservado",
    abdomen: "Blando, depresible, doloroso en FID"
  }
}
```

---

#### 2.3 Diagnósticos (CIE-10)

**Cuándo**: Después del examen físico

**Información Requerida**:
- Código CIE-10
- Descripción del diagnóstico
- Tipo: principal, relacionado, complicación
- Estado: confirmado o presuntivo

**Implementación**:
```typescript
// POST /api/medical-records/:id/diagnoses
{
  cie10Code: "K35.8",
  cie10Description: "Apendicitis aguda, otra y la no especificada",
  diagnosisType: "principal",
  isConfirmed: true,
  isPresumptive: false
}
```

**Múltiples Diagnósticos**: Se pueden agregar varios diagnósticos a una misma HC

---

#### 2.4 Evoluciones (Notas SOAP)

**Cuándo**: Durante y después de la consulta

**Formato SOAP**:
- **S (Subjetivo)**: Lo que el paciente refiere
- **O (Objetivo)**: Hallazgos del examen físico
- **A (Assessment/Análisis)**: Interpretación y diagnóstico
- **P (Plan)**: Tratamiento y seguimiento

**Implementación**:
```typescript
// POST /api/medical-records/:id/evolutions
{
  evolutionDate: "2026-01-25T14:30:00",
  subjective: "Paciente refiere dolor abdominal...",
  objective: "PA: 120/80, FC: 72, Abdomen doloroso en FID",
  assessment: "Apendicitis aguda",
  plan: "Cirugía de urgencia, antibióticos profilácticos",
  noteType: "evolution"
}
```

**Firma Digital**: Las evoluciones pueden ser firmadas digitalmente por el profesional

---

### FASE 3: INTEGRACIÓN CON CONSENTIMIENTOS

#### ¿Cuándo Generar Consentimientos?

**Momentos Clave**:
1. **Al inicio de la atención**: Consentimiento informado general
2. **Antes de procedimientos**: Consentimientos específicos
3. **Para tratamientos especiales**: Quimioterapia, cirugías, etc.
4. **Para uso de datos**: Fotografías, investigación, etc.

#### Flujo Propuesto de Integración

```
┌──────────────────────────────────────────────────────────┐
│         DURANTE LA ATENCIÓN (HC Abierta)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Profesional identifica necesidad de consentimiento  │
│     ↓                                                    │
│  2. Click en "Generar Consentimiento" desde la HC       │
│     ↓                                                    │
│  3. Selecciona tipo de consentimiento:                  │
│     - Consentimiento informado general                  │
│     - Procedimiento específico                          │
│     - Tratamiento de datos                              │
│     - Uso de imágenes                                   │
│     ↓                                                    │
│  4. Sistema pre-llena datos automáticamente:            │
│     - Datos del paciente (desde client)                 │
│     - Datos de la HC (número, fecha)                    │
│     - Profesional que atiende                           │
│     - Diagnóstico actual                                │
│     - Procedimiento/tratamiento                         │
│     ↓                                                    │
│  5. Profesional completa información específica         │
│     ↓                                                    │
│  6. Paciente firma el consentimiento                    │
│     - Firma digital o manuscrita                        │
│     - Testigos (si aplica)                              │
│     ↓                                                    │
│  7. Consentimiento se vincula automáticamente a:        │
│     - Historia clínica (medical_record_id)              │
│     - Cliente (client_id)                               │
│     - Evolución actual (si aplica)                      │
│     ↓                                                    │
│  8. Se genera PDF y se almacena en S3                   │
│     ↓                                                    │
│  9. Se registra en auditoría                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Implementación Técnica Propuesta

**Tabla Nueva**: `medical_record_consents`
```sql
CREATE TABLE medical_record_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id),
  consent_id UUID NOT NULL REFERENCES consents(id),
  evolution_id UUID REFERENCES evolutions(id),
  
  -- Contexto
  created_during_consultation BOOLEAN DEFAULT TRUE,
  required_for_procedure BOOLEAN DEFAULT FALSE,
  procedure_name VARCHAR(255),
  diagnosis_related VARCHAR(255),
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(medical_record_id, consent_id)
);
```

**Endpoint Nuevo**: Generar consentimiento desde HC
```typescript
// POST /api/medical-records/:id/consents
{
  consentType: "procedure", // general, procedure, data_treatment, image_rights
  procedureName: "Apendicectomía",
  diagnosisCode: "K35.8",
  additionalInfo: {
    risks: ["Sangrado", "Infección"],
    benefits: ["Resolución del cuadro"],
    alternatives: ["Tratamiento conservador"]
  }
}

// Response
{
  consent: {
    id: "uuid",
    consentNumber: "CONS-2026-001",
    status: "pending_signature",
    pdfUrl: null // Se genera después de firmar
  },
  medicalRecordConsent: {
    id: "uuid",
    medicalRecordId: "uuid",
    consentId: "uuid"
  }
}
```

**Frontend**: Botón en la vista de HC
```typescript
// En ViewMedicalRecordPage.tsx
<button
  onClick={() => setShowConsentModal(true)}
  className="btn btn-primary"
>
  <FileText className="w-4 h-4" />
  Generar Consentimiento
</button>

// Modal para seleccionar tipo y completar datos
<GenerateConsentModal
  medicalRecordId={id}
  clientId={record.clientId}
  onClose={() => setShowConsentModal(false)}
  onSuccess={loadRecord}
/>
```

---

### FASE 4: CIERRE DE HISTORIA CLÍNICA

#### Cuándo Cerrar una HC

**Criterios**:
- Consulta finalizada
- Todos los datos clínicos registrados
- Diagnósticos confirmados
- Plan de tratamiento definido
- Consentimientos firmados (si aplica)

#### Acción: Cerrar HC

**Usuario**: Profesional con permiso `close_medical_records`

**Pasos**:
1. Verificar que toda la información esté completa
2. Click en "Cerrar Historia Clínica"
3. Confirmar acción
4. Sistema:
   - Cambia estado a `closed`
   - Registra fecha y usuario que cierra
   - Bloquea ediciones futuras
   - Registra en auditoría

**Implementación**:
```typescript
// POST /api/medical-records/:id/close
async close(id: string, userId: string, tenantId: string) {
  const record = await this.findOne(id, tenantId);
  
  // Validar que no esté ya cerrada
  if (record.status === 'closed') {
    throw new BadRequestException('HC ya está cerrada');
  }
  
  // Cerrar HC
  record.status = 'closed';
  record.closedAt = new Date();
  record.closedBy = userId;
  record.isLocked = true;
  
  await this.medicalRecordsRepository.save(record);
  
  // Auditoría
  await this.auditService.log({
    action: 'CLOSE',
    entityType: 'medical_record',
    entityId: id,
    oldValues: { status: 'active' },
    newValues: { status: 'closed', closedAt: record.closedAt }
  });
  
  return record;
}
```

**Protección**: Una vez cerrada, NO se puede editar
```typescript
// En todos los métodos de actualización
if (record.isLocked || record.status === 'closed') {
  throw new ForbiddenException('No se puede modificar una HC cerrada');
}
```

---

## 🔐 Seguridad y Auditoría

### Auditoría Completa

**Qué se Registra**:
- Todas las acciones (CREATE, UPDATE, DELETE, VIEW, CLOSE)
- Quién realizó la acción (userId, userName, userRole)
- Cuándo se realizó (timestamp)
- Qué cambió (oldValues, newValues en JSONB)
- Desde dónde (ipAddress, userAgent)

**Implementación**:
```typescript
async logAudit(params: {
  medicalRecordId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await this.auditRepository.save({
    ...params,
    tenantId: this.getTenantId(),
    createdAt: new Date()
  });
}
```

**Consulta de Auditoría**:
```typescript
// GET /api/medical-records/:id/audit
async getAudit(id: string, tenantId: string) {
  return await this.auditRepository.find({
    where: { medicalRecordId: id, tenantId },
    order: { createdAt: 'DESC' },
    relations: ['user']
  });
}
```

### Validaciones de Seguridad

**Multi-Tenancy**:
```typescript
// Todas las operaciones validan el tenant
const record = await this.medicalRecordsRepository.findOne({
  where: { id, tenantId }
});

if (!record) {
  throw new NotFoundException('HC no encontrada');
}
```

**Permisos por Rol**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_MEDICAL_RECORDS)
async findAll(@TenantSlug() tenantSlug: string) {
  // ...
}
```

**Protección de Datos Sensibles**:
- Contraseñas nunca se exponen
- Datos médicos solo accesibles con permisos
- Auditoría de todos los accesos
- Encriptación en tránsito (HTTPS)
- Encriptación en reposo (base de datos)

---

## 📋 Resumen del Flujo Completo

```
1. APERTURA
   ├── Crear HC
   ├── Generar número único
   ├── Estado: active
   └── Auditoría: CREATE

2. REGISTRO CLÍNICO
   ├── Anamnesis
   │   ├── Motivo de consulta
   │   ├── Antecedentes
   │   └── Auditoría: CREATE_ANAMNESIS
   ├── Examen Físico
   │   ├── Signos vitales
   │   ├── Examen por sistemas
   │   └── Auditoría: CREATE_PHYSICAL_EXAM
   ├── Diagnósticos
   │   ├── CIE-10
   │   ├── Tipo y estado
   │   └── Auditoría: CREATE_DIAGNOSIS
   └── Evoluciones
       ├── Notas SOAP
       ├── Firma digital
       └── Auditoría: CREATE_EVOLUTION

3. CONSENTIMIENTOS (PROPUESTO)
   ├── Identificar necesidad
   ├── Generar desde HC
   ├── Pre-llenar datos
   ├── Firma del paciente
   ├── Vincular a HC
   ├── Generar PDF
   └── Auditoría: CREATE_CONSENT

4. CIERRE
   ├── Verificar completitud
   ├── Cerrar HC
   ├── Estado: closed
   ├── Bloquear ediciones
   └── Auditoría: CLOSE

5. CONSULTA
   ├── Ver HC completa
   ├── Ver auditoría
   ├── Exportar PDF (futuro)
   └── Auditoría: VIEW
```

---

## 🎯 Próximos Pasos Recomendados

### 1. Implementar Integración con Consentimientos

**Tareas**:
- [ ] Crear tabla `medical_record_consents`
- [ ] Crear endpoint `POST /api/medical-records/:id/consents`
- [ ] Crear componente `GenerateConsentModal`
- [ ] Pre-llenar datos del paciente y HC
- [ ] Vincular consentimiento a HC
- [ ] Mostrar consentimientos en tab de HC

### 2. Mejorar Formularios

**Tareas**:
- [ ] Formulario completo de anamnesis con todos los campos
- [ ] Examen físico detallado por sistemas
- [ ] Búsqueda de códigos CIE-10
- [ ] Validaciones médicas avanzadas

### 3. Exportación y Reportes

**Tareas**:
- [ ] Exportar HC completa a PDF
- [ ] Incluir consentimientos en el PDF
- [ ] Reportes estadísticos
- [ ] Gráficas de evolución

### 4. Firma Digital

**Tareas**:
- [ ] Implementar firma digital de evoluciones
- [ ] Firma digital de HC completa
- [ ] Certificado digital
- [ ] Validación de firmas

---

## 📞 Conclusión

El módulo de historias clínicas está implementado siguiendo:
- ✅ Normativa colombiana
- ✅ Mejores prácticas de seguridad
- ✅ Arquitectura multi-tenant
- ✅ Auditoría completa
- ✅ Diseño escalable

La integración con consentimientos es el siguiente paso lógico y natural del flujo clínico.

**Fecha**: 2026-01-25  
**Versión**: 15.0.9
