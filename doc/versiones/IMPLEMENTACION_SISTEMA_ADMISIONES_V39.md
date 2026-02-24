# Implementación del Sistema de Admisiones para Historias Clínicas
## Versión 39.0.0 - 2026-02-18

---

## 📋 RESUMEN EJECUTIVO

Se ha implementado un sistema completo de **Admisiones Múltiples** para las Historias Clínicas, permitiendo que un mismo paciente pueda tener múltiples consultas/visitas (admisiones) dentro de una misma HC, y cada admisión agrupa sus propios registros de:

- ✅ Anamnesis
- ✅ Exámenes físicos
- ✅ Diagnósticos
- ✅ Evoluciones
- ✅ Consentimientos

---

## 🎯 OBJETIVO

**ANTES**: Una HC tenía un solo `admission_type` y `admission_date`. Todos los registros se mezclaban sin distinción de cuándo fueron creados.

**AHORA**: Una HC puede tener múltiples admisiones (consultas/visitas), y cada admisión agrupa sus propios registros, manteniendo un historial organizado y cronológico.

---

## 🏗️ ARQUITECTURA

### Modelo de Datos

```
medical_records (HC)
  ├── admissions (Admisiones)
  │   ├── admission_1 (Primera vez - 2026-01-15)
  │   │   ├── anamnesis
  │   │   ├── physical_exams
  │   │   ├── diagnoses
  │   │   ├── evolutions
  │   │   └── consents
  │   │
  │   ├── admission_2 (Control - 2026-02-10)
  │   │   ├── anamnesis
  │   │   ├── physical_exams
  │   │   ├── diagnoses
  │   │   ├── evolutions
  │   │   └── consents
  │   │
  │   └── admission_3 (Urgencia - 2026-02-18)
  │       ├── anamnesis
  │       ├── physical_exams
  │       ├── diagnoses
  │       ├── evolutions
  │       └── consents
```

### Tipos de Admisión

```typescript
enum AdmissionType {
  PRIMERA_VEZ = 'primera_vez',           // Primera consulta del paciente
  CONTROL = 'control',                   // Consulta de control/seguimiento
  URGENCIA = 'urgencia',                 // Atención de urgencia
  HOSPITALIZACION = 'hospitalizacion',   // Hospitalización
  CIRUGIA = 'cirugia',                   // Procedimiento quirúrgico
  PROCEDIMIENTO = 'procedimiento',       // Procedimiento ambulatorio
  TELEMEDICINA = 'telemedicina',         // Consulta virtual
  DOMICILIARIA = 'domiciliaria',         // Atención domiciliaria
  INTERCONSULTA = 'interconsulta',       // Interconsulta con especialista
  OTRO = 'otro'                          // Otro tipo de admisión
}
```

---

## 📁 ARCHIVOS CREADOS

### Backend

#### 1. Migración SQL
- **Archivo**: `backend/migrations/add-admissions-system.sql`
- **Descripción**: Crea la tabla `admissions` y agrega columna `admission_id` a todas las tablas relacionadas
- **Funciones**:
  - Crea tabla `admissions` con todos los campos necesarios
  - Agrega columna `admission_id` a: anamnesis, physical_exams, diagnoses, evolutions, medical_record_consents
  - Migra datos existentes (crea una admisión inicial para cada HC)
  - Función `generate_admission_number()` para generar números únicos

#### 2. Entidad Admission
- **Archivo**: `backend/src/medical-records/entities/admission.entity.ts`
- **Descripción**: Entidad TypeORM para admisiones
- **Campos principales**:
  - `admissionNumber`: Número único (HC-2026-000001-ADM-001)
  - `admissionDate`: Fecha de la admisión
  - `admissionType`: Tipo de admisión (enum)
  - `reason`: Motivo de la admisión
  - `status`: Estado (active, closed, cancelled)
  - `isLocked`: Bloqueada o no
  - Relaciones con anamnesis, exámenes, diagnósticos, evoluciones, consentimientos

