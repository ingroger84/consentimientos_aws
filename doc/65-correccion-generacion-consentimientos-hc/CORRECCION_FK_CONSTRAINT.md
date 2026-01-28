# Corrección: Violación de Foreign Key Constraint en medical_record_consents

## Error Original
```
insert or update on table "medical_record_consents" violates foreign key constraint "FK_04937619fdbfd9c97b1b1a5946e"
```

## Causa del Problema

La tabla `medical_record_consents` tenía una foreign key constraint que requería que el `consent_id` existiera en la tabla `consents`:

```sql
FK_04937619fdbfd9c97b1b1a5946e:
  consent_id -> consents.id
```

Sin embargo, los consentimientos generados desde historias clínicas:
1. **No son registros en la tabla `consents`** (que es para consentimientos tradicionales)
2. **Son PDFs generados dinámicamente** con plantillas HC
3. **No necesitan existir en la tabla `consents`** porque son independientes

El código estaba intentando insertar un UUID temporal generado con `crypto.randomUUID()` que no existía en la tabla `consents`, causando la violación de la foreign key.

## Solución Implementada

### 1. Agregar Columnas para Metadata

Se agregaron 3 nuevas columnas a `medical_record_consents` para almacenar la información del consentimiento sin depender de la tabla `consents`:

```sql
ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS consent_number VARCHAR(100);

ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS consent_metadata JSONB;
```

**Propósito de cada columna:**
- `pdf_url`: URL del PDF generado en S3
- `consent_number`: Número único del consentimiento (ej: CONS-HC-2026-000001-1737856789)
- `consent_metadata`: Metadata en formato JSON con templateIds, templateNames, etc.

### 2. Actualizar Entidad TypeORM

```typescript
// backend/src/medical-records/entities/medical-record-consent.entity.ts

@Column({ name: 'consent_id', nullable: true })
consentId: string; // Ahora puede ser null

@Column({ name: 'pdf_url', type: 'text', nullable: true })
pdfUrl: string;

@Column({ name: 'consent_number', length: 100, nullable: true })
consentNumber: string;

@Column({ name: 'consent_metadata', type: 'jsonb', nullable: true })
consentMetadata: any;
```

### 3. Modificar Servicio para No Usar consentId

```typescript
// backend/src/medical-records/medical-records.service.ts

const medicalRecordConsent = this.medicalRecordConsentsRepository.create({
  medicalRecordId,
  consentId: null, // ✅ No guardar FK a consents
  pdfUrl, // ✅ Guardar URL del PDF
  consentNumber, // ✅ Guardar número de consentimiento
  consentMetadata: { // ✅ Guardar metadata
    templateIds: templateIds,
    templateCount: templateIds.length,
    templateNames: templates.map((t) => t.name),
    generatedAt: new Date(),
  },
  evolutionId: dto.evolutionId || null,
  createdDuringConsultation: true,
  requiredForProcedure: dto.requiredForProcedure || false,
  procedureName: dto.procedureName || null,
  diagnosisCode: dto.diagnosisCode || null,
  diagnosisDescription: dto.diagnosisDescription || null,
  notes: dto.notes || null,
  createdBy: userId,
});
```

## Estructura Final de medical_record_consents

```
medical_record_consents
├── id (UUID, PK)
├── medical_record_id (UUID, FK -> medical_records.id)
├── consent_id (UUID, nullable, FK -> consents.id) ← Ahora NULL para HC
├── pdf_url (TEXT, nullable) ← NUEVO
├── consent_number (VARCHAR(100), nullable) ← NUEVO
├── consent_metadata (JSONB, nullable) ← NUEVO
├── evolution_id (UUID, nullable, FK -> evolutions.id)
├── created_during_consultation (BOOLEAN)
├── required_for_procedure (BOOLEAN)
├── procedure_name (VARCHAR, nullable)
├── diagnosis_code (VARCHAR(10), nullable)
├── diagnosis_description (TEXT, nullable)
├── notes (TEXT, nullable)
├── created_at (TIMESTAMP)
└── created_by (UUID, FK -> users.id)
```

