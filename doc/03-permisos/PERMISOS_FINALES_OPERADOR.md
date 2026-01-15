# Permisos Finales del Rol Operador

## Resumen

El rol **Operador** está diseñado para usuarios que crean y gestionan consentimientos en el día a día, sin necesidad de acceso administrativo.

## Permisos Asignados

| Permiso | Código | Descripción | Uso |
|---------|--------|-------------|-----|
| Ver Dashboard | `view_dashboard` | Ver estadísticas básicas | Acceso al panel principal |
| Ver Consentimientos | `view_consents` | Listar y consultar consentimientos | Ver lista de consentimientos |
| Crear Consentimientos | `create_consents` | Crear nuevos consentimientos | Formulario de nuevo consentimiento |
| Firmar Consentimientos | `sign_consents` | Capturar firma del cliente | Proceso de firma digital |
| Reenviar Email | `resend_consent_email` | Reenviar correo de consentimiento | Botón "Reenviar Email" |
| Ver Servicios | `view_services` | Ver lista de servicios | Selector de servicio en formulario |
| Ver Sedes | `view_branches` | Ver lista de sedes | Selector de sede en formulario |

## Flujo de Trabajo Completo

### 1. Crear Consentimiento
```
✅ view_services    → Cargar lista de servicios
✅ view_branches    → Cargar lista de sedes
✅ create_consents  → Crear el consentimiento
```

### 2. Firmar Consentimiento
```
✅ view_consents    → Ver el consentimiento
✅ sign_consents    → Capturar firma del cliente
```

### 3. Enviar/Reenviar Email
```
✅ view_consents         → Ver el consentimiento
✅ resend_consent_email  → Enviar o reenviar el correo
```

### 4. Consultar Consentimientos
```
✅ view_dashboard   → Ver estadísticas
✅ view_consents    → Ver lista y detalles
```

## Permisos que NO Tiene

El operador **NO puede**:

### Consentimientos
- ❌ Editar consentimientos (`edit_consents`)
- ❌ Eliminar consentimientos (`delete_consents`)

### Usuarios
- ❌ Ver usuarios (`view_users`)
- ❌ Crear usuarios (`create_users`)
- ❌ Editar usuarios (`edit_users`)
- ❌ Eliminar usuarios (`delete_users`)
- ❌ Cambiar contraseñas (`change_passwords`)

### Roles
- ❌ Ver roles (`view_roles`)
- ❌ Editar roles (`edit_roles`)

### Sedes
- ❌ Crear sedes (`create_branches`)
- ❌ Editar sedes (`edit_branches`)
- ❌ Eliminar sedes (`delete_branches`)

### Servicios
- ❌ Crear servicios (`create_services`)
- ❌ Editar servicios (`edit_services`)
- ❌ Eliminar servicios (`delete_services`)

### Preguntas
- ❌ Ver preguntas (`view_questions`)
- ❌ Crear preguntas (`create_questions`)
- ❌ Editar preguntas (`edit_questions`)
- ❌ Eliminar preguntas (`delete_questions`)

### Configuración
- ❌ Ver configuración (`view_settings`)
- ❌ Editar configuración (`edit_settings`)

### Tenants
- ❌ Gestionar tenants (`manage_tenants`)

## Comparación con Otros Roles

### Super Admin
- ✅ Todos los permisos del sistema
- ✅ Gestión de tenants
- ✅ Acceso global

### Admin General
- ✅ Todos los permisos excepto gestión de tenants
- ✅ Gestión completa del tenant
- ✅ Crear y gestionar usuarios

### Admin Sede
- ✅ Gestión de consentimientos (crear, editar, eliminar)
- ✅ Gestión de usuarios (crear, editar)
- ✅ Ver configuración
- ❌ No puede editar configuración

### Operador
- ✅ Crear y firmar consentimientos
- ✅ Reenviar emails
- ✅ Ver servicios y sedes (solo lectura)
- ❌ No puede editar ni eliminar nada
- ❌ No puede gestionar usuarios

## Casos de Uso

### Recepcionista / Asistente
Perfil ideal para:
- Recibir pacientes/clientes
- Crear consentimientos
- Capturar firmas
- Reenviar correos si es necesario
- Consultar consentimientos previos

### Operador de Sede
Perfil ideal para:
- Personal de mostrador
- Asistentes administrativos
- Personal de atención al cliente
- Operadores de call center

## Seguridad

### Acceso de Solo Lectura
Los permisos `view_services` y `view_branches`:
- ✅ Permiten ver listas para selección
- ❌ NO permiten crear, editar o eliminar
- ✅ Validados en backend con guards
- ✅ Botones ocultos en frontend

### Validación en Múltiples Capas

**Frontend:**
```typescript
const { hasPermission } = usePermissions();
const canEdit = hasPermission('edit_services');

{canEdit && <button>Editar</button>}
```

**Backend:**
```typescript
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.EDIT_SERVICES)
update() { ... }
```

### Aislamiento por Tenant
- El operador solo ve datos de su tenant
- No puede acceder a datos de otros tenants
- El tenantId se inyecta automáticamente

## Actualización de Permisos

### Aplicar Cambios

Cuando se modifican los permisos en el código:

```bash
cd backend
npx ts-node update-operador-permissions.ts
```

### Refrescar Token

Los usuarios deben:
1. Cerrar sesión
2. Iniciar sesión nuevamente
3. El nuevo token incluirá los permisos actualizados

## Historial de Cambios

### Versión 1.0 - Inicial
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents'
]
```

### Versión 1.1 - Agregar Permisos de Lectura
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents',
  'view_services',      // ← NUEVO
  'view_branches'       // ← NUEVO
]
```

### Versión 1.2 - Agregar Reenvío de Email (ACTUAL)
```typescript
[
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents',
  'resend_consent_email',  // ← NUEVO
  'view_services',
  'view_branches'
]
```

## Verificación de Permisos

### Verificar en Base de Datos

```bash
cd backend
npx ts-node check-tenant-user.ts
```

Buscar el usuario operador y verificar sus permisos.

### Verificar en Frontend

1. Iniciar sesión como operador
2. Abrir DevTools → Console
3. Ejecutar:
```javascript
console.log(JSON.parse(localStorage.getItem('user')).role.permissions)
```

## Resultado Final

✅ 7 permisos asignados
✅ Flujo de trabajo completo habilitado
✅ Seguridad mantenida con permisos granulares
✅ Acceso de solo lectura a servicios y sedes
✅ Puede crear, firmar y reenviar consentimientos
✅ No puede editar ni eliminar nada
✅ Perfil ideal para operadores de día a día
