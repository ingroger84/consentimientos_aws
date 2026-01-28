# Corrección de Permisos para Rol Operador en Plantillas HC

## Estado: ✅ COMPLETADO

## Resumen

Se corrigió el problema donde usuarios con rol "operador" podían ver botones de editar/eliminar plantillas HC cuando no tenían esos permisos.

## Problema Identificado

- **Síntoma**: Usuario operador veía botones de editar/eliminar plantillas HC
- **Causa**: Frontend no verificaba permisos antes de mostrar botones de acción
- **Impacto**: Confusión del usuario y posibles intentos de acciones no permitidas

## Solución Implementada

### Frontend: `MRConsentTemplatesPage.tsx`

Se agregó verificación de permisos usando `useAuthStore`:

```typescript
const { user } = useAuthStore();

// Verificar permisos
const canEdit = user?.role?.permissions?.includes('edit_mr_consent_templates') || false;
const canDelete = user?.role?.permissions?.includes('delete_mr_consent_templates') || false;
const canCreate = user?.role?.permissions?.includes('create_mr_consent_templates') || false;
```

### Botones Condicionados por Permisos

1. **Botón "Nueva Plantilla HC"**: Solo visible si `canCreate`
2. **Botón "Editar"**: Solo visible si `canEdit`
3. **Botón "Eliminar"**: Solo visible si `canDelete`
4. **Botón "Marcar como predeterminada"**: Solo visible si `canEdit`

## Permisos por Rol

### Rol OPERADOR
- ✅ `view_mr_consent_templates` - Ver plantillas HC
- ❌ `create_mr_consent_templates` - Crear plantillas HC
- ❌ `edit_mr_consent_templates` - Editar plantillas HC
- ❌ `delete_mr_consent_templates` - Eliminar plantillas HC

### Rol ADMIN
- ✅ Todos los permisos de plantillas HC

## Archivos Modificados

- `frontend/src/pages/MRConsentTemplatesPage.tsx`

## Verificación

### Backend
```bash
npm run start:dev
```
✅ Compilando sin errores

### Frontend
```bash
npm run dev
```
✅ Compilando sin errores (puerto 5174)

## Pruebas Recomendadas

1. **Como Operador**:
   - Iniciar sesión con usuario operador
   - Ir a "Plantillas HC"
   - Verificar que NO se vean botones de:
     - Nueva Plantilla HC
     - Editar
     - Eliminar
     - Marcar como predeterminada

2. **Como Admin**:
   - Iniciar sesión con usuario admin
   - Ir a "Plantillas HC"
   - Verificar que SÍ se vean todos los botones

## Fecha de Implementación

26 de enero de 2026