## Diferencias entre Consentimientos Tradicionales y HC

### Consentimientos Tradicionales
- Se guardan en la tabla `consents`
- Tienen un registro completo con estado, firmas, etc.
- `medical_record_consents.consent_id` apunta a `consents.id`
- Flujo: Cliente → Servicio → Preguntas → Firma → PDF

### Consentimientos HC
- **NO se guardan en la tabla `consents`**
- Se generan directamente como PDF desde plantillas HC
- `medical_record_consents.consent_id` es `NULL`
- Metadata se guarda en `consent_metadata` (JSONB)
- PDF URL se guarda en `pdf_url`
- Flujo: HC → Plantillas HC → Variables → PDF directo

## Ejemplo de consent_metadata

```json
{
  "templateIds": [
    "d2f9d0eb-0f7c-4dcf-9f15-f71e1d8b88c0",
    "b13f2f33-6417-4c60-a986-205cce1d0f72"
  ],
  "templateCount": 2,
  "templateNames": [
    "Consentimiento Informado General HC",
    "Consentimiento para Procedimiento Médico"
  ],
  "generatedAt": "2026-01-26T06:45:00.000Z"
}
```

## Scripts de Migración

### 1. add-consent-metadata-to-mr-consents.sql
Agrega las 3 nuevas columnas a la tabla.

### 2. run-consent-metadata-migration.js
Ejecuta la migración SQL usando Node.js.

```bash
node backend/run-consent-metadata-migration.js
```

## Verificación

### Verificar estructura de tabla:
```bash
node backend/check-medical-record-consents-structure.js
```

### Resultado esperado:
```
✓ Columnas agregadas:
  - pdf_url: text
  - consent_number: character varying
  - consent_metadata: jsonb
```

## Flujo Completo de Generación

1. **Usuario selecciona plantillas HC** en el modal
2. **Frontend envía templateIds** al backend
3. **Backend obtiene plantillas** desde `medical_record_consent_templates`
4. **Backend renderiza variables** (38 variables disponibles)
5. **Backend genera PDF compuesto** con múltiples plantillas
6. **Backend sube PDF a S3** y obtiene URL
7. **Backend crea registro** en `medical_record_consents`:
   - `consentId`: NULL
   - `pdfUrl`: URL de S3
   - `consentNumber`: CONS-HC-2026-000001-timestamp
   - `consentMetadata`: JSON con templateIds, names, etc.
8. **Backend registra auditoría**
9. **Frontend muestra éxito** y abre PDF en nueva pestaña

## Beneficios de esta Solución

1. ✅ **Separación clara**: Consentimientos HC independientes de tradicionales
2. ✅ **Sin FK violations**: No depende de tabla `consents`
3. ✅ **Metadata completa**: Toda la información en JSONB
4. ✅ **PDF accesible**: URL guardada directamente
5. ✅ **Auditoría completa**: Registro de todas las acciones
6. ✅ **Escalable**: Fácil agregar más campos a metadata
7. ✅ **Compatible**: No rompe consentimientos tradicionales existentes

## Archivos Modificados

### Backend
- `backend/src/medical-records/entities/medical-record-consent.entity.ts`
- `backend/src/medical-records/medical-records.service.ts`
- `backend/add-consent-metadata-to-mr-consents.sql` (nuevo)
- `backend/run-consent-metadata-migration.js` (nuevo)
- `backend/check-medical-record-consents-structure.js` (nuevo)

### Documentación
- `doc/65-correccion-generacion-consentimientos-hc/CORRECCION_FK_CONSTRAINT.md`

## Estado: RESUELTO ✅

El error de foreign key constraint ha sido completamente resuelto. Los consentimientos HC ahora:
- Se generan sin depender de la tabla `consents`
- Guardan toda su metadata en columnas dedicadas
- Mantienen el PDF URL accesible
- Tienen un número único de consentimiento
- Son completamente independientes de consentimientos tradicionales