#### 3. DTOs
- **Archivo**: `backend/src/medical-records/dto/admission.dto.ts`
- **DTOs**:
  - `CreateAdmissionDto`: Crear nueva admisión
  - `UpdateAdmissionDto`: Actualizar admisión
  - `CloseAdmissionDto`: Cerrar admisión

#### 4. Servicio de Admisiones
- **Archivo**: `backend/src/medical-records/admissions.service.ts`
- **Métodos principales**:
  - `create()`: Crear nueva admisión
  - `findByMedicalRecord()`: Obtener todas las admisiones de una HC
  - `findOne()`: Obtener una admisión específica
  - `update()`: Actualizar admisión
  - `close()`: Cerrar admisión
  - `reopen()`: Reabrir admisión cerrada
  - `cancel()`: Cancelar admisión
  - `getActiveAdmission()`: Obtener admisión activa de una HC
  - `hasActiveAdmissions()`: Verificar si hay admisiones activas

#### 5. Controlador de Admisiones
- **Archivo**: `backend/src/medical-records/admissions.controller.ts`
- **Endpoints**:
  - `POST /admissions`: Crear admisión
  - `GET /admissions/medical-record/:id`: Listar admisiones de una HC
  - `GET /admissions/:id`: Obtener admisión específica
  - `PUT /admissions/:id`: Actualizar admisión
  - `PATCH /admissions/:id/close`: Cerrar admisión
  - `PATCH /admissions/:id/reopen`: Reabrir admisión
  - `PATCH /admissions/:id/cancel`: Cancelar admisión
  - `GET /admissions/medical-record/:id/active`: Obtener admisión activa

#### 6. Actualizaciones de Entidades
- **Archivos actualizados**:
  - `medical-record.entity.ts`: Agregada relación `admissions`
  - `anamnesis.entity.ts`: Agregada relación `admission`
  - `physical-exam.entity.ts`: Agregada relación `admission`
  - `diagnosis.entity.ts`: Agregada relación `admission`
  - `evolution.entity.ts`: Agregada relación `admission`
  - `medical-record-consent.entity.ts`: Agregada relación `admission`

#### 7. Actualizaciones de DTOs
- **Archivo**: `backend/src/medical-records/dto/index.ts`
- **Cambios**: Agregado campo `admissionId` (UUID, requerido) a:
  - `CreateAnamnesisDto`
  - `CreatePhysicalExamDto`
  - `CreateDiagnosisDto`
  - `CreateEvolutionDto`

#### 8. Módulo Actualizado
- **Archivo**: `backend/src/medical-records/medical-records.module.ts`
- **Cambios**:
  - Agregada entidad `Admission` a TypeORM
  - Agregado `AdmissionsService` a providers
  - Agregado `AdmissionsController` a controllers
  - Exportado `AdmissionsService`

---

## 🔄 FLUJO DE TRABAJO

### Escenario 1: Paciente Nuevo (Primera HC)

```typescript
// 1. Crear HC
POST /medical-records
{
  "clientId": "uuid-del-paciente",
  "branchId": "uuid-de-la-sede",
  "admissionDate": "2026-02-18T10:00:00Z",
  "admissionType": "primera_vez"
}

// Respuesta: HC creada con admisión inicial automática
{
  "id": "hc-uuid",
  "recordNumber": "HC-2026-000001",
  "admissions": [
    {
      "id": "adm-uuid",
      "admissionNumber": "HC-2026-000001-ADM-001",
      "admissionType": "primera_vez",
      "status": "active"
    }
  ]
}

// 2. Agregar anamnesis a la admisión
POST /medical-records/hc-uuid/anamnesis
{
  "admissionId": "adm-uuid",
  "chiefComplaint": "Dolor de cabeza",
  "currentIllness": "Dolor desde hace 3 días"
}

// 3. Agregar examen físico
POST /medical-records/hc-uuid/physical-exams
{
  "admissionId": "adm-uuid",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 75
  }
}

// 4. Cerrar admisión
PATCH /admissions/adm-uuid/close
{
  "closureNotes": "Paciente dado de alta en buen estado"
}
```

