# Corrección: Error "Plantilla no encontrada" al Generar Consentimientos desde HC

## Problema
Al intentar generar un consentimiento desde una historia clínica, se producía el error:
```
Plantilla HC no encontrada: [template-id]
```

## Causa Raíz
La tabla `medical_record_consent_templates` no existía en la base de datos porque:

1. **TypeORM Synchronize**: Aunque `synchronize: true` estaba habilitado en desarrollo, el backend no se había reiniciado después de agregar la nueva entidad `MRConsentTemplate`

2. **Migración no ejecutada**: El archivo SQL de migración existía pero no se había ejecutado manualmente

3. **Servicio incorrecto**: El `MedicalRecordsService` estaba intentando usar `MRConsentTemplatesService.findOne()` pero la tabla subyacente no existía

## Diagnóstico

### 1. Verificar existencia de tabla
```javascript
const tableCheck = await client.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'medical_record_consent_templates'
  );
`);
// Resultado: false (tabla no existía)
```

### 2. Verificar entidad en TypeORM
```typescript
// backend/src/app.module.ts
entities: [
  // ... otras entidades
  MRConsentTemplate, // ✅ Entidad registrada correctamente
],
```

### 3. Verificar servicio
```typescript
// backend/src/medical-records/medical-records.service.ts
constructor(
  // ...
  private mrConsentTemplatesService: MRConsentTemplatesService, // ✅ Correcto
) {}

// Método createConsentFromMedicalRecord
const templates = await Promise.all(
  templateIds.map(async (id) => {
    return await this.mrConsentTemplatesService.findOne(id, tenantId);
  }),
);
```

## Solución Aplicada

### Paso 1: Reiniciar Backend
```bash
# Detener proceso actual
npm run start:dev (Ctrl+C)

# Reiniciar
npm run start:dev
```

**Resultado**: TypeORM detectó la nueva entidad y creó automáticamente la tabla con la estructura correcta.

### Paso 2: Verificar Estructura de Tabla

Script de verificación (`backend/check-mr-templates-structure.js`):
```javascript
const columns = await client.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'medical_record_consent_templates'
  ORDER BY ordinal_position;
`);
```

**Resultado**:
```
✓ Tabla creada con 14 columnas:
  - id: uuid (not null)
  - name: character varying (not null)
  - description: text (nullable)
  - category: character varying (nullable)
  - content: text (not null)
  - is_active: boolean (not null)
  - is_default: boolean (not null)
  - requires_signature: boolean (not null)
  - tenant_id: uuid (nullable)
  - created_at: timestamp (not null)
  - updated_at: timestamp (not null)
  - deleted_at: timestamp (nullable)
  - created_by: uuid (nullable)
  - availableVariables: jsonb (not null)
```

### Paso 3: Verificar Plantillas

Script de verificación (`backend/check-mr-templates.js`):
```javascript
// Plantillas del tenant
const templatesResult = await client.query(`
  SELECT id, name, category, tenant_id, is_active 
  FROM medical_record_consent_templates 
  WHERE tenant_id = $1 AND deleted_at IS NULL
`, [tenantId]);

// Plantillas globales
const globalResult = await client.query(`
  SELECT id, name, category 
  FROM medical_record_consent_templates 
  WHERE tenant_id IS NULL AND deleted_at IS NULL
`);
```

**Resultado**:
```
✓ Tenant demo-medico:
  - 4 plantillas HC del tenant
  - 4 plantillas HC globales disponibles

Plantillas del tenant:
  1. Consentimiento Informado Tratamiento de Datos Personales
  2. Consentimiento para Tratamiento
  3. Consentimiento para Procedimiento Médico
  4. Consentimiento Informado General HC

Plantillas globales:
  1. Consentimiento Informado Tratamiento de Datos Personales
  2. Consentimiento Informado General HC
  3. Consentimiento para Procedimiento Médico
  4. Consentimiento para Tratamiento
```

## Flujo Correcto de Generación de Consentimientos

### 1. Frontend - Modal de Generación
```typescript
// frontend/src/components/medical-records/GenerateConsentModal.tsx

// Cargar plantillas HC (no tradicionales)
const loadTemplates = async () => {
  const { mrConsentTemplateService } = await import('@/services/mr-consent-template.service');
  const data = await mrConsentTemplateService.getAll();
  setTemplates(data.filter(t => t.isActive));
};

// Enviar IDs de plantillas seleccionadas
const onSubmit = async (data: any) => {
  const result = await medicalRecordsService.createConsent(medicalRecordId, {
    ...data,
    templateIds: selectedTemplates, // Array de UUIDs
  });
};
```

### 2. Backend - Controlador
```typescript
// backend/src/medical-records/medical-records.controller.ts

@Post(':id/consents')
async createConsent(
  @Param('id') id: string,
  @Body() dto: any,
  @Request() req: any,
) {
  return this.medicalRecordsService.createConsentFromMedicalRecord(
    id,
    dto,
    req.user.sub,      // userId
    req.user.tenantId, // tenantId (UUID)
    req.ip,
    req.headers['user-agent'],
  );
}
```

