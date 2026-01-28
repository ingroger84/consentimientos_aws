# Integración de Consentimientos con Historias Clínicas

## Objetivo

Permitir que desde una historia clínica abierta, el profesional de salud pueda generar, firmar y adjuntar consentimientos informados de manera fluida y automática.

---

## 🎯 Casos de Uso

### 1. Consentimiento Informado General
**Cuándo**: Al inicio de cualquier atención médica
**Contenido**: Autorización para examen físico, procedimientos diagnósticos básicos, tratamiento

### 2. Consentimiento para Procedimiento Específico
**Cuándo**: Antes de cirugías, biopsias, infiltraciones, etc.
**Contenido**: Descripción del procedimiento, riesgos, beneficios, alternativas

### 3. Consentimiento para Tratamiento de Datos
**Cuándo**: Al crear la HC o cuando se requiera
**Contenido**: Autorización para uso de información clínica, compartir con otros profesionales

### 4. Consentimiento para Uso de Imágenes
**Cuándo**: Cuando se tomen fotografías médicas
**Contenido**: Autorización para tomar, almacenar y usar imágenes con fines médicos

---

## 🏗️ Arquitectura de Integración

### Modelo de Datos

```sql
-- Tabla de relación HC-Consentimiento
CREATE TABLE medical_record_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  consent_id UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
  evolution_id UUID REFERENCES evolutions(id), -- Opcional: vincular a evolución específica
  
  -- Contexto clínico
  created_during_consultation BOOLEAN DEFAULT TRUE,
  required_for_procedure BOOLEAN DEFAULT FALSE,
  procedure_name VARCHAR(255),
  diagnosis_code VARCHAR(10), -- CIE-10
  diagnosis_description TEXT,
  
  -- Metadata
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Índices
  CONSTRAINT unique_medical_record_consent UNIQUE(medical_record_id, consent_id)
);

CREATE INDEX idx_mr_consents_medical_record ON medical_record_consents(medical_record_id);
CREATE INDEX idx_mr_consents_consent ON medical_record_consents(consent_id);
CREATE INDEX idx_mr_consents_evolution ON medical_record_consents(evolution_id);
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    HISTORIA CLÍNICA                         │
│                                                             │
│  medical_records                                            │
│  ├── id: "hc-123"                                           │
│  ├── recordNumber: "HC-2026-001"                            │
│  ├── client_id: "client-456"                                │
│  └── status: "active"                                       │
│                                                             │
│         │                                                   │
│         │ Genera                                            │
│         ▼                                                   │
│                                                             │
│  medical_record_consents (Vínculo)                          │
│  ├── medical_record_id: "hc-123"                            │
│  ├── consent_id: "consent-789"                              │
│  ├── procedure_name: "Apendicectomía"                       │
│  └── diagnosis_code: "K35.8"                                │
│                                                             │
│         │                                                   │
│         │ Referencia                                        │
│         ▼                                                   │
│                                                             │
│  consents (Consentimiento)                                  │
│  ├── id: "consent-789"                                      │
│  ├── consentNumber: "CONS-2026-001"                         │
│  ├── client_id: "client-456"                                │
│  ├── type: "procedure"                                      │
│  ├── status: "signed"                                       │
│  └── pdfUrl: "s3://bucket/consent-789.pdf"                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Implementación Backend

### 1. Entidad TypeORM

```typescript
// backend/src/medical-records/entities/medical-record-consent.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Consent } from '../../consents/entities/consent.entity';
import { Evolution } from './evolution.entity';
import { User } from '../../users/entities/user.entity';

