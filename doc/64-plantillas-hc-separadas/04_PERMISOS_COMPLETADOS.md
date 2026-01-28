# ✅ Permisos de Plantillas HC - Completado

## 📋 Resumen

Los permisos de Plantillas de Consentimiento HC han sido completamente integrados en el sistema de roles y permisos.

## 🎯 Cambios Realizados

### 1. Backend - Constantes de Permisos

**Archivo**: `backend/src/auth/constants/permissions.ts`

#### Permisos Agregados:
```typescript
VIEW_MR_CONSENT_TEMPLATES: 'view_mr_consent_templates',
CREATE_MR_CONSENT_TEMPLATES: 'create_mr_consent_templates',
EDIT_MR_CONSENT_TEMPLATES: 'edit_mr_consent_templates',
DELETE_MR_CONSENT_TEMPLATES: 'delete_mr_consent_templates',
GENERATE_MR_CONSENTS: 'generate_mr_consents',
VIEW_MR_CONSENTS: 'view_mr_consents',
```

#### Descripciones Agregadas:
- Ver plantillas de consentimiento HC
- Crear plantillas de consentimiento HC
- Editar plantillas de consentimiento HC
- Eliminar plantillas de consentimiento HC
- Generar consentimientos desde HC
- Ver consentimientos generados desde HC

#### Categoría Agregada:
```typescript
mr_consent_templates: {
  name: 'Plantillas de Consentimiento HC',
  permissions: [
    PERMISSIONS.VIEW_MR_CONSENT_TEMPLATES,
    PERMISSIONS.CREATE_MR_CONSENT_TEMPLATES,
    PERMISSIONS.EDIT_MR_CONSENT_TEMPLATES,
    PERMISSIONS.DELETE_MR_CONSENT_TEMPLATES,
    PERMISSIONS.GENERATE_MR_CONSENTS,
    PERMISSIONS.VIEW_MR_CONSENTS,
  ],
}
```

#### Permisos por Rol:
- **SUPER_ADMIN**: Todos los permisos (6)
- **ADMIN_GENERAL**: Todos los permisos (6)
- **ADMIN_SEDE**: Sin permisos
- **OPERADOR**: Ver plantillas y generar consentimientos (2)

### 2. Base de Datos - Permisos en Roles

**Script**: `backend/reset-admin-permissions-complete.sql`

Se actualizaron los permisos del rol "Administrador General" para incluir:
- view_mr_consent_templates
- create_mr_consent_templates
- edit_mr_consent_templates
- delete_mr_consent_templates
- generate_mr_consents
- view_mr_consents

### 3. Scripts de Utilidad Creados

#### `backend/verify-mr-permissions.js`
Script de verificación que:
- Inicia sesión con el usuario admin
- Obtiene los permisos disponibles del endpoint `/api/roles/permissions`
- Verifica que los 6 permisos de Plantillas HC estén disponibles
- Verifica que la categoría "Plantillas de Consentimiento HC" exista
- Muestra qué roles tienen permisos de Plantillas HC

#### `backend/fix-admin-permissions.js`
Script para eliminar duplicados y agregar permisos faltantes.

#### `backend/apply-admin-permissions-reset.js`
Script para aplicar el reset completo de permisos del rol Administrador General.

#### `backend/add-missing-permissions.js`
Script para agregar solo los permisos faltantes sin eliminar los existentes.

#### `backend/check-admin-permissions.js`
Script para verificar los permisos actuales del usuario admin.

## ✅ Verificación Exitosa

```
✅ VERIFICACIÓN EXITOSA: Todos los permisos están disponibles

📋 Permisos de Plantillas HC:
   ✅ view_mr_consent_templates
   ✅ create_mr_consent_templates
   ✅ edit_mr_consent_templates
   ✅ delete_mr_consent_templates
   ✅ generate_mr_consents
   ✅ view_mr_consents

📋 Categoría:
   ✅ Plantillas de Consentimiento HC (6 permisos)

📋 Roles con permisos:
   ✅ Administrador General (6 permisos)
   ✅ Operador (2 permisos)
```

## 🎨 Interfaz de Usuario

Los permisos ahora aparecen en la página de **Roles y Permisos** (`/roles`):

### Categoría: "Plantillas de Consentimiento HC"
- Ver plantillas de consentimiento HC
- Crear plantillas de consentimiento HC
- Editar plantillas de consentimiento HC
- Eliminar plantillas de consentimiento HC
- Generar consentimientos desde HC
- Ver consentimientos generados desde HC

### Funcionalidad
- Los administradores pueden asignar/desasignar estos permisos a cualquier rol
- Los permisos se agrupan en una categoría expandible/contraíble
- Se puede seleccionar/deseleccionar toda la categoría con un click
- Búsqueda de permisos funciona con los nuevos permisos

## 📝 Instrucciones de Prueba

### 1. Acceder al Sistema
```
URL: http://demo-medico.localhost:5173
Usuario: admin@clinicademo.com
Contraseña: Demo123!
```

### 2. Verificar Permisos
1. Ir a "Roles y Permisos" en el menú lateral
2. Buscar la categoría "Plantillas de Consentimiento HC"
3. Expandir la categoría
4. Verificar que aparecen los 6 permisos

### 3. Editar Permisos de un Rol
1. Click en "Editar Permisos" de cualquier rol
2. Buscar "Plantillas HC" en el buscador
3. Seleccionar/deseleccionar permisos
4. Guardar cambios
5. Verificar que los cambios se aplicaron

### 4. Verificar Funcionalidad
1. Crear un usuario con un rol que tenga permisos de Plantillas HC
2. Iniciar sesión con ese usuario
3. Verificar que puede acceder a "Plantillas HC" en el menú
4. Verificar que puede crear/editar/eliminar plantillas según sus permisos

## 🔧 Mantenimiento

### Agregar Nuevos Permisos
1. Agregar constante en `PERMISSIONS`
2. Agregar descripción en `PERMISSION_DESCRIPTIONS`
3. Agregar a categoría en `PERMISSION_CATEGORIES`
4. Agregar a roles en `ROLE_PERMISSIONS`
5. Reiniciar backend
6. Actualizar permisos en base de datos si es necesario

### Limpiar Sesiones
Si los cambios no se reflejan inmediatamente:
```bash
cd backend
node clear-user-sessions.js
```

## 📊 Estado Final

| Componente | Estado | Notas |
|------------|--------|-------|
| Constantes Backend | ✅ | 6 permisos agregados |
| Descripciones | ✅ | Textos en español |
| Categoría | ✅ | "Plantillas de Consentimiento HC" |
| Roles | ✅ | Super Admin y Admin tienen todos |
| Base de Datos | ✅ | Permisos actualizados |
| Frontend | ✅ | Permisos visibles en UI |
| Verificación | ✅ | Script de verificación exitoso |

## 🎉 Conclusión

El sistema de permisos de Plantillas HC está completamente funcional y listo para usar. Los administradores pueden gestionar los permisos desde la interfaz de usuario y los cambios se aplican inmediatamente (después de limpiar sesiones si es necesario).

---

**Fecha de Completación**: 2026-01-26  
**Versión**: 15.0.10
