# Implementación Backend: Plantillas HC Separadas

## ✅ Estado: COMPLETADO

## 📋 Resumen

Se ha implementado exitosamente el backend para el sistema de plantillas de consentimiento específicas para Historias Clínicas, completamente separadas de las plantillas tradicionales.

## 🗄️ Base de Datos

### Tabla Creada: `medical_record_consent_templates`

```sql
CREATE TABLE medical_record_consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'anamnesis', 'procedure', 'treatment', 'general'
  content TEXT NOT NULL,
  available_variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

### Modificaciones a `medical_record_consents`

```sql
ALTER TABLE medical_record_consents 
ADD COLUMN template_type VARCHAR(50) DEFAULT 'traditional';

ALTER TABLE medical_record_consents 
ADD COLUMN mr_template_id UUID REFERENCES medical_record_consent_templates(id);
```

### Plantillas por Defecto Creadas

1. **Consentimiento Informado General HC** (Categoría: general)
   - Variables: patientName, patientId, chiefComplaint, diagnosisDescription, diagnosisCode, doctorName, doctorSpecialty, recordNumber, admissionDate, consentDate

2. **Consentimiento para Procedimiento Médico** (Categoría: procedure)
   - Variables: patientName, patientId, patientAge, recordNumber, procedureName, procedureDescription, diagnosisDescription, diagnosisCode, procedureRisks, treatmentPlan, medications, recommendations, consentDate, consentTime, branchName, companyName, doctorName, doctorSpecialty, doctorLicense

3. **Consentimiento para Tratamiento** (Categoría: treatment)
   - Variables: patientName, patientId, patientAge, patientGender, recordNumber, diagnosisDescription, diagnosisCode, treatmentPlan, medications, allergies, currentMedications, recommendations, vitalSigns, consentDate, branchName, doctorName

## 🔧 Estructura de Código

### Entidad

**Archivo**: `backend/src/medical-record-consent-templates/entities/mr-consent-template.entity.ts`

```typescript
@Entity('medical_record_consent_templates')
export class MRConsentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: MRTemplateCategory;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: [] })
  availableVariables: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'requires_signature', default: true })
  requiresSignature: boolean;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

### DTOs

**Archivos**:
- `backend/src/medical-record-consent-templates/dto/create-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/dto/update-mr-consent-template.dto.ts`

### Servicio

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

**Métodos principales**:
- `create()` - Crear nueva plantilla HC
- `findAll()` - Listar todas las plantillas HC
- `findByCategory()` - Filtrar por categoría
- `findDefaultByCategory()` - Obtener plantilla predeterminada
- `findOne()` - Obtener una plantilla específica
- `update()` - Actualizar plantilla
- `remove()` - Eliminar plantilla (soft delete)
- `setAsDefault()` - Marcar como predeterminada
- `getAvailableVariables()` - Obtener variables disponibles
- `initializeDefaults()` - Inicializar plantillas por defecto

### Controlador

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.controller.ts`

**Endpoints**:
```
POST   /api/medical-record-consent-templates
GET    /api/medical-record-consent-templates
GET    /api/medical-record-consent-templates/by-category/:category
GET    /api/medical-record-consent-templates/variables
POST   /api/medical-record-consent-templates/initialize-defaults
GET    /api/medical-record-consent-templates/:id
PATCH  /api/medical-record-consent-templates/:id
DELETE /api/medical-record-consent-templates/:id
POST   /api/medical-record-consent-templates/:id/set-default
```

### Módulo

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.module.ts`

Registrado en `AppModule` con todas las dependencias necesarias.

## 🔐 Permisos

### Permisos Creados

1. `view_mr_consent_templates` - Ver plantillas HC
2. `create_mr_consent_templates` - Crear plantillas HC
3. `edit_mr_consent_templates` - Editar plantillas HC
4. `delete_mr_consent_templates` - Eliminar plantillas HC
5. `generate_mr_consents` - Generar consentimientos HC
6. `view_mr_consents` - Ver consentimientos HC

### Asignación por Rol

| Rol | Ver | Crear | Editar | Eliminar | Generar | Ver Consents |
|-----|-----|-------|--------|----------|---------|--------------|
| Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Médico | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Operador | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |

## 📊 Variables Disponibles

### Variables de Paciente
- `patientName` - Nombre completo del paciente
- `patientId` - Número de identificación
- `patientEmail` - Email del paciente
- `patientPhone` - Teléfono del paciente
- `patientAddress` - Dirección del paciente
- `patientAge` - Edad del paciente
- `patientGender` - Género del paciente
- `patientBirthDate` - Fecha de nacimiento

### Variables de Historia Clínica
- `recordNumber` - Número de HC
- `admissionDate` - Fecha de admisión
- `admissionType` - Tipo de admisión

### Variables de Anamnesis
- `chiefComplaint` - Motivo de consulta
- `currentIllness` - Enfermedad actual
- `medicalHistory` - Antecedentes médicos
- `familyHistory` - Antecedentes familiares
- `allergies` - Alergias
- `currentMedications` - Medicamentos actuales

