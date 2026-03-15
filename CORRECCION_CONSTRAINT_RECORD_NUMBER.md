# ✅ CORRECCIÓN: Constraint Único de record_number

**Fecha:** 2026-03-15  
**Versión:** 41.1.4  
**Estado:** ✅ CORREGIDO

---

## 🐛 PROBLEMA IDENTIFICADO

### Síntoma
Al intentar crear historias clínicas en tenants (ej: demo-medico.archivoenlinea.com), el sistema mostraba múltiples errores "Internal server error" y no permitía crear HC con ningún tipo de admisión.

### Error en Logs
```
QueryFailedError: duplicate key value violates unique constraint "UQ_1dc1a9b704ff46bcaf4bf512039"
Key (record_number)=(HC-2026-000001) already exists.
```

### Causa Raíz
El constraint único de `record_number` en la tabla `medical_records` era GLOBAL, no por tenant. Esto significa que:
- ❌ Solo podía existir UN `HC-2026-000001` en TODA la base de datos
- ❌ Si "Demo Estetica" tenía `HC-2026-000001`, "Demo Medico" NO podía usar ese número
- ❌ Cada tenant debería poder tener su propia secuencia de números

---

## 🔧 SOLUCIÓN IMPLEMENTADA

### Cambio Realizado
Modificado el constraint único de:
```sql
-- ANTES (Incorrecto)
UNIQUE (record_number)  -- Global para todos los tenants
```

A:
```sql
-- AHORA (Correcto)
UNIQUE (tenant_id, record_number)  -- Único por tenant
```

### Script de Migración
**Archivo:** `backend/migrations/fix-record-number-unique-constraint.sql`

**Acciones:**
1. ✅ Eliminado constraint global `medical_records_record_number_key`
2. ✅ Eliminado constraint antiguo `UQ_1dc1a9b704ff46bcaf4bf512039`
3. ✅ Creado nuevo constraint `uq_medical_records_tenant_record_number`
4. ✅ Verificado que el constraint fue creado correctamente

---

## 📊 ESTADO ANTES Y DESPUÉS

### Antes de la Corrección
```
Constraint: medical_records_record_number_key
Definición: UNIQUE (record_number)
Problema: Global para todos los tenants

Tenants con HC:
- Demo Estetica: HC-2026-000004, HC-2026-001, HC-2026-002
- Demo Medico: ❌ No puede crear HC-2026-000001 (ya existe)
- Clínica Demo: ❌ No puede crear HC-2026-000001 (ya existe)
```

### Después de la Corrección
```
Constraint: uq_medical_records_tenant_record_number
Definición: UNIQUE (tenant_id, record_number)
Solución: Único por tenant

Tenants con HC:
- Demo Estetica: HC-2026-000004, HC-2026-001, HC-2026-002
- Demo Medico: ✅ Puede crear HC-2026-000001 (independiente)
- Clínica Demo: ✅ Puede crear HC-2026-000001 (independiente)
```

---

## 🧪 VERIFICACIÓN

### Comando de Diagnóstico
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node diagnose-record-numbers.js
```

### Resultado Esperado
```
✅ Conectado a PostgreSQL

=== HISTORIAS CLÍNICAS 2026 ===
Total de HC 2026: 3

HC-2026-000004 | Tenant: Demo Estetica
HC-2026-001 | Tenant: Demo Estetica
HC-2026-002 | Tenant: Demo Estetica

=== NÚMEROS DUPLICADOS ===
✅ No hay números duplicados

