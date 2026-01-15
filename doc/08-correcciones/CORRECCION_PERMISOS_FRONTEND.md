# Corrección: Protección de Permisos en Frontend

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ Completado

---

## 🎯 Problema Identificado

Los usuarios con rol "Operador" que solo tienen permisos de lectura (`view_services`, `view_branches`) podían ver los botones de "Editar" y "Eliminar" en las páginas de Servicios y Sedes, aunque el backend rechazaba las peticiones.

### Síntomas
- Botones de editar y eliminar visibles para todos los usuarios
- Backend retornaba error 403 al intentar editar/eliminar
- Mala experiencia de usuario
- Confusión sobre qué acciones están permitidas

---

## 🔍 Causa Raíz

El frontend no estaba verificando los permisos del usuario antes de mostrar los botones de acción. Todos los botones se mostraban independientemente del rol del usuario.

**Código Problemático:**
```typescript
// ❌ ANTES: Botones siempre visibles
<button onClick={() => handleEdit(service)}>
  Editar
</button>
<button onClick={() => handleDelete(service.id)}>
  Eliminar
</button>
```

---

## ✨ Solución Implementada

### 1. Hook de Permisos Reutilizable

**Archivo:** `frontend/src/hooks/usePermissions.ts`

Creado un hook personalizado para verificar permisos del usuario:

```typescript
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (...permissions: string[]): boolean => {
    if (!user || !user.role) return false;
    return permissions.some(permission => 
      user.role.permissions?.includes(permission)
    );
  };

  const hasAllPermissions = (...permissions: string[]): boolean => {
    if (!user || !user.role) return false;
    return permissions.every(permission => 
      user.role.permissions?.includes(permission)
    );
  };

  const isSuperAdmin = (): boolean => {
    if (!user || !user.role) return false;
    return user.role.type === 'super_admin';
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
  };
}
```

**Características:**
- ✅ Verifica permisos individuales
- ✅ Verifica múltiples permisos (OR/AND)
- ✅ Detecta Super Admin
- ✅ Reutilizable en cualquier componente
- ✅ Type-safe con TypeScript

### 2. Actualización de ServicesPage

**Archivo:** `frontend/src/pages/ServicesPage.tsx`

```typescript
import { usePermissions } from '@/hooks/usePermissions';

export default function ServicesPage() {
  const { hasPermission } = usePermissions();
  
  // Verificar permisos
  const canCreate = hasPermission('create_services');
  const canEdit = hasPermission('edit_services');
  const canDelete = hasPermission('delete_services');

  return (
    <div>
      {/* Botón crear solo si tiene permiso */}
      {canCreate && (
        <button onClick={() => setIsModalOpen(true)}>
          Nuevo Servicio
        </button>
      )}

      {/* Botones de acción condicionales */}
      <div className="flex gap-2">
        {canEdit && (
          <button onClick={() => handleEdit(service)}>
            Editar
          </button>
        )}
        {canDelete && (
          <button onClick={() => handleDelete(service.id)}>
            Eliminar
          </button>
        )}
        {!canEdit && !canDelete && (
          <div className="text-center text-sm text-gray-500">
            Solo lectura
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Actualización de BranchesPage

**Archivo:** `frontend/src/pages/BranchesPage.tsx`

Implementación idéntica a ServicesPage:

```typescript
const canCreate = hasPermission('create_branches');
const canEdit = hasPermission('edit_branches');
const canDelete = hasPermission('delete_branches');
```

---

## 🎨 Mejoras de UX

### Indicador de Solo Lectura

Cuando el usuario no tiene permisos de edición ni eliminación, se muestra un mensaje claro:

```typescript
{!canEdit && !canDelete && (
  <div className="flex-1 text-center text-sm text-gray-500 py-2">
    Solo lectura
  </div>
)}
```

**Beneficios:**
- Usuario sabe que está en modo lectura
- No hay confusión sobre permisos
- Interfaz más clara

### Botones Condicionales

Los botones solo se renderizan si el usuario tiene el permiso correspondiente:

- ✅ **Botón "Nuevo"**: Solo si tiene `create_*`
- ✅ **Botón "Editar"**: Solo si tiene `edit_*`
- ✅ **Botón "Eliminar"**: Solo si tiene `delete_*`

---

## 🔒 Seguridad en Capas

### Capa 1: Frontend (UX)
- Oculta botones según permisos
- Mejora experiencia de usuario
- Evita intentos fallidos

### Capa 2: Backend (Seguridad)
- Valida permisos en cada endpoint
- Retorna 403 si no tiene permiso
- Protección real de datos

**Importante:** El frontend NO es seguridad, solo mejora UX. La seguridad real está en el backend.

---

## 📊 Comparación Antes/Después

### Antes

| Usuario | Permisos | Botones Visibles | Resultado al Click |
|---------|----------|------------------|-------------------|
| Operador | view_services | Editar, Eliminar | ❌ Error 403 |
| Admin Sede | view_services, edit_services | Editar, Eliminar | ✅ Editar OK, ❌ Eliminar 403 |
| Admin General | Todos | Editar, Eliminar | ✅ Ambos OK |

### Después

| Usuario | Permisos | Botones Visibles | Resultado |
|---------|----------|------------------|-----------|
| Operador | view_services | "Solo lectura" | ✅ Claro que no puede editar |
| Admin Sede | view_services, edit_services | Editar | ✅ Solo ve lo que puede hacer |
| Admin General | Todos | Editar, Eliminar | ✅ Ve todas las opciones |

---

## 🧪 Testing

### Casos de Prueba

1. **Usuario Operador**
   - ✅ No ve botón "Nuevo Servicio"
   - ✅ No ve botón "Editar"
   - ✅ No ve botón "Eliminar"
   - ✅ Ve mensaje "Solo lectura"

2. **Usuario Admin Sede**
   - ✅ Ve botón "Nuevo Servicio"
   - ✅ Ve botón "Editar"
   - ✅ No ve botón "Eliminar"
   - ✅ Puede editar servicios

3. **Usuario Admin General**
   - ✅ Ve botón "Nuevo Servicio"
   - ✅ Ve botón "Editar"
   - ✅ Ve botón "Eliminar"
   - ✅ Puede hacer todas las acciones

4. **Cambio de Permisos**
   - ✅ Al cambiar permisos del rol
   - ✅ Usuario debe hacer logout/login
   - ✅ Botones se actualizan correctamente

---

## 🔧 Archivos Modificados

### Frontend

1. **`frontend/src/hooks/usePermissions.ts`** (NUEVO)
   - Hook reutilizable para verificar permisos
   - Funciones helper para diferentes casos
   - Type-safe con TypeScript

2. **`frontend/src/pages/ServicesPage.tsx`** (ACTUALIZADO)
   - Importa y usa `usePermissions`
   - Botones condicionales según permisos
   - Indicador de solo lectura

3. **`frontend/src/pages/BranchesPage.tsx`** (ACTUALIZADO)
   - Importa y usa `usePermissions`
   - Botones condicionales según permisos
   - Indicador de solo lectura

---

## 📚 Uso del Hook en Otros Componentes

### Ejemplo Básico

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('view_users')) {
    return <div>No tienes acceso</div>;
  }

  return (
    <div>
      {hasPermission('create_users') && (
        <button>Crear Usuario</button>
      )}
    </div>
  );
}
```

