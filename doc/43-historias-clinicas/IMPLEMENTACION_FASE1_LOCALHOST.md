# Implementación Fase 1 - Localhost

## Estado Actual

### ✅ Completado

1. **Migraciones SQL**
   - `backend/src/migrations/create-medical-records-tables.sql`
   - Script de ejecución: `backend/run-medical-records-migration.ps1`

2. **Entidades TypeORM**
   - `backend/src/medical-records/entities/medical-record.entity.ts`
   - `backend/src/medical-records/entities/anamnesis.entity.ts`

### ⏳ Pendiente de Crear

Debido a la extensión del código, aquí está la lista completa de archivos que necesitas crear:

## Backend - Archivos Pendientes

### 1. Entidades Restantes
```
backend/src/medical-records/entities/
├── physical-exam.entity.ts
├── diagnosis.entity.ts
├── evolution.entity.ts
└── medical-record-audit.entity.ts
```

### 2. DTOs
```
backend/src/medical-records/dto/
├── create-medical-record.dto.ts
├── update-medical-record.dto.ts
├── create-anamnesis.dto.ts
├── update-anamnesis.dto.ts
├── create-physical-exam.dto.ts
├── create-diagnosis.dto.ts
└── create-evolution.dto.ts
```

### 3. Servicios
```
backend/src/medical-records/
├── medical-records.service.ts
├── anamnesis.service.ts
├── physical-exams.service.ts
├── diagnoses.service.ts
├── evolutions.service.ts
└── audit.service.ts
```

### 4. Controladores
```
backend/src/medical-records/
├── medical-records.controller.ts
├── anamnesis.controller.ts
├── physical-exams.controller.ts
├── diagnoses.controller.ts
└── evolutions.controller.ts
```

### 5. Guards y Decorators
```
backend/src/medical-records/guards/
└── medical-record-access.guard.ts

backend/src/medical-records/decorators/
└── medical-record.decorator.ts
```

### 6. Módulo Principal
```
backend/src/medical-records/
└── medical-records.module.ts
```

### 7. Agregar al App Module
```typescript
// backend/src/app.module.ts
import { MedicalRecordsModule } from './medical-records/medical-records.module';

@Module({
  imports: [
    // ... otros módulos
    MedicalRecordsModule,
  ],
})
```

## Frontend - Archivos Pendientes

### 1. Types
```
frontend/src/types/
└── medical-record.ts
```

### 2. Services
```
frontend/src/services/
└── medical-records.service.ts
```

### 3. Pages
```
frontend/src/pages/
├── MedicalRecordsPage.tsx
├── CreateMedicalRecordPage.tsx
└── ViewMedicalRecordPage.tsx
```

### 4. Components
```
frontend/src/components/medical-records/
├── MedicalRecordCard.tsx
├── MedicalRecordFilters.tsx
├── CreateMedicalRecordModal.tsx
├── PatientInfoCard.tsx
├── AnamnesisForm.tsx
├── PhysicalExamForm.tsx
├── VitalSignsForm.tsx
├── DiagnosisForm.tsx
└── EvolutionForm.tsx
```

### 5. Hooks
```
frontend/src/hooks/
└── useMedicalRecords.ts
```

### 6. Rutas
```typescript
// frontend/src/App.tsx
<Route path="/medical-records" element={<MedicalRecordsPage />} />
<Route path="/medical-records/new" element={<CreateMedicalRecordPage />} />
<Route path="/medical-records/:id" element={<ViewMedicalRecordPage />} />
```

### 7. Navegación
```typescript
// frontend/src/components/Layout.tsx
// Agregar al menú de navegación
{
  name: 'Historias Clínicas',
  href: '/medical-records',
  icon: FileText,
  permission: 'view_medical_records'
}
```

## Pasos para Completar la Implementación

### Paso 1: Ejecutar Migraciones
```powershell
# Opción 1: Usar el script
.\backend\run-medical-records-migration.ps1

# Opción 2: Manual con psql
psql -U datagree_admin -d consentimientos -h localhost -f backend/src/migrations/create-medical-records-tables.sql

# Opción 3: Copiar y pegar en pgAdmin
```

### Paso 2: Crear Permisos
```sql
-- Ejecutar en la base de datos
INSERT INTO permissions (name, description, category) VALUES
('view_medical_records', 'Ver historias clínicas', 'medical_records'),
('create_medical_records', 'Crear historias clínicas', 'medical_records'),
('edit_medical_records', 'Editar historias clínicas', 'medical_records'),
('delete_medical_records', 'Eliminar historias clínicas', 'medical_records'),
('sign_medical_records', 'Firmar historias clínicas', 'medical_records');
```

### Paso 3: Asignar Permisos a Roles
```sql
-- Ejemplo: Asignar todos los permisos al super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.type = 'super_admin'
AND p.category = 'medical_records';
```

### Paso 4: Compilar Backend
```bash
cd backend
npm run build
npm run start:dev
```

### Paso 5: Compilar Frontend
```bash
cd frontend
npm run dev
```

## Estimación de Tiempo Restante

- **Backend completo**: 4-6 horas
- **Frontend completo**: 6-8 horas
- **Testing**: 2-3 horas
- **Total**: 12-17 horas de desarrollo

## Recomendación

Dado el volumen de código necesario, te recomiendo:

1. **Opción A**: Implementar por partes
   - Primero solo el CRUD básico de medical_records
   - Luego agregar anamnesis
   - Después physical_exams
   - Y así sucesivamente

2. **Opción B**: Usar generadores de código
   - NestJS CLI para backend
   - Copiar y adaptar componentes existentes para frontend

3. **Opción C**: Implementación asistida
   - Te puedo ayudar a crear cada archivo uno por uno
   - Pero tomará múltiples sesiones

¿Qué prefieres que hagamos?