@Entity('medical_record_consents')
export class MedicalRecordConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id' })
  medicalRecordId: string;

  @Column({ name: 'consent_id' })
  consentId: string;

  @Column({ name: 'evolution_id', nullable: true })
  evolutionId: string;

  @Column({ name: 'created_during_consultation', default: true })
  createdDuringConsultation: boolean;

  @Column({ name: 'required_for_procedure', default: false })
  requiredForProcedure: boolean;

  @Column({ name: 'procedure_name', nullable: true })
  procedureName: string;

  @Column({ name: 'diagnosis_code', nullable: true })
  diagnosisCode: string;

  @Column({ name: 'diagnosis_description', type: 'text', nullable: true })
  diagnosisDescription: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  // Relaciones
  @ManyToOne(() => MedicalRecord, record => record.consents)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @ManyToOne(() => Consent)
  @JoinColumn({ name: 'consent_id' })
  consent: Consent;

  @ManyToOne(() => Evolution, { nullable: true })
  @JoinColumn({ name: 'evolution_id' })
  evolution: Evolution;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
```

### 2. DTO para Crear Consentimiento desde HC

```typescript
// backend/src/medical-records/dto/create-consent-from-medical-record.dto.ts
import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ConsentTypeFromMR {
  GENERAL = 'general',
  PROCEDURE = 'procedure',
  DATA_TREATMENT = 'data_treatment',
  IMAGE_RIGHTS = 'image_rights',
}

export class CreateConsentFromMedicalRecordDto {
  @IsEnum(ConsentTypeFromMR)
  consentType: ConsentTypeFromMR;

  @IsOptional()
  @IsString()
  procedureName?: string;

  @IsOptional()
  @IsString()
  diagnosisCode?: string;

  @IsOptional()
  @IsString()
  diagnosisDescription?: string;

  @IsOptional()
  @IsBoolean()
  requiredForProcedure?: boolean;

  @IsOptional()
  @IsString()
  evolutionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Información adicional del consentimiento
  @IsOptional()
  additionalInfo?: {
    risks?: string[];
    benefits?: string[];
    alternatives?: string[];
    complications?: string[];
  };
}
```

### 3. Servicio

```typescript
// backend/src/medical-records/medical-records.service.ts
async createConsentFromMedicalRecord(
  medicalRecordId: string,
  dto: CreateConsentFromMedicalRecordDto,
  userId: string,
  tenantId: string,
): Promise<{ consent: Consent; medicalRecordConsent: MedicalRecordConsent }> {
  // 1. Verificar que la HC existe y pertenece al tenant
  const medicalRecord = await this.findOne(medicalRecordId, tenantId);

  // 2. Verificar que la HC no esté cerrada
  if (medicalRecord.status === 'closed' || medicalRecord.isLocked) {
    throw new ForbiddenException('No se pueden crear consentimientos en una HC cerrada');
  }

  // 3. Obtener datos del cliente
  const client = await this.clientsService.findOne(medicalRecord.clientId, tenantId);

  // 4. Preparar datos del consentimiento
  const consentData = {
    clientId: client.id,
    type: this.mapConsentType(dto.consentType),
    status: 'pending_signature',
    // Pre-llenar con datos de la HC
    procedureData: dto.procedureName ? {
      name: dto.procedureName,
      diagnosis: dto.diagnosisDescription,
      diagnosisCode: dto.diagnosisCode,
      risks: dto.additionalInfo?.risks || [],
      benefits: dto.additionalInfo?.benefits || [],
      alternatives: dto.additionalInfo?.alternatives || [],
    } : undefined,
  };

  // 5. Crear el consentimiento
  const consent = await this.consentsService.create(consentData, userId, tenantId);

  // 6. Crear la relación HC-Consentimiento
  const medicalRecordConsent = await this.medicalRecordConsentsRepository.save({
    medicalRecordId,
    consentId: consent.id,
    evolutionId: dto.evolutionId,
    createdDuringConsultation: true,
    requiredForProcedure: dto.requiredForProcedure || false,
    procedureName: dto.procedureName,
    diagnosisCode: dto.diagnosisCode,
    diagnosisDescription: dto.diagnosisDescription,
    notes: dto.notes,
    createdBy: userId,
  });

  // 7. Registrar en auditoría
  await this.auditService.log({
    medicalRecordId,
    action: 'CREATE_CONSENT',
    entityType: 'medical_record_consent',
    entityId: medicalRecordConsent.id,
    newValues: { consentId: consent.id, procedureName: dto.procedureName },
    userId,
  });

  return { consent, medicalRecordConsent };
}

