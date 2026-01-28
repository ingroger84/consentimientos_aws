# Fix: consent_id Nullable en medical_record_consents

## 🐛 Problema

Al intentar generar un consentimiento desde una historia clínica, se producía el siguiente error:

```
QueryFailedError: insert or update on table "medical_record_consents" 
violates foreign key constraint "FK_04937619fdbfd9c97b1b1a5946e"

Detail: Key (consent_id)=(a356ca89-a289-4dd1-8f0f-49200ce2f65a) 
is not present in table "consents".
```

### Causa Raíz

El sistema estaba intentando crear un registro en `medical_record_consents` con un `consent_id` que no existía en la tabla `consents`. Esto ocurría porque:

1. El flujo de generación de consentimientos desde HC genera PDFs directamente
2. No se crea un registro completo en la tabla `consents`
3. Se genera un UUID temporal solo para referencia
4. La columna `consent_id` en `medical_record_consents` NO era nullable
5. La restricción de clave foránea requería que el ID existiera en `consents`

## ✅ Solución Implementada

### 1. Modificación de la Entidad

**Archivo**: `backend/src/medical-records/entities/medical-record-consent.entity.ts`

Cambios realizados:
- Columna `consent_id` ahora es nullable
- Relación con `Consent` ahora es nullable

```typescript
// Antes
@Column({ name: 'consent_id' })
consentId: string;

@ManyToOne(() => Consent)
@JoinColumn({ name: 'consent_id' })
consent: Consent;

// Después
@Column({ name: 'consent_id', nullable: true })
consentId: string;

@ManyToOne(() => Consent, { nullable: true })
@JoinColumn({ name: 'consent_id' })
consent: Consent;
```

### 2. Migración de Base de Datos

**Archivo**: `backend/fix-medical-record-consents-nullable.sql`

Cambios aplicados:
1. Eliminar restricción de clave foránea existente
2. Hacer la columna `consent_id` nullable
3. Recrear restricción con `ON DELETE SET NULL`

```sql
-- Eliminar restricción existente
ALTER TABLE medical_record_consents 
DROP CONSTRAINT IF EXISTS "FK_04937619fdbfd9c97b1b1a5946e";

-- Hacer columna nullable
ALTER TABLE medical_record_consents 
ALTER COLUMN consent_id DROP NOT NULL;

-- Recrear restricción con ON DELETE SET NULL
ALTER TABLE medical_record_consents 
ADD CONSTRAINT "FK_04937619fdbfd9c97b1b1a5946e" 
FOREIGN KEY (consent_id) 
REFERENCES consents(id) 
ON DELETE SET NULL;
```

### 3. Scripts de Aplicación

Se crearon varios scripts para facilitar la aplicación de la migración:

#### Script Node.js (Recomendado)
**Archivo**: `backend/apply-consent-nullable-fix.js`
- Conecta a la base de datos usando credenciales del .env
- Ejecuta la migración SQL
- Maneja errores apropiadamente

**Uso**:
```bash
cd backend
node apply-consent-nullable-fix.js
```

#### Script de Verificación
**Archivo**: `backend/verify-consent-nullable.js`
- Verifica que la columna sea nullable
- Muestra información de restricciones de clave foránea

**Uso**:
```bash
cd backend
node verify-consent-nullable.js
```

## 📊 Resultado

### Antes
```
Column: consent_id
Nullable: NO
Foreign Key: FK_04937619fdbfd9c97b1b1a5946e
Delete Rule: NO ACTION
```

### Después
```
Column: consent_id
Nullable: YES
Foreign Key: FK_04937619fdbfd9c97b1b1a5946e
Delete Rule: SET NULL
```

## 🎯 Impacto

### Funcionalidad Restaurada
✅ Generación de consentimientos desde historias clínicas funciona correctamente
✅ PDFs se generan sin errores
✅ Registros se crean en `medical_record_consents` exitosamente

### Casos de Uso Soportados

1. **Consentimiento con PDF Directo** (Nuevo flujo)
   - Se genera PDF directamente desde plantillas
   - Se crea registro en `medical_record_consents` con `consent_id = null`
   - PDF se sube a S3
   - No se requiere registro en tabla `consents`

