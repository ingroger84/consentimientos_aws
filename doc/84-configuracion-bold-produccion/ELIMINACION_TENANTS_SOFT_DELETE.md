# Eliminación de Tenants con Soft Delete

## 📅 Fecha: 2026-03-31

---

## 🎯 Problema Reportado

Usuario reportó que en la verificación del sistema de facturación aparecían 8 tenants, pero en el Super Admin solo se veían 4 tenants. Esto indicaba que había tenants eliminados (soft delete) que aún estaban en la base de datos.

---

## 🔍 Diagnóstico

### Tenants Encontrados en Base de Datos:

**Total:** 10 tenants  
**Con deleted_at (eliminados):** 6 tenants  
**Sin deleted_at (activos):** 4 tenants

### Tenants Eliminados (Soft Delete):

| Nombre | Slug | Plan | Estado | Fecha de Eliminación |
|--------|------|------|--------|---------------------|
| Demo Spaa | demo-spaa | basic | trial | 2026-03-28 21:58:36 |
| Demo Spa | demo-spa | basic | trial | 2026-03-28 21:49:12 |
| Demo Demo | demo-demo | basic | trial | 2026-03-28 21:24:42 |
| Demo Salon | demo-salon | free | trial | 2026-03-28 21:24:35 |
| Test | testsanto | free | active | 2026-03-16 06:11:49 |
| Clínica Demo | clinica-demo | professional | active | 2026-01-21 05:38:04 |

### Tenants Activos (Visibles en Super Admin):

| Nombre | Slug | Plan | Estado |
|--------|------|------|--------|
| Aquiub Casa de Pestañas | aquiub | custom | active |
| Demo Estetica | demo-estetica | professional | active |
| Demo Medico | demo-medico | basic | active |
| hotelglampinglapolka | hotelglampinglapolka | basic | active |

---

## ✅ Solución Implementada

### Proceso de Eliminación:

**1. Identificar tenants con soft delete:**
```sql
SELECT id, name, slug, deleted_at 
FROM tenants 
WHERE deleted_at IS NOT NULL;
```

**2. Eliminar datos relacionados:**

**a) Plantillas de consentimiento de HC:**
```sql
DELETE FROM medical_record_consent_templates 
WHERE tenant_id IN (SELECT id FROM tenants WHERE deleted_at IS NOT NULL);
-- Resultado: 12 registros eliminados
```

**b) Clientes:**
```sql
DELETE FROM clients 
WHERE tenant_id IN (SELECT id FROM tenants WHERE deleted_at IS NOT NULL);
-- Resultado: 0 registros (ya estaban eliminados)
```

**3. Eliminar tenants permanentemente:**
```sql
DELETE FROM tenants 
WHERE deleted_at IS NOT NULL;
-- Resultado: 6 tenants eliminados
```

---

## 📊 Resultados

### Antes de la Eliminación:

| Estado | Cantidad |
|--------|----------|
| Total de tenants | 10 |
| Con deleted_at (eliminados) | 6 |
| Sin deleted_at (activos) | 4 |

### Después de la Eliminación:

| Estado | Cantidad |
|--------|----------|
| Total de tenants | 4 |
| Con deleted_at (eliminados) | 0 |
| Sin deleted_at (activos) | 4 |

### Datos Eliminados:

- ✅ 6 tenants eliminados permanentemente
- ✅ 12 plantillas de consentimiento de HC eliminadas
- ✅ 0 clientes (ya estaban eliminados)

---

## 🔄 Comparación Antes vs Después

### Antes:
```
Base de Datos: 10 tenants (6 eliminados + 4 activos)
Super Admin: 4 tenants (solo activos)
Discrepancia: ❌ Sí (6 tenants fantasma)
```

### Después:
```
Base de Datos: 4 tenants (0 eliminados + 4 activos)
Super Admin: 4 tenants (solo activos)
Discrepancia: ✅ No (coinciden perfectamente)
```

---

## 📋 Tenants Finales en el Sistema

| Nombre | Slug | Plan | Estado | Día de Facturación |
|--------|------|------|--------|-------------------|
| Aquiub Casa de Pestañas | aquiub | custom | active | 18 |
| Demo Estetica | demo-estetica | professional | active | 21 |
| Demo Medico | demo-medico | basic | active | 23 |
| hotelglampinglapolka | hotelglampinglapolka | basic | active | 1 |

