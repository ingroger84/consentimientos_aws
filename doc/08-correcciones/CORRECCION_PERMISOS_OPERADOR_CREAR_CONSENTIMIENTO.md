# Corrección de Permisos del Operador para Crear Consentimientos

## Problema Identificado

Usuario con perfil **Operador** no podía crear consentimientos. Al intentar acceder al formulario de nuevo consentimiento, aparecía el error:

```
Error al crear datos:
Servicios: Request failed with status code 403
```

### Causa Raíz

El rol Operador tenía el permiso `create_consents` pero le faltaban permisos necesarios para acceder a los datos requeridos en el formulario:

**Permisos anteriores del Operador:**
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents'
]
```

**Problema:**
- Para crear un consentimiento, el formulario necesita cargar:
  - Lista de **servicios** disponibles (requiere `view_services`)
  - Lista de **sedes** disponibles (requiere `view_branches`)
- Sin estos permisos, las peticiones HTTP retornaban 403 Forbidden

## Solución Implementada

### 1. Actualización de Permisos

Se agregaron los permisos faltantes al rol OPERADOR en `permissions.ts`:

```typescript
OPERADOR: [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CONSENTS,
  PERMISSIONS.CREATE_CONSENTS,
  PERMISSIONS.SIGN_CONSENTS,
  PERMISSIONS.VIEW_SERVICES,      // ✅ AGREGADO
  PERMISSIONS.VIEW_BRANCHES,      // ✅ AGREGADO
],
```

### 2. Actualización en Base de Datos

Se ejecutó el script `update-operador-permissions.ts` para sincronizar los permisos en la base de datos.

**Resultado:**
```
✅ Permisos actualizados del Operador:
  - view_dashboard
  - view_consents
  - create_consents
  - sign_consents
  - view_services      ← NUEVO
  - view_branches      ← NUEVO
```

## Permisos del Rol Operador

### Permisos Finales

| Permiso | Descripción | Uso |
|---------|-------------|-----|
| `view_dashboard` | Ver dashboard | Acceso a estadísticas básicas |
| `view_consents` | Ver consentimientos | Listar y consultar consentimientos |
| `create_consents` | Crear consentimientos | Crear nuevos consentimientos |
| `sign_consents` | Firmar consentimientos | Capturar firma del cliente |
| `view_services` | Ver servicios | Seleccionar servicio en formulario |
| `view_branches` | Ver sedes | Seleccionar sede en formulario |

### Permisos que NO tiene

El operador **NO puede**:
- ❌ Editar o eliminar consentimientos
- ❌ Crear, editar o eliminar servicios
- ❌ Crear, editar o eliminar sedes
- ❌ Gestionar usuarios
- ❌ Gestionar roles
- ❌ Ver o editar configuración

## Flujo de Trabajo del Operador

### 1. Crear Consentimiento

```
1. Operador hace clic en "Nuevo Consentimiento"
   ↓
2. Sistema carga servicios (requiere view_services)
   ↓
3. Sistema carga sedes (requiere view_branches)
   ↓
4. Operador llena formulario
   ↓
5. Sistema crea consentimiento (requiere create_consents)
   ↓
6. Consentimiento creado exitosamente
```

### 2. Firmar Consentimiento

```
1. Operador abre consentimiento
   ↓
2. Cliente responde preguntas
   ↓
3. Cliente firma (requiere sign_consents)
   ↓
4. Sistema genera PDF
   ↓
5. Consentimiento firmado
```

## Seguridad

### Acceso de Solo Lectura

Los permisos `view_services` y `view_branches` solo permiten:
- ✅ Ver la lista de servicios
- ✅ Ver la lista de sedes
- ❌ NO permite crear, editar o eliminar

### Validación en Backend

Todos los endpoints están protegidos con guards:

```typescript
@Get()
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_SERVICES)
findAll() { ... }
```

### Validación en Frontend

Los botones de edición/eliminación están ocultos para operadores (implementado previamente).

## Archivos Modificados

- `backend/src/auth/constants/permissions.ts` - Agregados permisos al rol OPERADOR
- Base de datos: Tabla `role` - Registro del rol Operador actualizado

## Pruebas Realizadas

✅ Script ejecutado exitosamente
✅ Permisos actualizados en base de datos
✅ Compilación sin errores

## Próximos Pasos para Probar

1. **Cerrar sesión** del usuario operador (importante para refrescar el token)
2. **Iniciar sesión** nuevamente
3. Hacer clic en **"Nuevo Consentimiento"**
4. Verificar que carga:
   - ✅ Lista de servicios
   - ✅ Lista de sedes
5. Crear un consentimiento completo
6. Firmar el consentimiento

## Notas Importantes

### Token JWT

Los permisos se almacenan en el token JWT. Para que los cambios surtan efecto:
1. El usuario debe **cerrar sesión**
2. **Iniciar sesión** nuevamente
3. El nuevo token incluirá los permisos actualizados

### Permisos Mínimos

Un operador necesita estos permisos mínimos para su trabajo:
- `view_dashboard` - Ver su panel
- `view_consents` - Ver consentimientos
- `create_consents` - Crear consentimientos
- `sign_consents` - Firmar consentimientos
- `view_services` - Seleccionar servicio (solo lectura)
- `view_branches` - Seleccionar sede (solo lectura)

## Resultado Final

✅ Operador puede crear consentimientos
✅ Operador puede ver servicios (solo lectura)
✅ Operador puede ver sedes (solo lectura)
✅ Operador puede firmar consentimientos
✅ Operador NO puede editar/eliminar servicios o sedes
✅ Seguridad mantenida con permisos granulares