### Escenario 2: Paciente con HC Existente (Nueva Consulta)

```typescript
// 1. Verificar si el paciente tiene HC
GET /medical-records?clientId=uuid-del-paciente

// Respuesta: HC existente encontrada
{
  "id": "hc-uuid",
  "recordNumber": "HC-2026-000001",
  "status": "active",
  "admissions": [
    {
      "id": "adm-1-uuid",
      "admissionNumber": "HC-2026-000001-ADM-001",
      "admissionType": "primera_vez",
      "status": "closed",
      "closedAt": "2026-01-15T15:00:00Z"
    }
  ]
}

// 2. Preguntar al usuario el tipo de admisión
// (Frontend muestra modal con opciones)

// 3. Crear nueva admisión
POST /admissions
{
  "medicalRecordId": "hc-uuid",
  "admissionType": "control",
  "reason": "Control post-operatorio",
  "admissionDate": "2026-02-18T10:00:00Z"
}

// Respuesta: Nueva admisión creada
{
  "id": "adm-2-uuid",
  "admissionNumber": "HC-2026-000001-ADM-002",
  "admissionType": "control",
  "status": "active"
}

// 4. Agregar registros a la nueva admisión
POST /medical-records/hc-uuid/anamnesis
{
  "admissionId": "adm-2-uuid",
  "chiefComplaint": "Control post-operatorio",
  "currentIllness": "Evolución favorable"
}

// 5. Agregar evolución
POST /medical-records/hc-uuid/evolutions
{
  "admissionId": "adm-2-uuid",
  "evolutionDate": "2026-02-18T10:30:00Z",
  "subjective": "Paciente refiere mejoría",
  "objective": "Herida quirúrgica en buen estado",
  "assessment": "Evolución favorable",
  "plan": "Continuar tratamiento"
}

// 6. Cerrar admisión
PATCH /admissions/adm-2-uuid/close
{
  "closureNotes": "Control satisfactorio, próxima cita en 1 mes"
}
```

---

## 🎨 CAMBIOS EN EL FRONTEND (PENDIENTES)

### 1. Página de Crear/Editar HC

**Cambio**: Cuando se detecta que el paciente ya tiene una HC, mostrar modal para seleccionar tipo de admisión.

```typescript
// Componente: CreateMedicalRecordPage.tsx

// Al seleccionar un paciente, verificar si tiene HC
const handleClientSelect = async (clientId: string) => {
  const existingHC = await api.get(`/medical-records?clientId=${clientId}`);
  
  if (existingHC.data.length > 0) {
    // Mostrar modal para seleccionar tipo de admisión
    setShowAdmissionTypeModal(true);
    setExistingHC(existingHC.data[0]);
  } else {
    // Crear nueva HC (primera vez)
    // ... lógica actual
  }
};

// Modal de selección de tipo de admisión
<AdmissionTypeModal
  isOpen={showAdmissionTypeModal}
  onClose={() => setShowAdmissionTypeModal(false)}
  onSelect={handleAdmissionTypeSelect}
  existingHC={existingHC}
/>
```

### 2. Componente AdmissionTypeModal