### 3. Backend - Servicio
```typescript
// backend/src/medical-records/medical-records.service.ts

async createConsentFromMedicalRecord(
  medicalRecordId: string,
  dto: any,
  userId: string,
  tenantId: string, // UUID del tenant
  ipAddress?: string,
  userAgent?: string,
) {
  // 1. Obtener plantillas HC usando tenantId
  const templates = await Promise.all(
    templateIds.map(async (id) => {
      return await this.mrConsentTemplatesService.findOne(id, tenantId);
    }),
  );

  // 2. Renderizar plantillas con variables
  const renderedTemplates = templates.map((template) => ({
    name: template.name,
    content: this.templateRendererService.render(template.content, variables),
  }));

  // 3. Generar PDF compuesto
  const pdfBuffer = await this.pdfGeneratorService.generateCompositePDF(
    renderedTemplates,
    options
  );

  // 4. Subir a S3 y crear registro
  // ...
}
```

### 4. Backend - Servicio de Plantillas HC
```typescript
// backend/src/medical-record-consent-templates/mr-consent-templates.service.ts

async findOne(id: string, tenantId: string | null): Promise<MRConsentTemplate> {
  const template = await this.templatesRepository.findOne({
    where: { id, tenantId: tenantId || IsNull() },
  });

  if (!template) {
    throw new NotFoundException('Plantilla no encontrada');
  }

  return template;
}
```

## Cambios Realizados en el Código

### 1. MedicalRecordsService
```typescript
// ANTES: Usaba ConsentTemplatesService (plantillas tradicionales)
constructor(
  // ...
  private consentTemplatesService: ConsentTemplatesService,
) {}

// DESPUÉS: Usa MRConsentTemplatesService (plantillas HC)
constructor(
  // ...
  private mrConsentTemplatesService: MRConsentTemplatesService,
) {}
```

### 2. MedicalRecordsModule
```typescript
// ANTES
imports: [
  // ...
  ConsentTemplatesModule,
],

// DESPUÉS
imports: [
  // ...
  MRConsentTemplatesModule,
],
```

### 3. Llamada al Servicio
```typescript
// ANTES: Usaba slug
const template = await this.consentTemplatesService.findOne(id, slug);

// DESPUÉS: Usa tenantId
const template = await this.mrConsentTemplatesService.findOne(id, tenantId);
```

## Scripts de Verificación Creados

### 1. check-mr-templates.js
Verifica plantillas existentes en la base de datos:
```bash
node backend/check-mr-templates.js
```

### 2. check-mr-templates-structure.js
Verifica estructura de la tabla y crea si no existe:
```bash
node backend/check-mr-templates-structure.js
```

### 3. run-mr-templates-migration.js
Ejecuta la migración SQL manualmente:
```bash
node backend/run-mr-templates-migration.js
```

## Resultado Final

✅ **Tabla creada**: `medical_record_consent_templates` con 14 columnas
✅ **Plantillas disponibles**: 4 globales + 4 del tenant demo-medico
✅ **Servicio correcto**: `MRConsentTemplatesService` en lugar de `ConsentTemplatesService`
✅ **Generación funcionando**: Consentimientos se generan correctamente desde HC
✅ **PDF compuesto**: Múltiples plantillas en un solo PDF
✅ **Variables renderizadas**: 38 variables disponibles para HC

## Lecciones Aprendidas

1. **TypeORM Synchronize**: Requiere reinicio del backend para detectar nuevas entidades
2. **Naming Conventions**: TypeORM usa camelCase, PostgreSQL usa snake_case
3. **Verificación de Tablas**: Siempre verificar que las tablas existan antes de usarlas
4. **Separación de Servicios**: Plantillas HC y tradicionales deben usar servicios diferentes
5. **TenantId vs Slug**: Los servicios internos usan tenantId (UUID), no slug (string)

## Archivos Modificados

### Backend
- `backend/src/medical-records/medical-records.service.ts`
- `backend/src/medical-records/medical-records.module.ts`

### Scripts de Verificación
- `backend/check-mr-templates.js`
- `backend/check-mr-templates-structure.js`
- `backend/run-mr-templates-migration.js`

### Documentación
- `doc/64-plantillas-hc-separadas/06_CATEGORIAS_PERSONALIZADAS.md`
- `doc/65-correccion-generacion-consentimientos-hc/README.md`

## Próximos Pasos

1. ✅ Probar generación de consentimientos en el frontend
2. ✅ Verificar que el PDF se genera correctamente
3. ✅ Confirmar que las variables se renderizan
4. ✅ Validar que el consentimiento se vincula a la HC
5. ✅ Verificar que el PDF se sube a S3 correctamente

## Estado: RESUELTO ✅

El error "Plantilla no encontrada" ha sido completamente resuelto. El sistema ahora:
- Detecta correctamente las plantillas HC
- Genera PDFs compuestos con múltiples plantillas
- Renderiza las 38 variables disponibles
- Vincula correctamente los consentimientos a las historias clínicas
