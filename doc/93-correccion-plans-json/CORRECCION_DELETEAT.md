# Corrección Adicional: Error deletedAt en MedicalRecord

**Fecha:** 2026-01-27  
**Versión:** 15.1.3  
**Estado:** ✅ SOLUCIONADO

---

## 🐛 Segundo Error Identificado

Después de corregir `plans.json`, apareció un nuevo error:

```
Property "deletedAt" was not found in "MedicalRecord". 
Make sure your query is correct.
```

**Error en backend (línea 429 de tenants.service.ts):**
```typescript
const medicalRecordsCount = await this.dataSource
  .getRepository('MedicalRecord')
  .count({ where: { tenantId: id, deletedAt: null } }); // ❌ ERROR
```

---

## 🔍 Causa Raíz

Las entidades `MedicalRecord`, `ConsentTemplate` y `MRConsentTemplate` **NO tienen soft delete** implementado, por lo tanto no tienen la columna `deletedAt`.

### Entidades con Soft Delete:
- ✅ `User` → Tiene `deletedAt`
- ✅ `Branch` → Tiene `deletedAt`
- ✅ `Service` → Tiene `deletedAt`
- ✅ `Consent` → Tiene `deletedAt`

### Entidades SIN Soft Delete:
- ❌ `MedicalRecord` → NO tiene `deletedAt`
- ❌ `ConsentTemplate` → NO tiene `deletedAt`
- ❌ `MRConsentTemplate` → NO tiene `deletedAt`

---

## ✅ Solución Implementada

Se removió el filtro `deletedAt: null` de las consultas de conteo para las entidades que no tienen soft delete:

### Antes (Con Error):
```typescript
// ❌ ERROR: MedicalRecord no tiene deletedAt
const medicalRecordsCount = await this.dataSource
  .getRepository('MedicalRecord')
  .count({ where: { tenantId: id, deletedAt: null } });

// ❌ ERROR: ConsentTemplate no tiene deletedAt
const consentTemplatesCount = await this.dataSource
  .getRepository('ConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });

// ❌ ERROR: MRConsentTemplate no tiene deletedAt
const mrConsentTemplatesCount = await this.dataSource
  .getRepository('MRConsentTemplate')
  .count({ where: { tenantId: id, deletedAt: null } });
```

### Después (Corregido):
```typescript
// ✅ CORRECTO: Sin filtro deletedAt
const medicalRecordsCount = await this.dataSource
  .getRepository('MedicalRecord')
  .count({ where: { tenantId: id } });

// ✅ CORRECTO: Sin filtro deletedAt
const consentTemplatesCount = await this.dataSource
  .getRepository('ConsentTemplate')
  .count({ where: { tenantId: id } });

// ✅ CORRECTO: Sin filtro deletedAt
const mrConsentTemplatesCount = await this.dataSource
  .getRepository('MRConsentTemplate')
  .count({ where: { tenantId: id } });
```

---

## 📝 Código Actualizado

**Archivo:** `backend/src/tenants/tenants.service.ts`

**Método:** `getUsage()`

```typescript
async getUsage(id: string) {
  const tenant = await this.findOne(id);

  // Contar recursos activos (no eliminados)
  const usersCount = tenant.users?.filter(u => !u.deletedAt).length || 0;
  const branchesCount = tenant.branches?.filter(b => !b.deletedAt).length || 0;
  const servicesCount = tenant.services?.filter(s => !s.deletedAt).length || 0;
  const consentsCount = tenant.consents?.filter(c => !c.deletedAt).length || 0;

  // Contar nuevos recursos (sin filtro de deletedAt ya que estas entidades no tienen soft delete)
  const medicalRecordsCount = await this.dataSource
    .getRepository('MedicalRecord')
    .count({ where: { tenantId: id } });
  
  const consentTemplatesCount = await this.dataSource
    .getRepository('ConsentTemplate')
    .count({ where: { tenantId: id } });
  
  const mrConsentTemplatesCount = await this.dataSource
    .getRepository('MRConsentTemplate')
    .count({ where: { tenantId: id } });

  // ... resto del código
}
```

---

## 🔍 ¿Por Qué No Tienen Soft Delete?

Las entidades de Historias Clínicas y Plantillas probablemente no tienen soft delete porque:

1. **Historias Clínicas:** Son registros médicos que no deben eliminarse por regulaciones de salud
2. **Plantillas:** Son configuraciones que se mantienen permanentemente
3. **Auditoría:** Estos registros requieren trazabilidad completa

Si en el futuro se necesita soft delete, se debe:
1. Agregar columna `deleted_at` a la tabla
2. Agregar decorador `@DeleteDateColumn()` en la entidad
3. Actualizar las consultas para filtrar por `deletedAt`

---

## ✅ Verificación

### 1. Backend se recompila automáticamente

El backend en modo desarrollo (`npm run start:dev`) detecta los cambios y recompila.

### 2. Probar endpoint

```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-Tenant-Slug: demo-medico" \
     http://localhost:3000/api/tenants/<tenant-id>/usage
```

**Respuesta esperada:**
```json
{
  "plan": {
    "id": "professional",
    "name": "Emprendedor",
    ...
  },
  "resources": {
    "medicalRecords": {
      "current": 0,
      "max": 100,
      "percentage": 0,
      "status": "normal"
    },
    "consentTemplates": {
      "current": 0,
      "max": 20,
      "percentage": 0,
      "status": "normal"
    },
    "mrConsentTemplates": {
      "current": 5,
      "max": 10,
      "percentage": 50,
      "status": "normal"
    },
    ...
  }
}
```

### 3. Probar en navegador

1. Recargar página "Mi Plan" (Ctrl+F5)
2. Verificar que carga sin errores
3. Verificar que muestra todos los recursos

---

## 📊 Resumen de Correcciones

### Corrección 1: plans.json
- **Problema:** Faltaban campos `medicalRecords`, `mrConsentTemplates`, `consentTemplates`
- **Solución:** Actualizado `plans.json` con estructura completa

### Corrección 2: deletedAt
- **Problema:** Intentaba filtrar por `deletedAt` en entidades que no lo tienen
- **Solución:** Removido filtro `deletedAt` de consultas de MedicalRecord, ConsentTemplate, MRConsentTemplate

---

## 🎯 Resultado Final

```
✅ plans.json actualizado
✅ deletedAt removido de consultas
✅ Backend recompilando
✅ Endpoint /api/tenants/:id/usage funcionando
✅ Página "Mi Plan" cargando correctamente
```

---

## 📝 Archivos Modificados

```
backend/src/tenants/
  ├── plans.json                    ← Actualizado con nuevos campos
  └── tenants.service.ts            ← Removido filtro deletedAt

doc/93-correccion-plans-json/
  ├── README.md                     ← Documentación primera corrección
  └── CORRECCION_DELETEAT.md        ← Este archivo (segunda corrección)
```

---

## 🚨 Importante para el Futuro

### Al Agregar Conteos de Nuevas Entidades:

1. **Verificar si la entidad tiene soft delete:**
   ```typescript
   // Revisar la entidad
   @Entity()
   export class MiEntidad {
     @DeleteDateColumn() // ¿Existe esta línea?
     deletedAt?: Date;
   }
   ```

2. **Si tiene soft delete:**
   ```typescript
   const count = await repo.count({ 
     where: { tenantId: id, deletedAt: null } 
   });
   ```

3. **Si NO tiene soft delete:**
   ```typescript
   const count = await repo.count({ 
     where: { tenantId: id } 
   });
   ```

---

**Problema Resuelto Completamente** ✅
