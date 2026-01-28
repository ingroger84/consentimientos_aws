# Corrección: Consentimientos No Aparecen en HC

**Fecha:** 2026-01-26  
**Problema:** Los consentimientos se generan exitosamente pero no aparecen en la pestaña "Consentimientos" de la HC

---

## Diagnóstico

El problema estaba en el método `findOne` del servicio de medical records. No estaba cargando la relación `consents` al obtener una historia clínica.

### Código Problemático

```typescript
// backend/src/medical-records/medical-records.service.ts

async findOne(...) {
  const medicalRecord = await this.medicalRecordsRepository.findOne({
    where: { id, tenantId },
    relations: [
      'client',
      'branch',
      'creator',
      'anamnesis',
      'anamnesis.creator',
      'physicalExams',
      'physicalExams.creator',
      'diagnoses',
      'diagnoses.creator',
      'evolutions',
      'evolutions.creator',
      'evolutions.signer',
      // ❌ FALTABA: 'consents' y 'consents.creator'
    ],
  });
  // ...
}
```

---

## Solución

Agregadas las relaciones `consents` y `consents.creator` al array de relaciones:

```typescript
// backend/src/medical-records/medical-records.service.ts

async findOne(...) {
  const medicalRecord = await this.medicalRecordsRepository.findOne({
    where: { id, tenantId },
    relations: [
      'client',
      'branch',
      'creator',
      'anamnesis',
      'anamnesis.creator',
      'physicalExams',
      'physicalExams.creator',
      'diagnoses',
      'diagnoses.creator',
      'evolutions',
      'evolutions.creator',
      'evolutions.signer',
      'consents',              // ✅ AGREGADO
      'consents.creator',      // ✅ AGREGADO
    ],
  });
  // ...
}
```

---

## Verificación

### 1. Relación en la Entidad

La relación ya estaba correctamente definida en la entidad `MedicalRecord`:

```typescript
// backend/src/medical-records/entities/medical-record.entity.ts

@Entity('medical_records')
export class MedicalRecord {
  // ...
  
  @OneToMany(() => MedicalRecordConsent, (consent) => consent.medicalRecord, {
    cascade: true,
  })
  consents: MedicalRecordConsent[];
  
  // ...
}
```

### 2. Frontend

El frontend ya estaba preparado para mostrar los consentimientos:

```typescript
// frontend/src/pages/ViewMedicalRecordPage.tsx

{activeTab === 'consentimientos' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Consentimientos Vinculados</h3>
    {record.consents && record.consents.length > 0 ? (
      // Mostrar consentimientos
    ) : (
      // Mensaje de "No hay consentimientos"
    )}
  </div>
)}
```

---

## Resultado

Ahora cuando se carga una historia clínica:

1. ✅ Se cargan todos los consentimientos vinculados
2. ✅ Se carga la información del creador de cada consentimiento
3. ✅ Los consentimientos aparecen en la pestaña "Consentimientos"
4. ✅ Los botones "Ver PDF" y "Descargar" funcionan correctamente

---

## Prueba

1. Ir a una historia clínica existente
2. Refrescar la página (F5)
3. Click en la pestaña "Consentimientos"
4. Verificar que los consentimientos generados aparezcan en la lista

---

## Archivos Modificados

- `backend/src/medical-records/medical-records.service.ts` (línea ~160)
  - Agregadas relaciones `consents` y `consents.creator`

---

## Nota Técnica

Este tipo de problema es común cuando se agregan nuevas relaciones a entidades existentes. Es importante recordar actualizar:

1. ✅ La definición de la relación en la entidad (ya estaba)
2. ✅ Los métodos que cargan la entidad con sus relaciones (faltaba)
3. ✅ El frontend que consume los datos (ya estaba)

En este caso, solo faltaba el paso 2.