```typescript
// Componente nuevo: AdmissionTypeModal.tsx

interface AdmissionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (admissionType: string, reason: string) => void;
  existingHC: MedicalRecord;
}

const AdmissionTypeModal: React.FC<AdmissionTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingHC,
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [reason, setReason] = useState('');

  const admissionTypes = [
    { value: 'primera_vez', label: 'Primera Vez', icon: '🆕' },
    { value: 'control', label: 'Control', icon: '📋' },
    { value: 'urgencia', label: 'Urgencia', icon: '🚨' },
    { value: 'hospitalizacion', label: 'Hospitalización', icon: '🏥' },
    { value: 'cirugia', label: 'Cirugía', icon: '⚕️' },
    { value: 'procedimiento', label: 'Procedimiento', icon: '💉' },
    { value: 'telemedicina', label: 'Telemedicina', icon: '💻' },
    { value: 'domiciliaria', label: 'Domiciliaria', icon: '🏠' },
    { value: 'interconsulta', label: 'Interconsulta', icon: '👨‍⚕️' },
    { value: 'otro', label: 'Otro', icon: '📝' },
  ];

  const handleSubmit = () => {
    if (selectedType && reason) {
      onSelect(selectedType, reason);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Paciente con Historia Clínica Existente
        </h2>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>HC Nº:</strong> {existingHC.recordNumber}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Paciente:</strong> {existingHC.client.fullName}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Admisiones previas:</strong> {existingHC.admissions.length}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Tipo de Admisión
          </label>
          <div className="grid grid-cols-2 gap-3">
            {admissionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-3 border rounded-lg text-left transition ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl mr-2">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Motivo de la Admisión
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Ej: Control post-operatorio, Consulta de seguimiento, etc."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !reason}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Crear Admisión
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

### 3. Actualizar Servicios de Anamnesis, Exámenes, etc.

```typescript
// Todos los servicios deben incluir admissionId

// Ejemplo: anamnesisService.ts
export const createAnamnesis = async (
  medicalRecordId: string,
  admissionId: string,
  data: CreateAnamnesisDto
) => {
  return api.post(`/medical-records/${medicalRecordId}/anamnesis`, {
    ...data,
    admissionId,
  });
};

// Ejemplo: physicalExamService.ts
export const createPhysicalExam = async (
  medicalRecordId: string,
  admissionId: string,
  data: CreatePhysicalExamDto
) => {
  return api.post(`/medical-records/${medicalRecordId}/physical-exams`, {
    ...data,
    admissionId,
  });
};
```

### 4. Vista de HC con Admisiones

```typescript
// Componente: ViewMedicalRecordPage.tsx

// Mostrar admisiones en tabs o acordeón
<div className="mb-6">
  <h3 className="text-lg font-bold mb-3">Admisiones</h3>
  
  {medicalRecord.admissions.map((admission) => (
    <div key={admission.id} className="mb-4 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-bold">{admission.admissionNumber}</h4>
          <p className="text-sm text-gray-600">
            {formatAdmissionType(admission.admissionType)} - {formatDate(admission.admissionDate)}
          </p>
          <p className="text-sm text-gray-600">{admission.reason}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          admission.status === 'active' ? 'bg-green-100 text-green-800' :
          admission.status === 'closed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {admission.status}
        </span>
      </div>

      {/* Mostrar registros de esta admisión */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Anamnesis:</strong> {admission.anamnesis.length}
        </div>
        <div>
          <strong>Exámenes:</strong> {admission.physicalExams.length}
        </div>
        <div>
          <strong>Diagnósticos:</strong> {admission.diagnoses.length}
        </div>
        <div>
          <strong>Evoluciones:</strong> {admission.evolutions.length}
        </div>
        <div>
          <strong>Consentimientos:</strong> {admission.consents.length}
        </div>
      </div>

      {admission.status === 'active' && (
        <button
          onClick={() => handleCloseAdmission(admission.id)}
          className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Cerrar Admisión
        </button>
      )}
    </div>
  ))}
</div>
```

---

## 🗄️ MIGRACIÓN DE DATOS

La migración SQL incluye:

1. **Creación de tabla `admissions`**
2. **Agregar columna `admission_id` a todas las tablas relacionadas**
3. **Migración automática de datos existentes**:
   - Crea una admisión inicial para cada HC existente
   - Vincula todos los registros existentes a esa admisión inicial
   - Número de admisión: `{recordNumber}-ADM-001`
   - Tipo: Copia el `admission_type` de la HC
   - Fecha: Copia el `admission_date` de la HC

4. **Hacer `admission_id` obligatorio (NOT NULL)** después de migrar

---

## ✅ PASOS PARA APLICAR

### Backend

1. **Ejecutar migración SQL**:
```bash
psql -h localhost -U postgres -d consentimientos_db -f backend/migrations/add-admissions-system.sql
```

2. **Verificar que las tablas fueron creadas**:
```sql
SELECT * FROM admissions LIMIT 5;
SELECT table_name, column_name FROM information_schema.columns WHERE column_name = 'admission_id';
```

3. **Reiniciar el backend**:
```bash
cd backend
npm run start:dev
```

4. **Verificar endpoints**:
```bash
# Listar admisiones de una HC
curl -X GET http://localhost:3000/admissions/medical-record/{hc-id} \
  -H "Authorization: Bearer {token}"

# Crear nueva admisión
curl -X POST http://localhost:3000/admissions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medicalRecordId": "hc-uuid",
    "admissionType": "control",
    "reason": "Control de seguimiento"
  }'
