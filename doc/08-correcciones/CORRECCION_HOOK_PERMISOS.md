# Corrección: Hook de Permisos - Import Incorrecto

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ Corregido

---

## 🎯 Problema Identificado

El hook `usePermissions` estaba intentando importar desde `@/contexts/AuthContext` que no existe en el proyecto. El sistema usa **Zustand** para el manejo de estado, no Context API.

### Error en Consola

```
[plugin:vite:import-analysis] Failed to resolve import "@/contexts/AuthContext" from "src/hooks/usePermissions.ts". Does the file exist?
```

### Código Problemático

```typescript
// ❌ INCORRECTO
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth(); // useAuth no existe
  // ...
}
```

---

## 🔍 Causa Raíz

El proyecto utiliza **Zustand** como librería de manejo de estado global, no React Context API. El estado de autenticación se maneja en `authStore.ts`.

**Estructura Real del Proyecto:**
```
frontend/src/
├── store/
│   └── authStore.ts          ✅ Existe (Zustand)
└── contexts/
    └── ThemeContext.tsx      ✅ Existe
    └── AuthContext.tsx       ❌ NO existe
```

---

## ✨ Solución Implementada

### Código Corregido

**Archivo:** `frontend/src/hooks/usePermissions.ts`

```typescript
// ✅ CORRECTO
import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  // Usar Zustand store en lugar de Context
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.permissions?.includes(permission) || false;
  };

  // ... resto de funciones
}
```

### Cambios Realizados

1. **Import corregido:**
   ```typescript
   // Antes
   import { useAuth } from '@/contexts/AuthContext';
   
   // Después
   import { useAuthStore } from '@/store/authStore';
   ```

2. **Acceso al usuario corregido:**
   ```typescript
   // Antes
   const { user } = useAuth();
   
   // Después
   const user = useAuthStore((state) => state.user);
   ```

---

## 📊 Estructura de Zustand Store

### authStore.ts

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  initialize: () => {
    const user = authService.getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
}));
```

### Uso del Store

```typescript
// Obtener todo el estado
const { user, isAuthenticated, logout } = useAuthStore();

// Obtener solo el usuario (optimizado)
const user = useAuthStore((state) => state.user);

// Obtener solo isAuthenticated
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

---

## 🎓 Mejores Prácticas con Zustand

### 1. Selectores Específicos

**✅ Recomendado:**
```typescript
// Solo se re-renderiza cuando user cambia
const user = useAuthStore((state) => state.user);
```

**❌ No recomendado:**
```typescript
// Se re-renderiza cuando CUALQUIER parte del store cambia
const { user } = useAuthStore();
```

### 2. Múltiples Selectores

```typescript
// Si necesitas múltiples valores
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### 3. Acciones

```typescript
// Obtener acciones
const logout = useAuthStore((state) => state.logout);
const setUser = useAuthStore((state) => state.setUser);

// Usar acciones
logout();
setUser(newUser);
```

---

## 🔧 Verificación de Tipos

### Tipo User

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: Role;              // ✅ Tiene role
  branches: Branch[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}
```

### Tipo Role

```typescript
export interface Role {
  id: string;
  name: string;
  type: 'super_admin' | 'ADMIN_GENERAL' | 'ADMIN_SEDE' | 'OPERADOR';
  description?: string;
  permissions?: string[];  // ✅ Tiene permissions
}
```

**Verificación:**
- ✅ User tiene propiedad `role`
- ✅ Role tiene propiedad `permissions`
- ✅ Tipos correctamente definidos

---

## 🧪 Testing

### Verificar que Funciona

1. **Abrir DevTools Console**
2. **Verificar que no hay errores de import**
3. **Navegar a Servicios o Sedes**
4. **Verificar que los botones se muestran/ocultan correctamente**

### Casos de Prueba

```typescript
// Usuario Operador (solo view_services)
const { hasPermission } = usePermissions();

hasPermission('view_services')    // ✅ true
hasPermission('edit_services')    // ❌ false
hasPermission('delete_services')  // ❌ false
```

---

## 📚 Comparación: Context API vs Zustand

### Context API

```typescript
// Provider
<AuthContext.Provider value={{ user, login, logout }}>
  {children}
</AuthContext.Provider>

// Consumer
const { user } = useContext(AuthContext);
```

**Desventajas:**
- Más boilerplate
- Re-renders innecesarios
- Difícil de optimizar

### Zustand (Usado en este proyecto)

```typescript
// Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Consumer
const user = useAuthStore((state) => state.user);
```

**Ventajas:**
- ✅ Menos boilerplate
- ✅ Selectores optimizados
- ✅ Fácil de usar
- ✅ TypeScript friendly
- ✅ DevTools integrados

---

## 🚀 Resultado Final

### Antes (Error)

```
❌ Error en consola
❌ Página no carga
❌ Botones no funcionan
```

### Después (Funcional)

```
✅ Sin errores
✅ Página carga correctamente
✅ Botones se muestran/ocultan según permisos
✅ Hook funciona correctamente
```

---

## 📖 Guía para Desarrolladores

### Usar el Hook de Permisos

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return (
    <div>
      {hasPermission('edit_users') && (
        <button>Editar</button>
      )}
      
      {hasAnyPermission('edit_users', 'delete_users') && (
        <button>Gestionar</button>
      )}
    </div>
  );
}
```

### Acceder al Usuario Directamente

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  
  return <div>Hola, {user?.name}</div>;
}
```

### Acceder a Acciones

```typescript
import { useAuthStore } from '@/store/authStore';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  
  return <button onClick={logout}>Cerrar Sesión</button>;
}
```

---

## ✅ Checklist de Corrección

- [x] Corregido import en `usePermissions.ts`
- [x] Cambiado de Context API a Zustand
- [x] Verificado tipos de User y Role
- [x] Probado en navegador
- [x] Sin errores en consola
- [x] Botones funcionan correctamente
- [x] Documentación actualizada

---

**Desarrollado por:** Kiro AI  
**Fecha:** 6 de enero de 2026  
**Versión:** 1.0