2. **Consentimiento Tradicional** (Flujo existente)
   - Se crea registro completo en tabla `consents`
   - Se vincula a historia clínica con `consent_id` válido
   - Ambos flujos coexisten sin conflictos

## 🔍 Verificación

### Verificar Cambio en Base de Datos

```sql
-- Verificar que la columna es nullable
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'medical_record_consents' 
AND column_name = 'consent_id';

-- Resultado esperado:
-- column_name | is_nullable | data_type
-- consent_id  | YES         | uuid
```

### Verificar Restricción de Clave Foránea

```sql
-- Verificar la restricción FK
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'medical_record_consents'
AND kcu.column_name = 'consent_id';

-- Resultado esperado:
-- constraint_name                  | column_name | foreign_table_name | delete_rule
-- FK_04937619fdbfd9c97b1b1a5946e  | consent_id  | consents           | SET NULL
```

### Probar Generación de Consentimiento

1. Iniciar sesión en el sistema
2. Ir a Historias Clínicas
3. Abrir una historia clínica existente
4. Hacer clic en "Generar Consentimiento"
5. Seleccionar una o más plantillas
6. Hacer clic en "Generar Consentimiento"
7. Verificar que:
   - ✅ No aparece error
   - ✅ Se muestra mensaje de éxito
   - ✅ PDF se abre en nueva pestaña
   - ✅ Registro se crea en base de datos

## 📝 Archivos Modificados

### Código
- `backend/src/medical-records/entities/medical-record-consent.entity.ts`

### Scripts de Migración
- `backend/fix-medical-record-consents-nullable.sql`
- `backend/apply-consent-nullable-fix.js`
- `backend/verify-consent-nullable.js`
- `backend/update-fk-delete-rule.sql`
- `backend/apply-fk-update.js`
- `backend/apply-consent-nullable-fix.ps1` (PowerShell, alternativo)

### Documentación
- `doc/63-fix-consent-id-nullable/README.md` (este archivo)

## 🚀 Despliegue

### Pasos para Aplicar en Producción

1. **Backup de Base de Datos**
   ```bash
   pg_dump -h localhost -U admin -d consentimientos > backup_before_fix.sql
   ```

2. **Aplicar Migración**
   ```bash
   cd backend
   node apply-consent-nullable-fix.js
   ```

3. **Verificar Cambios**
   ```bash
   node verify-consent-nullable.js
   ```

4. **Actualizar Código**
   - Hacer pull del código actualizado
   - Reiniciar backend

5. **Probar Funcionalidad**
   - Generar consentimiento desde HC
   - Verificar que funciona correctamente

## ⚠️ Consideraciones

### Datos Existentes
- Los registros existentes en `medical_record_consents` NO se ven afectados
- Solo los nuevos registros pueden tener `consent_id = null`
- Los registros con `consent_id` válido siguen funcionando normalmente

### Integridad Referencial
- La restricción `ON DELETE SET NULL` asegura que si se elimina un consentimiento de la tabla `consents`, el campo `consent_id` en `medical_record_consents` se establece en NULL automáticamente
- Esto previene errores de integridad referencial

### Compatibilidad
- El cambio es retrocompatible
- No afecta funcionalidad existente
- Permite nuevos flujos de trabajo

## 🎓 Lecciones Aprendidas

1. **Diseño de Base de Datos**: Considerar flujos alternativos al diseñar restricciones
2. **Nullable vs Not Null**: Evaluar si una columna realmente debe ser obligatoria
3. **Claves Foráneas**: Usar `ON DELETE SET NULL` cuando sea apropiado
4. **Migraciones**: Crear scripts automatizados para facilitar despliegue
5. **Verificación**: Siempre incluir scripts de verificación

## 📚 Referencias

- [TypeORM Relations](https://typeorm.io/relations)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [SQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

---

**Versión**: 15.0.10
**Fecha**: 2026-01-25
**Estado**: ✅ Completado y Verificado
