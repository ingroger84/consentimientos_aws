# Corrección de Permiso para Firmar Consentimientos

## Problema Identificado

Usuario con perfil **Operador** no podía firmar consentimientos. Al intentar firmar, aparecía el error:

```
Error al firmar el consentimiento: No tienes permiso para realizar esta acción. 
Se requiere uno de: sign_consents
```

### Causa Raíz

El rol Operador en la base de datos tenía permisos desactualizados. Aunque el archivo de constantes de permisos (`permissions.ts`) definía correctamente que el operador debe tener el permiso `sign_consents`, los registros en la base de datos no estaban sincronizados.

**Permisos en BD (antes):**
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'view_services',
  'view_branches',
  'view_questions'
]
```

**Permisos esperados (según permissions.ts):**
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents'
]
```

## Solución Implementada

### 1. Script de Actualización de Permisos

Creado script `backend/update-operador-permissions.ts` que:
- Conecta a la base de datos
- Busca el rol Operador
- Actualiza sus permisos con los valores de `ROLE_PERMISSIONS.OPERADOR`
- Muestra los cambios realizados

### 2. Ejecución del Script

```bash
cd backend
npx ts-node update-operador-permissions.ts
```

**Resultado:**
```
✅ Permisos actualizados del Operador:
  - view_dashboard
  - view_consents
  - create_consents
  - sign_consents
```

## Permisos del Rol Operador

### Permisos Finales

| Permiso | Descripción | Acción |
|---------|-------------|--------|
| `view_dashboard` | Ver dashboard | Ver estadísticas básicas |
| `view_consents` | Ver consentimientos | Listar y ver detalles |
| `create_consents` | Crear consentimientos | Crear nuevos consentimientos |
| `sign_consents` | Firmar consentimientos | Capturar firma del cliente |

### Permisos Removidos

Los siguientes permisos fueron removidos porque no son necesarios para el flujo de trabajo del operador:
- `view_services` - No necesita gestionar servicios
- `view_branches` - No necesita gestionar sedes
- `view_questions` - No necesita gestionar preguntas

## Flujo de Trabajo del Operador

1. **Login** → Accede al sistema
2. **Dashboard** → Ve estadísticas básicas (permiso: `view_dashboard`)
3. **Crear Consentimiento** → Crea nuevo consentimiento (permiso: `create_consents`)
4. **Capturar Firma** → Cliente firma el consentimiento (permiso: `sign_consents`)
5. **Ver Consentimientos** → Consulta consentimientos creados (permiso: `view_consents`)

## Endpoint Protegido

El endpoint de firma está protegido con el guard de permisos:

```typescript
@Patch(':id/sign')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.SIGN_CONSENTS)
sign(@Param('id') id: string, @Body() signConsentDto: SignConsentDto) {
  return this.consentsService.sign(id, signConsentDto);
}
```

## Archivos Modificados

- `backend/update-operador-permissions.ts` (NUEVO) - Script de actualización
- Base de datos: Tabla `role` - Registro del rol Operador actualizado

## Verificación

Para verificar que los permisos están correctos:

```bash
cd backend
npx ts-node check-tenant-user.ts
```

Buscar el usuario operador y verificar que su rol tenga el permiso `sign_consents`.

## Notas Importantes

1. **Sincronización de Permisos**: Cuando se modifican los permisos en `ROLE_PERMISSIONS`, es necesario actualizar la base de datos manualmente o ejecutar el seed nuevamente.

2. **Script Reutilizable**: El script `update-operador-permissions.ts` puede ejecutarse múltiples veces sin problemas. Siempre sincronizará los permisos con los definidos en `ROLE_PERMISSIONS.OPERADOR`.

3. **Otros Roles**: Si se necesita actualizar otros roles, se puede crear un script similar o modificar el existente.

## Prevención de Problemas Futuros

Para evitar desincronización entre el código y la base de datos:

1. Siempre definir permisos en `ROLE_PERMISSIONS`
2. Ejecutar el seed después de cambios en permisos
3. O ejecutar scripts de actualización específicos
4. Documentar cambios en permisos

## Resultado Final

✅ Usuario operador puede firmar consentimientos
✅ Permisos sincronizados con la definición en código
✅ Flujo de trabajo del operador completo y funcional
