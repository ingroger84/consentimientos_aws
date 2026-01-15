# Corrección: Constraint de Slug en Tenants

## Problema Identificado

Al intentar crear un nuevo tenant con slug "demo", el sistema arrojaba el siguiente error:

```
duplicate key value violates unique constraint "UQ_32731f181236a46182a38c992a8"
```

### Causa Raíz

El sistema utiliza **soft delete** para los tenants (marca `deleted_at` en lugar de eliminar físicamente el registro). Sin embargo, la constraint UNIQUE en la columna `slug` no excluía los registros eliminados, por lo que:

1. Existía un tenant con slug "demo" que fue eliminado (soft delete)
2. La constraint UNIQUE impedía crear un nuevo tenant con el mismo slug
3. Esto violaba el principio de reutilización de slugs después de eliminar tenants

## Solución Implementada

### 1. Migración Creada

Se creó la migración `1736060000000-FixTenantSlugUniqueConstraint.ts` que:

1. **Elimina** la constraint UNIQUE original:
   ```sql
   ALTER TABLE "tenants" 
   DROP CONSTRAINT IF EXISTS "UQ_32731f181236a46182a38c992a8"
   ```

2. **Crea** un índice único parcial que excluye registros eliminados:
   ```sql
   CREATE UNIQUE INDEX "IDX_tenants_slug_not_deleted" 
   ON "tenants" ("slug") 
   WHERE "deleted_at" IS NULL
   ```

### 2. Mejoras en Mensajes de Error

Se mejoró el manejo de errores en `TenantFormModal.tsx` para mostrar mensajes más claros:

```typescript
if (message.includes('slug') && message.includes('uso')) {
  errorMessage = 'El slug ya está en uso. Por favor usa uno diferente.';
} else if (message.includes('duplicate key')) {
  if (message.includes('slug')) {
    errorMessage = 'El slug ya está en uso. Por favor usa uno diferente (ej: demo-2, mi-clinica, etc).';
  }
}
```

### 3. Corrección de Migraciones Antiguas

Se corrigieron las migraciones existentes para que verifiquen si las columnas ya existen antes de crearlas:

- `1704297600000-AddMultiplePdfUrls.ts`
- `1704298000000-AddPermissionsToRoles.ts`

## Resultado

Ahora el sistema permite:

✅ Crear tenants con slugs que fueron usados por tenants eliminados (soft delete)
✅ Mantener la unicidad de slugs para tenants activos
✅ Reutilizar slugs después de eliminar tenants
✅ Mensajes de error claros y específicos

## Cómo Probar

1. Intenta crear un nuevo tenant con slug "demo"
2. El sistema debe permitir la creación exitosamente
3. El tenant anterior con slug "demo" permanece en la base de datos con `deleted_at` no nulo
4. El nuevo tenant con slug "demo" tiene `deleted_at` nulo

## Archivos Modificados

- `backend/src/database/migrations/1736060000000-FixTenantSlugUniqueConstraint.ts` (nuevo)
- `frontend/src/components/TenantFormModal.tsx` (mejorado)
- `backend/src/database/migrations/1704297600000-AddMultiplePdfUrls.ts` (corregido)
- `backend/src/database/migrations/1704298000000-AddPermissionsToRoles.ts` (corregido)

## Notas Técnicas

- **Índice Parcial**: PostgreSQL permite crear índices únicos con una cláusula WHERE, lo que es perfecto para soft deletes
- **Mejores Prácticas**: Esta es la forma recomendada de manejar constraints UNIQUE con soft delete
- **Compatibilidad**: La migración incluye un método `down()` para revertir los cambios si es necesario

---

**Fecha**: 5 de enero de 2026  
**Estado**: ✅ Completado y Probado