```

### Frontend

1. **Crear componente `AdmissionTypeModal.tsx`**
2. **Actualizar `CreateMedicalRecordPage.tsx`** para detectar HC existente
3. **Actualizar servicios** para incluir `admissionId`
4. **Actualizar `ViewMedicalRecordPage.tsx`** para mostrar admisiones
5. **Compilar y desplegar**:
```bash
cd frontend
npm run build
```

---

## 📊 BENEFICIOS

1. ✅ **Organización**: Cada consulta/visita tiene sus propios registros
2. ✅ **Historial Claro**: Fácil ver la evolución del paciente a través del tiempo
3. ✅ **Cumplimiento Normativo**: Mantiene la integridad de la HC única por paciente
4. ✅ **Flexibilidad**: Soporta diferentes tipos de admisión (urgencia, control, cirugía, etc.)
5. ✅ **Auditoría**: Cada admisión tiene su propio ciclo de vida (activa, cerrada, cancelada)
6. ✅ **Escalabilidad**: Permite agregar más tipos de admisión en el futuro

---

## 🔐 SEGURIDAD Y PERMISOS

Los permisos existentes de `medical_records.*` se aplican también a las admisiones:

- `medical_records.view`: Ver admisiones
- `medical_records.create`: Crear admisiones
- `medical_records.update`: Actualizar/cerrar admisiones
- `medical_records.delete`: Cancelar admisiones

---

## 📝 NOTAS IMPORTANTES

1. **Migración Automática**: Los datos existentes se migran automáticamente. Cada HC existente tendrá una admisión inicial.

2. **Compatibilidad**: Los campos `admission_type` y `admission_date` en la tabla `medical_records` se mantienen por compatibilidad, pero ahora se usan solo para la admisión inicial.

3. **Validación**: No se puede crear una nueva HC si el paciente ya tiene una HC activa. En su lugar, se debe crear una nueva admisión.

4. **Cierre de Admisiones**: Las admisiones se pueden cerrar independientemente de la HC. Una HC puede tener múltiples admisiones cerradas y una activa.

5. **Eliminación**: No se recomienda eliminar admisiones. En su lugar, usar el estado `cancelled`.

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Aplicar migración SQL en desarrollo
2. ✅ Probar endpoints de admisiones
3. ⏳ Implementar frontend (modal de selección de tipo de admisión)
4. ⏳ Actualizar servicios frontend para incluir `admissionId`
5. ⏳ Actualizar vistas para mostrar admisiones
6. ⏳ Probar flujo completo en desarrollo
7. ⏳ Aplicar en producción

---

## 📞 SOPORTE

Para cualquier duda o problema con la implementación, revisar:

- Migración SQL: `backend/migrations/add-admissions-system.sql`
- Servicio: `backend/src/medical-records/admissions.service.ts`
- Controlador: `backend/src/medical-records/admissions.controller.ts`
- Entidad: `backend/src/medical-records/entities/admission.entity.ts`

---

**Versión**: 39.0.0  
**Fecha**: 2026-02-18  
**Estado**: ✅ Backend Completado | ⏳ Frontend Pendiente