// Obtener consentimientos de una HC
async getConsents(medicalRecordId: string, tenantId: string): Promise<MedicalRecordConsent[]> {
  const medicalRecord = await this.findOne(medicalRecordId, tenantId);

  return await this.medicalRecordConsentsRepository.find({
    where: { medicalRecordId },
    relations: ['consent', 'consent.client', 'creator', 'evolution'],
    order: { createdAt: 'DESC' },
  });
}
```

### 4. Controlador

```typescript
// backend/src/medical-records/medical-records.controller.ts
@Post(':id/consents')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.CREATE_MEDICAL_RECORDS)
async createConsent(
  @Param('id') id: string,
  @Body() dto: CreateConsentFromMedicalRecordDto,
  @TenantSlug() tenantSlug: string,
  @CurrentUser() user: any,
) {
  const tenant = await this.tenantsService.findBySlug(tenantSlug);
  return this.medicalRecordsService.createConsentFromMedicalRecord(
    id,
    dto,
    user.sub,
    tenant.id,
  );
}

@Get(':id/consents')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_MEDICAL_RECORDS)
async getConsents(
  @Param('id') id: string,
  @TenantSlug() tenantSlug: string,
) {
  const tenant = await this.tenantsService.findBySlug(tenantSlug);
  return this.medicalRecordsService.getConsents(id, tenant.id);
}
```

---

## 🎨 Implementación Frontend

### 1. Modal para Generar Consentimiento

```typescript
// frontend/src/components/medical-records/GenerateConsentModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileText } from 'lucide-react';
import { medicalRecordsService } from '@/services/medical-records.service';
import { useToast } from '@/hooks/useToast';