### Variables de Examen Físico
- `vitalSigns` - Signos vitales
- `physicalExamFindings` - Hallazgos del examen
- `systemsReview` - Revisión por sistemas

### Variables de Diagnóstico
- `diagnosisCode` - Código CIE-10
- `diagnosisDescription` - Descripción del diagnóstico
- `diagnosisType` - Tipo de diagnóstico

### Variables de Procedimiento/Tratamiento
- `procedureName` - Nombre del procedimiento
- `procedureDescription` - Descripción del procedimiento
- `procedureRisks` - Riesgos del procedimiento
- `treatmentPlan` - Plan de tratamiento
- `medications` - Medicamentos prescritos
- `recommendations` - Recomendaciones

### Variables de Profesional
- `doctorName` - Nombre del médico
- `doctorLicense` - Registro médico
- `doctorSpecialty` - Especialidad del médico

### Variables de Sede y Empresa
- `branchName` - Nombre de la sede
- `branchAddress` - Dirección de la sede
- `branchPhone` - Teléfono de la sede
- `companyName` - Nombre de la empresa
- `companyNIT` - NIT de la empresa

### Variables de Fechas
- `consentDate` - Fecha del consentimiento
- `consentTime` - Hora del consentimiento
- `currentDate` - Fecha actual
- `currentYear` - Año actual

**Total**: 38 variables (vs 14 de plantillas tradicionales)

## 🧪 Pruebas

### Verificar Migración

```bash
cd backend
node apply-mr-consent-templates-migration.js
```

**Resultado esperado**:
```
✓ Conectado a la base de datos
✓ Migración ejecutada exitosamente

=== Resultados ===
Total de plantillas HC: 3
Plantillas activas: 3
Plantillas predeterminadas: 3

=== Plantillas Creadas ===
- [general] Consentimiento Informado General HC (Predeterminada)
- [procedure] Consentimiento para Procedimiento Médico (Predeterminada)
- [treatment] Consentimiento para Tratamiento (Predeterminada)
```

### Verificar Permisos

```bash
cd backend
node apply-mr-permissions.js
```

**Resultado esperado**:
```
✓ Conectado a la base de datos
✓ Permisos aplicados exitosamente
```

### Verificar Endpoints

```bash
# Listar plantillas HC
curl http://localhost:3000/api/medical-record-consent-templates

# Obtener variables disponibles
curl http://localhost:3000/api/medical-record-consent-templates/variables

# Filtrar por categoría
curl http://localhost:3000/api/medical-record-consent-templates/by-category/general
```

## 📁 Archivos Creados

### Migración y Scripts
- `backend/src/migrations/create-medical-record-consent-templates.sql`
- `backend/apply-mr-consent-templates-migration.js`
- `backend/add-mr-consent-templates-permissions.sql`
- `backend/apply-mr-permissions.js`

### Código Backend
- `backend/src/medical-record-consent-templates/entities/mr-consent-template.entity.ts`
- `backend/src/medical-record-consent-templates/dto/create-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/dto/update-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/dto/index.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.controller.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.module.ts`

### Documentación
- `doc/64-plantillas-hc-separadas/00_PROPUESTA_ARQUITECTURA.md`
- `doc/64-plantillas-hc-separadas/01_IMPLEMENTACION_BACKEND.md` (este archivo)

## ✅ Checklist de Implementación

- [x] Crear migración SQL
- [x] Crear tabla `medical_record_consent_templates`
- [x] Modificar tabla `medical_record_consents`
- [x] Insertar plantillas por defecto
- [x] Crear entidad TypeORM
- [x] Crear DTOs
- [x] Crear servicio
- [x] Crear controlador
- [x] Crear módulo
- [x] Registrar en AppModule
- [x] Agregar permisos
- [x] Asignar permisos a roles
- [x] Probar endpoints
- [x] Verificar backend funcionando

## 🚀 Próximos Pasos

1. **Frontend - Fase 2**
   - Crear página de gestión de plantillas HC
   - Crear componentes de creación/edición
   - Modificar modal de generación en HC
   - Agregar menú de navegación

2. **Integración - Fase 3**
   - Modificar servicio de medical-records para usar plantillas HC
   - Actualizar modal de generación de consentimientos
   - Implementar renderizado con variables HC

3. **Testing - Fase 4**
   - Pruebas de integración
   - Pruebas de usuario
   - Documentación de usuario

## 📝 Notas Técnicas

- Las plantillas HC están completamente separadas de las plantillas tradicionales
- Multi-tenancy soportado (plantillas globales y por tenant)
- Soft delete implementado
- Auditoría completa con created_by
- Categorías: general, procedure, treatment, anamnesis
- Sistema de plantillas predeterminadas por categoría
- 38 variables disponibles vs 14 de plantillas tradicionales

---

**Versión**: 15.0.10
**Fecha**: 2026-01-25
**Estado**: ✅ Backend Completado
**Siguiente**: Frontend (Fase 2)