---

## 🎯 Próximas Facturaciones (Abril 2026)

Con solo 4 tenants activos, las próximas facturaciones serán:

| Fecha | Tenant | Plan | Monto Estimado |
|-------|--------|------|----------------|
| **1 de abril** | hotelglampinglapolka | basic | $89,900 |
| **18 de abril** | Aquiub Casa de Pestañas | custom | Variable |
| **21 de abril** | Demo Estetica | professional | $119,900 |
| **23 de abril** | Demo Medico | basic | $89,900 |

**Total:** 4 facturas en abril

---

## 📝 Scripts Creados

### 1. `backend/check-all-tenants.sql`
Verifica todos los tenants incluyendo los eliminados.

```sql
SELECT 
  id,
  name,
  slug,
  plan,
  status,
  deleted_at
FROM tenants
ORDER BY created_at DESC;
```

### 2. `backend/delete-soft-deleted-tenants-complete.sql`
Elimina permanentemente los tenants con soft delete.

```sql
-- Eliminar plantillas de consentimiento de HC
DELETE FROM medical_record_consent_templates 
WHERE tenant_id IN (SELECT id FROM tenants WHERE deleted_at IS NOT NULL);

-- Eliminar clientes
DELETE FROM clients 
WHERE tenant_id IN (SELECT id FROM tenants WHERE deleted_at IS NOT NULL);

-- Eliminar tenants
DELETE FROM tenants 
WHERE deleted_at IS NOT NULL;
```

---

## ✅ Verificación

### 1. Verificar Tenants en Base de Datos

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) FROM tenants;"
```

**Resultado esperado:** 4

### 2. Verificar Tenants con Soft Delete

```bash
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) FROM tenants WHERE deleted_at IS NOT NULL;"
```

**Resultado esperado:** 0

### 3. Verificar en Super Admin

```
1. Login como Super Admin
2. Ir a: Administración → Tenants
3. Verificar:
   ✅ Total de tenants: 4
   ✅ Aquiub Casa de Pestañas
   ✅ Demo Estetica
   ✅ Demo Medico
   ✅ hotelglampinglapolka
```

---

## 🚨 Importante

### ⚠️ Soft Delete vs Hard Delete

**Soft Delete:**
- Marca el registro con `deleted_at`
- El registro permanece en la base de datos
- No es visible en la aplicación
- Puede ser restaurado

**Hard Delete (Eliminación Permanente):**
- Elimina el registro completamente de la base de datos
- No puede ser restaurado
- Libera espacio en la base de datos
- Elimina todas las referencias

### ⚠️ Datos Eliminados Permanentemente

Los siguientes tenants fueron eliminados permanentemente y **NO pueden ser restaurados**:

1. Demo Spaa
2. Demo Spa
3. Demo Demo
4. Demo Salon
5. Test
6. Clínica Demo

---

## 📊 Impacto en el Sistema

### Tablas Afectadas:

| Tabla | Registros Eliminados |
|-------|---------------------|
| tenants | 6 |
| medical_record_consent_templates | 12 |
| clients | 0 (ya eliminados) |

### Tablas NO Afectadas:

- ✅ users (usuarios de tenants activos conservados)
- ✅ consents (consentimientos de tenants activos conservados)
- ✅ medical_records (historias clínicas de tenants activos conservadas)
- ✅ invoices (facturas de tenants activos conservadas)

---

## ✅ Conclusión

La base de datos ahora está completamente limpia y sincronizada con el Super Admin:

1. ✅ 4 tenants activos en base de datos
2. ✅ 4 tenants visibles en Super Admin
3. ✅ 0 tenants con soft delete
4. ✅ Coincidencia perfecta entre BD y UI

El sistema de facturación ahora solo generará facturas para los 4 tenants activos reales.

---

**🎊 ¡Tenants Eliminados Permanentemente! 🎊**

**Tenants eliminados:** 6  
**Tenants activos:** 4  
**Fecha:** 2026-03-31  
**Estado:** ✅ BASE DE DATOS SINCRONIZADA CON SUPER ADMIN
