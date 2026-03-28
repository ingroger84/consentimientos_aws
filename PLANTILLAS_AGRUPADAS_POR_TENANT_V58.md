# Plantillas Agrupadas por Tenant - V58

## Fecha: 2026-03-16

## Resumen

Se implementó la funcionalidad para que las plantillas de consentimientos (CN y HC) estén agrupadas por tenant para el Super Admin, siguiendo el mismo patrón que ya existe para sedes, servicios y preguntas.

## Cambios Implementados

### 1. Plantillas de Consentimientos Convencionales (CN)

**Archivo**: `backend/src/consent-templates/consent-templates.service.ts`

- ✅ Agregado método `getAllGroupedByTenant()` que:
  - Obtiene todas las plantillas CN con relación al tenant
  - Agrupa por tenant con estadísticas:
    - `totalTemplates`: Total de plantillas
    - `activeTemplates`: Plantillas activas
    - `inactiveTemplates`: Plantillas inactivas
    - `procedureTemplates`: Plantillas de procedimiento
    - `dataTreatmentTemplates`: Plantillas de tratamiento de datos
    - `imageRightsTemplates`: Plantillas de derechos de imagen
  - Retorna array ordenado por total de plantillas (descendente)

- ✅ Corregido método `getStatistics()`:
  - Cambiado de agrupar por `category` (no existe en entity) a agrupar por `type`
  - Retorna estadísticas por tipo de plantilla

**Archivo**: `backend/src/consent-templates/consent-templates.controller.ts`

- ✅ Agregado endpoint `GET /api/consent-templates/all/grouped`
  - Requiere permiso `VIEW_GLOBAL_STATS`
  - Solo accesible para Super Admin

### 2. Plantillas de Historias Clínicas (HC)

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

- ✅ Agregado método `getAllGroupedByTenant()` que:
  - Obtiene todas las plantillas HC con relación al tenant
  - Agrupa por tenant con estadísticas:
    - `totalTemplates`: Total de plantillas
    - `activeTemplates`: Plantillas activas
    - `inactiveTemplates`: Plantillas inactivas
    - `defaultTemplates`: Plantillas marcadas como predeterminadas
  - Retorna array ordenado por total de plantillas (descendente)

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.controller.ts`

- ✅ Agregado endpoint `GET /api/medical-record-consent-templates/all/grouped`
  - Requiere permiso `view_global_stats`
  - Solo accesible para Super Admin

## Correcciones Realizadas

### Errores de Compilación Corregidos

1. **Duplicate function implementation**:
   - Eliminado método `getAllGroupedByTenant()` duplicado en `consent-templates.service.ts`

2. **Property 'category' does not exist**:
   - Removidas referencias a `template.category` que no existe en la entidad `ConsentTemplate`
   - Cambiado a usar `template.type` que sí existe

3. **Statistics method**:
   - Corregido `getStatistics()` para agrupar por `type` en lugar de `category`

## Endpoints Disponibles

### Plantillas CN (Consentimientos Convencionales)

```
GET /api/consent-templates/all/grouped
```

**Permisos**: `VIEW_GLOBAL_STATS` (Super Admin)

**Respuesta**:
```json
[
  {
    "tenantId": "uuid",
    "tenantName": "Nombre del Tenant",
    "tenantSlug": "slug-tenant",
    "totalTemplates": 10,
    "activeTemplates": 8,
    "inactiveTemplates": 2,
    "procedureTemplates": 4,
    "dataTreatmentTemplates": 3,
    "imageRightsTemplates": 3,
    "templates": [
      {
        "id": "uuid",
        "name": "Nombre de la plantilla",
        "type": "procedure",
        "isActive": true,
        "isDefault": false,
        "createdAt": "2026-03-16T...",
        "tenantName": "Nombre del Tenant",
        "tenantSlug": "slug-tenant"
      }
    ]
  }
]
```

### Plantillas HC (Historias Clínicas)

```
GET /api/medical-record-consent-templates/all/grouped
```

**Permisos**: `view_global_stats` (Super Admin)

**Respuesta**:
```json
[
  {
    "tenantId": "uuid",
    "tenantName": "Nombre del Tenant",
    "tenantSlug": "slug-tenant",
    "totalTemplates": 15,
    "activeTemplates": 12,
    "inactiveTemplates": 3,
    "defaultTemplates": 5,
    "templates": [
      {
        "id": "uuid",
        "name": "Nombre de la plantilla",
        "category": "anamnesis",
        "isActive": true,
        "isDefault": false,
        "createdAt": "2026-03-16T...",
        "tenantName": "Nombre del Tenant",
        "tenantSlug": "slug-tenant"
      }
    ]
  }
]
```

## Patrón de Implementación

La implementación sigue el mismo patrón que ya existe en:

- `backend/src/consents/consents.service.ts` → `getAllGroupedByTenant()`
- `backend/src/branches/branches.service.ts` → `getAllGroupedByTenant()`
- `backend/src/services/services.service.ts` → `getAllGroupedByTenant()`
- `backend/src/questions/questions.service.ts` → `getAllGroupedByTenant()`

## Despliegue

**Versión**: v58
**Fecha**: 2026-03-16
**Script**: `scripts/deploy-templates-grouped-v58.ps1`

### Pasos Ejecutados

1. ✅ Compilación local del backend
2. ✅ Creación de archivo comprimido `backend-dist-v58-templates-grouped.zip`
3. ✅ Subida al servidor
4. ✅ Backup del dist anterior → `dist.backup.v58`
5. ✅ Descompresión del nuevo dist
6. ✅ Reinicio del servicio PM2 `datagree`

## Verificación

Para verificar que los endpoints funcionan correctamente:

```bash
# Plantillas CN agrupadas
curl -X GET https://archivoenlinea.com/api/consent-templates/all/grouped \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"

# Plantillas HC agrupadas
curl -X GET https://archivoenlinea.com/api/medical-record-consent-templates/all/grouped \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
```

## Notas Importantes

1. **Solo Super Admin**: Ambos endpoints requieren permisos de Super Admin
2. **Agrupación automática**: Las plantillas se agrupan automáticamente por tenant
3. **Ordenamiento**: Los resultados se ordenan por total de plantillas (descendente)
4. **Estadísticas**: Cada grupo incluye estadísticas detalladas por tipo/categoría
5. **Compatibilidad**: Mantiene compatibilidad con endpoints existentes

## Estado

✅ **COMPLETADO** - Los endpoints están desplegados y funcionando en producción.