interface GenerateConsentModalProps {
  medicalRecordId: string;
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateConsentModal({
  medicalRecordId,
  clientId,
  clientName,
  onClose,
  onSuccess,
}: GenerateConsentModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const consentType = watch('consentType');

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await medicalRecordsService.createConsent(medicalRecordId, data);
      toast.success('Consentimiento generado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al generar consentimiento', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Generar Consentimiento</h2>
              <p className="text-sm text-gray-600">Para: {clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tipo de Consentimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consentimiento *
            </label>
            <select
              {...register('consentType', { required: 'Selecciona un tipo' })}
              className="input"
            >
              <option value="">Seleccionar...</option>
              <option value="general">Consentimiento Informado General</option>
              <option value="procedure">Procedimiento Específico</option>
              <option value="data_treatment">Tratamiento de Datos Personales</option>
              <option value="image_rights">Uso de Imágenes</option>
            </select>
            {errors.consentType && (
              <p className="text-sm text-red-600 mt-1">{errors.consentType.message}</p>
            )}
          </div>

          {/* Campos específicos para procedimiento */}
          {consentType === 'procedure' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Procedimiento *
                </label>
                <input
                  type="text"
                  {...register('procedureName', { required: 'Campo requerido' })}
                  className="input"
                  placeholder="Ej: Apendicectomía"
                />
                {errors.procedureName && (
                  <p className="text-sm text-red-600 mt-1">{errors.procedureName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código CIE-10
                </label>
                <input
                  type="text"
                  {...register('diagnosisCode')}
                  className="input"
                  placeholder="Ej: K35.8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Diagnóstico
                </label>
                <textarea
                  {...register('diagnosisDescription')}
                  className="input"
                  rows={3}
                  placeholder="Descripción del diagnóstico..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('requiredForProcedure')}
                  id="required"
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm text-gray-700">
                  Requerido para realizar el procedimiento
                </label>
              </div>
            </>
          )}

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              {...register('notes')}
              className="input"
              rows={3}
              placeholder="Información adicional relevante..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Generar Consentimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 2. Integración en Vista de HC

```typescript
// frontend/src/pages/ViewMedicalRecordPage.tsx
// Agregar estado y modal
const [showConsentModal, setShowConsentModal] = useState(false);

// Agregar botón en el header
<div className="flex items-center gap-4">
  <button
    onClick={() => navigate('/medical-records')}
    className="p-2 hover:bg-gray-100 rounded-lg"
  >
    <ArrowLeft className="w-5 h-5" />
  </button>
  <div className="flex-1">
    <h1 className="text-2xl font-bold">{record.recordNumber}</h1>
  </div>
  {record.status === 'active' && (
    <button
      onClick={() => setShowConsentModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <FileText className="w-4 h-4" />
      Generar Consentimiento
    </button>
  )}
</div>

// Agregar tab de consentimientos
{activeTab === 'consentimientos' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Consentimientos Vinculados</h3>
    {record.consents && record.consents.length > 0 ? (
      <div className="space-y-3">
        {record.consents.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{item.consent.consentNumber}</p>
                <p className="text-sm text-gray-600">
                  {item.procedureName || 'Consentimiento general'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Creado: {new Date(item.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                item.consent.status === 'signed' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.consent.status === 'signed' ? 'Firmado' : 'Pendiente'}
              </span>
            </div>
            {item.consent.pdfUrl && (
              <a
                href={item.consent.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Ver PDF
              </a>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-8">
        No hay consentimientos vinculados
      </p>
    )}
  </div>
)}

// Agregar modal al final
{showConsentModal && (
  <GenerateConsentModal
    medicalRecordId={id!}
    clientId={record.clientId}
    clientName={record.client?.name || ''}
    onClose={() => setShowConsentModal(false)}
    onSuccess={loadRecord}
  />
)}
```

### 3. Servicio API

```typescript
// frontend/src/services/medical-records.service.ts
async createConsent(medicalRecordId: string, data: any) {
  const response = await api.post(
    `/medical-records/${medicalRecordId}/consents`,
    data
  );
  return response.data;
}

async getConsents(medicalRecordId: string) {
  const response = await api.get(
    `/medical-records/${medicalRecordId}/consents`
  );
  return response.data;
}
```

---

## 📋 Flujo de Usuario Completo

```
1. Profesional abre HC del paciente
   ↓
2. Durante la consulta, identifica necesidad de consentimiento
   ↓
3. Click en "Generar Consentimiento"
   ↓
4. Selecciona tipo de consentimiento
   ↓
5. Sistema pre-llena datos automáticamente:
   - Nombre del paciente
   - Documento
   - Número de HC
   - Fecha actual
   - Profesional que atiende
   ↓
6. Profesional completa información específica:
   - Nombre del procedimiento (si aplica)
   - Diagnóstico
   - Riesgos y beneficios
   ↓
7. Sistema genera consentimiento en estado "pending_signature"
   ↓
8. Consentimiento se vincula automáticamente a la HC
   ↓
9. Paciente firma el consentimiento (en tablet o papel)
   ↓
10. Sistema genera PDF y lo almacena en S3
   ↓
11. Consentimiento aparece en tab "Consentimientos" de la HC
   ↓
12. Se registra en auditoría
```

---

## ✅ Beneficios de esta Integración

1. **Flujo Natural**: El profesional no sale del contexto de la HC
2. **Datos Pre-llenados**: Reduce errores y tiempo de captura
3. **Trazabilidad**: Vínculo directo entre HC y consentimientos
4. **Auditoría**: Registro completo de cuándo y por qué se generó
5. **Cumplimiento Legal**: Documentación completa y organizada
6. **Facilidad de Consulta**: Todos los consentimientos en un solo lugar

---

## 🎯 Próximos Pasos

1. Crear migración SQL para tabla `medical_record_consents`
2. Implementar entidad y servicio en backend
3. Crear endpoints en controlador
4. Implementar modal en frontend
5. Agregar tab de consentimientos en vista de HC
6. Probar flujo completo
7. Documentar para usuarios

**Fecha**: 2026-01-25  
**Versión**: 15.0.9
