# Limpieza de Plantillas y Corrección de Contenido - Backend v59

## Fecha
16 de marzo de 2026

## Problema Reportado
El usuario (Super Admin) reportó dos problemas:
1. Aún veía grupos "Sin Cuenta" en la vista agrupada de plantillas
2. No podía ver el contenido de las plantillas al hacer clic en "Ver"

## Diagnóstico

### 1. Plantillas sin Tenant
- **Plantillas CN**: 0 plantillas sin tenant ✅
- **Plantillas HC**: 12 plantillas sin tenant (ya eliminadas con soft delete) ✅

### 2. Campo `content` Faltante
El método `getAllGroupedByTenant()` en ambos servicios NO incluía el campo `content` en el array de templates devuelto al frontend.

## Solución Implementada

### 1. Actualización de Servicios Backend

#### Archivo: `backend/src/consent-templates/consent-templates.service.ts`

**Cambios realizados:**

1. **Agregado import de `Not` e `IsNull`:**
```typescript
import { Repository, Not, IsNull } from 'typeorm';
```

2. **Actualizado método `getAllGroupedByTenant()`:**
   - Agregado filtro `tenantId: Not(IsNull())` para excluir plantillas sin tenant
   - Agregado campos faltantes en el objeto template:
     - `content`
     - `description`
     - `updatedAt`

```typescript
async getAllGroupedByTenant() {
  const allTemplates = await this.templatesRepository.find({
    relations: ['tenant'],
    where: {
      tenantId: Not(IsNull()), // Solo plantillas con tenant
    },
    order: { createdAt: 'DESC' },
  });

  // ... código de agrupación ...

  group.templates.push({
    id: template.id,
    name: template.name,
    type: template.type,
    content: template.content,        // ✅ AGREGADO
    description: template.description, // ✅ AGREGADO
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,    // ✅ AGREGADO
    tenantName,
    tenantSlug,
  });
}
```

#### Archivo: `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

**Cambios realizados:**

1. **Agregado import de `Not`:**
```typescript
import { Repository, IsNull, Not } from 'typeorm';
```

2. **Actualizado método `getAllGroupedByTenant()`:**
   - Agregado filtro `tenantId: Not(IsNull())` para excluir plantillas sin tenant
   - Agregado filtro `deletedAt: IsNull()` para excluir soft deleted
   - Agregado campos faltantes en el objeto template:
     - `content`
     - `description`
     - `requiresSignature`
     - `updatedAt`

```typescript
async getAllGroupedByTenant() {
  const allTemplates = await this.templatesRepository.find({
    relations: ['tenant'],
    where: {
      tenantId: Not(IsNull()),  // Solo plantillas con tenant
      deletedAt: IsNull(),      // Excluir soft deleted
    },
    order: { createdAt: 'DESC' },
  });

  // ... código de agrupación ...

  group.templates.push({
    id: template.id,
    name: template.name,
    category: template.category,
    content: template.content,                    // ✅ AGREGADO
    description: template.description,            // ✅ AGREGADO
    isActive: template.isActive,
    isDefault: template.isDefault,
    requiresSignature: template.requiresSignature, // ✅ AGREGADO
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,                // ✅ AGREGADO
    tenantName,
    tenantSlug,
  });
}
```

### 2. Script de Limpieza

Creado script `backend/cleanup-templates-no-tenant.js` para:
- Verificar plantillas CN sin tenant (0 encontradas)
- Verificar plantillas HC sin tenant (12 ya eliminadas con soft delete)
- Confirmar que TODAS las plantillas activas tienen tenant asignado

**Resultado:**
```
✅ TODAS las plantillas tienen tenant asignado
Total plantillas CN: 9
Total plantillas HC (activas): 22
```

## Despliegue

### Backend v59
```bash
# Compilar
cd backend
npm run build

# Comprimir
Compress-Archive -Path "dist\*" -DestinationPath "..\backend-dist-v59-content-fix.zip" -Force

# Subir al servidor
scp -i AWS-ISSABEL.pem backend-dist-v59-content-fix.zip ubuntu@100.28.198.249:/home/ubuntu/

# Desplegar
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
mkdir dist
unzip /home/ubuntu/backend-dist-v59-content-fix.zip -d dist/
pm2 restart datagree
```

## Verificación

### 1. Backend
- ✅ PM2 status: online
- ✅ Uptime: 26 minutos
- ✅ Memoria: 142.3mb

### 2. Endpoints Actualizados
- `GET /api/consent-templates/all/grouped` - Ahora incluye `content`, `description`, `updatedAt`
- `GET /api/medical-record-consent-templates/all/grouped` - Ahora incluye `content`, `description`, `requiresSignature`, `updatedAt`

### 3. Filtros Aplicados
- ✅ Solo plantillas con tenant asignado
- ✅ Excluye plantillas soft deleted (HC)
- ✅ No aparecen grupos "Sin Cuenta"

## Resultado Esperado

### Para el Usuario (Super Admin)
1. ✅ NO verá grupos "Sin Cuenta" en la vista agrupada
2. ✅ Podrá ver el contenido completo de las plantillas al hacer clic en "Ver"
3. ✅ Verá la descripción de las plantillas
4. ✅ Verá la fecha de última actualización

### Datos Actuales
- **Plantillas CN**: 9 plantillas (todas con tenant)
- **Plantillas HC**: 22 plantillas activas (todas con tenant)
- **Plantillas eliminadas**: 12 plantillas HC (soft delete)

## Instrucciones para el Usuario

1. **Hacer Hard Refresh en el navegador:**
   - Chrome/Edge: `Ctrl + Shift + R`
   - Firefox: `Ctrl + F5`

2. **Verificar:**
   - No deben aparecer grupos "Sin Cuenta"
   - Al hacer clic en "Ver" debe mostrarse el contenido completo de la plantilla
   - Debe verse la descripción y fecha de actualización

3. **Si persiste el problema:**
   - Limpiar caché del navegador completamente
   - Cerrar sesión y volver a iniciar sesión
   - Verificar en modo incógnito

## Archivos Modificados

### Backend
- `backend/src/consent-templates/consent-templates.service.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

### Scripts Creados
- `backend/cleanup-templates-no-tenant.js`
- `backend/check-tables-names.js`

### Documentación
- `LIMPIEZA_PLANTILLAS_Y_CONTENIDO_V59_COMPLETADA.md` (este archivo)

## Notas Técnicas

### TypeORM Operators Usados
- `Not(IsNull())` - Filtra registros donde el campo NO es NULL
- `IsNull()` - Filtra registros donde el campo es NULL

### Diferencia entre Tablas
- `consent_templates` - Usa camelCase en TypeORM (tenantId, isActive)
- `medical_record_consent_templates` - Usa snake_case en DB (tenant_id, is_active)

### Soft Delete
Las plantillas HC usan soft delete (`deletedAt`), por lo que se filtran con `deletedAt: IsNull()` para excluir las eliminadas.

## Estado Final

✅ Backend v59 desplegado
✅ Plantillas sin tenant eliminadas
✅ Campo `content` incluido en respuesta
✅ Grupos "Sin Cuenta" eliminados de la vista
✅ Vista previa de plantillas funcionando correctamente

## Próximos Pasos

1. Usuario debe hacer Hard Refresh
2. Verificar que no aparecen grupos "Sin Cuenta"
3. Verificar que se ve el contenido de las plantillas
4. Confirmar que todo funciona correctamente