=== ÚLTIMO NÚMERO POR TENANT ===
Demo Estetica: HC-2026-002 (Total: 3)
Demo Medico: Sin HC (Total: 0)
Clínica Demo: Sin HC (Total: 0)
```

---

## 🎯 PRUEBAS RECOMENDADAS

### 1. Crear HC en Demo Medico
1. Ir a https://demo-medico.archivoenlinea.com
2. Iniciar sesión
3. Ir a "Historias Clínicas" → "Nueva Historia Clínica"
4. Llenar datos del cliente
5. Seleccionar tipo de admisión (ej: Telemedicina)
6. Guardar

**Resultado esperado:**
- ✅ HC se crea correctamente
- ✅ Número asignado: HC-2026-000001
- ✅ Sin errores "Internal server error"

### 2. Crear HC en Clínica Demo
1. Ir a https://demo-clinica.archivoenlinea.com (o el subdominio correcto)
2. Repetir el proceso
3. Verificar que también puede crear HC-2026-000001

**Resultado esperado:**
- ✅ HC se crea correctamente
- ✅ Número asignado: HC-2026-000001 (independiente de Demo Medico)

### 3. Verificar Aislamiento
1. Desde Demo Medico, verificar que SOLO ve sus propias HC
2. Desde Demo Estetica, verificar que SOLO ve sus propias HC
3. Desde Super Admin, verificar que ve HC de TODOS los tenants

---

## 📝 ARCHIVOS MODIFICADOS

### Migración SQL
- `backend/migrations/fix-record-number-unique-constraint.sql`

### Script de Diagnóstico
- `backend/diagnose-record-numbers.js`

### Documentación
- `CORRECCION_CONSTRAINT_RECORD_NUMBER.md` (este archivo)

---

## 🔍 DETALLES TÉCNICOS

### Constraint Anterior
```sql
-- Constraint global (incorrecto)
ALTER TABLE medical_records 
ADD CONSTRAINT medical_records_record_number_key 
UNIQUE (record_number);
```

### Constraint Nuevo
```sql
-- Constraint por tenant (correcto)
ALTER TABLE medical_records 
ADD CONSTRAINT uq_medical_records_tenant_record_number 
UNIQUE (tenant_id, record_number);
```

### Ventajas del Nuevo Constraint
1. ✅ Cada tenant tiene su propia secuencia de números
2. ✅ No hay conflictos entre tenants
3. ✅ Más escalable para multi-tenancy
4. ✅ Alineado con el diseño de aislamiento de datos

---

## ⚠️ NOTAS IMPORTANTES

### Datos Existentes
- Los datos existentes NO fueron afectados
- Las HC de "Demo Estetica" siguen funcionando normalmente
- No se perdió ninguna información

### Generación de Números
El código de generación de números (`generateRecordNumber`) ya estaba correcto:
```typescript
// Ya filtraba por tenantId correctamente
.where('mr.tenantId = :tenantId', { tenantId })
```

El problema era solo el constraint de la base de datos.

### Compatibilidad
- ✅ Compatible con versión actual (41.1.2)
- ✅ No requiere cambios en el código
- ✅ No requiere reinicio de PM2
- ✅ Cambio aplicado en caliente

---

## 🚀 DESPLIEGUE

### Comandos Ejecutados
```bash
# 1. Subir script de migración
scp -i AWS-ISSABEL.pem backend/migrations/fix-record-number-unique-constraint.sql \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/migrations/

# 2. Ejecutar migración
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend/migrations
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos \
  -f fix-record-number-unique-constraint.sql

# 3. Verificar resultado
cd /home/ubuntu/consentimientos_aws/backend
node diagnose-record-numbers.js
```

### Resultado del Despliegue
```
BEGIN
ALTER TABLE
ALTER TABLE
ALTER TABLE
DO
NOTICE: ✅ Constraint único por tenant creado correctamente
COMMIT
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [x] Constraint global eliminado
- [x] Nuevo constraint por tenant creado
- [x] Migración ejecutada sin errores
- [x] Datos existentes preservados
- [x] Script de diagnóstico ejecutado
- [ ] Prueba de creación de HC en Demo Medico (pendiente usuario)
- [ ] Prueba de creación de HC en Clínica Demo (pendiente usuario)
- [ ] Verificación de aislamiento de datos (pendiente usuario)

---

## 📞 SOPORTE

Si encuentras problemas:
1. Verificar logs de PM2: `pm2 logs datagree`
2. Ejecutar script de diagnóstico: `node diagnose-record-numbers.js`
3. Verificar constraint: `\d medical_records` en psql
4. Reportar con logs completos

---

**Última actualización:** 2026-03-15  
**Versión:** 41.1.4  
**Estado:** ✅ CORREGIDO Y LISTO PARA PRUEBAS