### Verificar Múltiples Permisos

```typescript
const { hasAnyPermission, hasAllPermissions } = usePermissions();

// Usuario necesita AL MENOS UNO de estos permisos
if (hasAnyPermission('edit_users', 'delete_users')) {
  // Mostrar sección de gestión
}

// Usuario necesita TODOS estos permisos
if (hasAllPermissions('view_users', 'edit_users', 'delete_users')) {
  // Mostrar panel de administración completo
}
```

### Verificar Super Admin

```typescript
const { isSuperAdmin } = usePermissions();

if (isSuperAdmin()) {
  // Mostrar opciones exclusivas de Super Admin
}
```

---

## 🚀 Próximas Mejoras

### Corto Plazo

1. **Aplicar a Todas las Páginas**
   - UsersPage
   - QuestionsPage
   - ConsentsPage
   - SettingsPage

2. **Componente de Protección**
   ```typescript
   <ProtectedButton permission="edit_services">
     Editar
   </ProtectedButton>
   ```

3. **Tooltips Informativos**
   - Mostrar por qué un botón no está disponible
   - "Necesitas permiso: edit_services"

### Largo Plazo

1. **Protección de Rutas**
   - Redirigir si no tiene permiso
   - Mostrar página 403
   - Ocultar rutas en menú

2. **Caché de Permisos**
   - Cachear permisos del usuario
   - Actualizar al cambiar rol
   - Mejorar rendimiento

3. **Auditoría de Accesos**
   - Registrar intentos de acceso
   - Alertas de accesos denegados
   - Dashboard de seguridad

---

## 📖 Guía para Desarrolladores

### Agregar Protección a Nueva Página

1. **Importar el hook:**
```typescript
import { usePermissions } from '@/hooks/usePermissions';
```

2. **Usar en el componente:**
```typescript
const { hasPermission } = usePermissions();
const canEdit = hasPermission('edit_something');
```

3. **Renderizado condicional:**
```typescript
{canEdit && <button>Editar</button>}
```

### Mejores Prácticas

1. **Verificar permisos al inicio del componente**
   - No verificar en cada render
   - Usar variables booleanas

2. **Mostrar feedback claro**
   - "Solo lectura" si no puede editar
   - Tooltips explicativos
   - Mensajes de error claros

3. **Mantener consistencia**
   - Mismo patrón en todas las páginas
   - Mismos estilos para indicadores
   - Mismos mensajes

4. **No confiar solo en frontend**
   - Backend siempre valida
   - Frontend solo mejora UX
   - Seguridad en capas

---

## ✅ Resultado Final

### Para el Usuario Operador

**Antes:**
- Veía botones que no podía usar
- Recibía errores al intentar editar
- Confusión sobre sus permisos

**Después:**
- Solo ve lo que puede hacer
- Mensaje claro "Solo lectura"
- Experiencia fluida y clara

### Para el Sistema

**Antes:**
- Intentos fallidos de edición
- Logs de errores 403
- Mala experiencia de usuario

**Después:**
- Sin intentos fallidos
- Menos errores en logs
- Mejor experiencia de usuario
- Interfaz más profesional

---

**Desarrollado por:** Kiro AI  
**Fecha:** 6 de enero de 2026  
**Versión:** 1.0
