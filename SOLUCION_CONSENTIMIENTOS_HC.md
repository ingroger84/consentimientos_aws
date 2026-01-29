# ✅ Solución - Error al Enviar Consentimientos de Historia Clínica

## Problema Identificado

Al intentar enviar un consentimiento desde una historia clínica, aparecía el error:

```
null value in column "consent_id" of relation "medical_record_consents" violates not-null constraint
```

## Causa Raíz

Había una inconsistencia entre la entidad TypeORM y la estructura de la base de datos:

- **Entidad TypeORM**: `consentId` definido como `nullable: true`
- **Base de Datos**: Columna `consent_id` con restricción `NOT NULL`

Cuando se crea un consentimiento desde una historia clínica, el campo `consentId` puede ser `null` (porque el consentimiento se genera directamente desde la HC, no desde un consentimiento existente), pero la base de datos rechazaba el valor `null`.

## Solución Aplicada

Se modificó la estructura de la tabla en la base de datos para permitir valores `NULL` en la columna `consent_id`:

```sql
ALTER TABLE medical_record_consents 
ALTER COLUMN consent_id DROP NOT NULL;
```

### Antes:
```
consent_id | uuid | | not null |
```

### Después:
```
consent_id | uuid | | |
```

## Por Qué Este Campo Puede Ser NULL

El campo `consent_id` puede ser `null` en dos escenarios:

1. **Consentimiento generado desde HC**: Cuando se genera un PDF de consentimiento directamente desde la historia clínica, no hay un registro previo en la tabla `consents`, por lo que `consent_id` es `null`.

2. **Consentimiento vinculado**: Cuando se vincula un consentimiento existente (de la tabla `consents`) a una historia clínica, entonces `consent_id` tiene un valor.

## Campos Relacionados

Cuando `consent_id` es `null`, se usan estos campos para almacenar la información:
- `pdfUrl`: URL del PDF generado
- `consentNumber`: Número único del consentimiento
- `consentMetadata`: Metadata con IDs de plantillas, nombres, etc.

## Estado del Sistema

```
✅ Base de datos: Columna consent_id ahora permite NULL
✅ Backend: Sin cambios necesarios (ya estaba correcto)
✅ Estado: Operativo
```

## Prueba Ahora

1. Ve a: https://archivoenlinea.com
2. Inicia sesión
3. Ve a Historias Clínicas
4. Abre una historia clínica
5. Genera un consentimiento
6. **Debería funcionar sin errores**

## Verificación

Para verificar que el cambio está activo:
```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos
\d medical_record_consents
# Verificar que consent_id no tenga "not null"
```

## Archivos Relacionados

- `backend/src/medical-records/entities/medical-record-consent.entity.ts` (ya estaba correcto)
- `backend/src/medical-records/medical-records.service.ts` (método createConsentFromMedicalRecord)

## Nota Técnica

Este tipo de inconsistencia puede ocurrir cuando:
1. Se crea una migración que agrega una restricción NOT NULL
2. Pero la entidad TypeORM no se actualiza para reflejar el cambio
3. O viceversa: la entidad se actualiza pero no se crea la migración correspondiente

En este caso, la entidad estaba correcta (nullable: true) pero la base de datos tenía una restricción NOT NULL que no debería estar ahí.

---

**Fecha:** 2026-01-28  
**Versión:** 19.1.1  
**Cambio:** Columna consent_id ahora permite NULL  
**Estado:** ✅ Aplicado y operativo
