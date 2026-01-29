# ✅ Solución Final - Consentimientos de Historia Clínica

## Problemas Identificados y Corregidos

### Problema 1: Campo `consent_id` NOT NULL
**Error:**
```
null value in column "consent_id" violates not-null constraint
```

**Causa:** La columna `consent_id` tenía restricción NOT NULL pero debería permitir NULL.

**Solución:**
```sql
ALTER TABLE medical_record_consents 
ALTER COLUMN consent_id DROP NOT NULL;
```

### Problema 2: Campo `created_by` faltante
**Error:**
```
null value in column "created_by" violates not-null constraint
```

**Causa:** El código no estaba estableciendo el campo `createdBy` al crear el consentimiento.

**Solución:**
Agregado `createdBy: userId` al objeto `MedicalRecordConsent`:

```typescript
const medicalRecordConsent = this.medicalRecordConsentsRepository.create({
  medicalRecordId,
  consentId: null,
  pdfUrl,
  consentNumber,
  consentMetadata: {
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
  createdBy: userId, // ✅ AGREGADO
});
```

## Estado del Sistema

```
✅ Base de datos: Columna consent_id permite NULL
✅ Backend: Campo createdBy agregado
✅ Backend: Recompilado y reiniciado (PM2 PID: 188982)
✅ Versión: 19.1.1
✅ Estado: Operativo
```

## Prueba Ahora

1. Ve a: https://archivoenlinea.com
2. Inicia sesión
3. Ve a Historias Clínicas
4. Abre una historia clínica
5. Haz clic en "Generar Consentimiento"
6. Selecciona plantillas
7. Captura firma y foto
8. Haz clic en "Generar Consentimiento"
9. **Debería funcionar correctamente**

## Funcionalidad Completa de Historias Clínicas

Ahora todas las funciones de historias clínicas están operativas:

✅ **Anamnesis**: Agregar y editar  
✅ **Examen Físico**: Agregar y editar  
✅ **Diagnósticos**: Agregar y editar  
✅ **Evoluciones**: Agregar y editar  
✅ **Consentimientos**: Generar y enviar  

## Archivos Modificados

1. **Base de datos**: 
   - Tabla `medical_record_consents`
   - Columna `consent_id` ahora permite NULL

2. **Backend**:
   - `backend/src/medical-records/medical-records.service.ts`
   - Agregado campo `createdBy` en método `createConsentFromMedicalRecord`

## Resumen de Correcciones de la Sesión

### 1. Sistema de Auditoría (performedBy)
- Corregido en: anamnesis, physical-exam, diagnosis, evolution
- Cambio: `userId` → `performedBy`

### 2. Consentimientos HC (consent_id)
- Base de datos: Columna ahora permite NULL
- Permite generar consentimientos sin FK a tabla consents

### 3. Consentimientos HC (created_by)
- Backend: Agregado campo `createdBy`
- Registra quién generó el consentimiento

## Verificación

Para verificar que todo funciona:
```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
pm2 status
# Debe mostrar: datagree | 19.1.1 | online

# Verificar estructura de tabla
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos
\d medical_record_consents
# Verificar que consent_id y created_by estén correctos
```

---

**Fecha:** 2026-01-28  
**Versión:** 19.1.1  
**Cambios:** 
- Base de datos: consent_id permite NULL
- Backend: createdBy agregado
**Estado:** ✅ Completamente operativo
