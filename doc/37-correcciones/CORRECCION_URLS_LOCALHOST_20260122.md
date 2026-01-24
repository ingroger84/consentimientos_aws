# Corrección de URLs Hardcodeadas con Localhost

**Fecha:** 2026-01-22  
**Versión:** 2.4.2  
**Tipo:** PATCH (corrección de bugs)  
**Estado:** ✅ Completado

---

## 🐛 Problema Identificado

Múltiples componentes del frontend tenían URLs hardcodeadas con `localhost:5173`, lo que causaba que:

1. **Modal de registro exitoso** en la landing page mostraba:
   - ❌ `http://nuevo-tenant.localhost:5173/login`
   
2. **Enlaces en páginas de administración** (Users, Services, Questions, Branches) mostraban:
   - ❌ `http://tenant.localhost:5173`

3. **Modal de estadísticas de tenant** mostraba:
   - ❌ `http://tenant.localhost:5173`

Esto hacía que los usuarios no pudieran acceder a sus cuentas desde producción.

---

## 🔍 Archivos Afectados

Se encontraron URLs hardcodeadas en **6 archivos**:

1. ✅ `frontend/src/components/landing/SignupModal.tsx`
2. ✅ `frontend/src/pages/UsersPage.tsx`
3. ✅ `frontend/src/pages/ServicesPage.tsx`
4. ✅ `frontend/src/pages/QuestionsPage.tsx`
5. ✅ `frontend/src/pages/BranchesPage.tsx`
6. ✅ `frontend/src/components/TenantStatsModal.tsx`

---

## ✅ Solución Implementada

### Cambio Aplicado

**Antes:**
```tsx
href={`http://${tenant.slug}.localhost:5173`}
// o
href={`http://${formData.slug}.localhost:5173/login`}
```

**Después:**
```tsx
href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}
// o
href={`https://${formData.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}/login`}
```

### Beneficios:

1. **Dinámico:** Usa la variable de entorno `VITE_BASE_DOMAIN`
2. **Fallback:** Si la variable no está definida, usa `archivoenlinea.com`
3. **HTTPS:** Usa protocolo seguro en producción
4. **Flexible:** Funciona en cualquier entorno

---

## 📋 Detalles de Correcciones

### 1. SignupModal.tsx (Modal de Registro)

**Ubicación:** Mensaje de éxito después de crear cuenta

**Antes:**
```tsx
<a href={`http://${formData.slug}.localhost:5173/login`}>
  Ir a Iniciar Sesión
</a>
```

**Después:**
```tsx
<a href={`https://${formData.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}/login`}>
  Ir a Iniciar Sesión
</a>
```

**Impacto:** Los nuevos usuarios ahora pueden acceder directamente a su cuenta después del registro.

---

### 2. UsersPage.tsx (Página de Usuarios)

**Ubicación:** Link al tenant en la información del usuario

**Antes:**
```tsx
<a href={`http://${tenant.slug}.localhost:5173`}>
```

**Después:**
```tsx
<a href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}>
```

---

### 3. ServicesPage.tsx (Página de Servicios)

**Ubicación:** Link al tenant en la información del servicio

**Cambio:** Igual que UsersPage.tsx

---

### 4. QuestionsPage.tsx (Página de Preguntas)

**Ubicación:** Link al tenant en la información de la pregunta

**Cambio:** Igual que UsersPage.tsx

---

### 5. BranchesPage.tsx (Página de Sucursales)

**Ubicación:** Link al tenant en la información de la sucursal

**Cambio:** Igual que UsersPage.tsx

---

### 6. TenantStatsModal.tsx (Modal de Estadísticas)

**Ubicación:** Link al tenant en el modal de estadísticas

**Antes:**
```tsx
<a href={`http://${tenant.slug}.localhost:5173`}>
  🔗 http://{tenant.slug}.localhost:5173
</a>
```

**Después:**
```tsx
<a href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}>
  🔗 https://{tenant.slug}.{import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}
</a>
```

---

## 🚀 Despliegue

### Pasos Ejecutados:

1. ✅ Corrección de 6 archivos
2. ✅ Commit a GitHub
3. ✅ Pull en servidor de producción
4. ✅ Recompilación del frontend
5. ✅ Reinicio del backend
6. ✅ Verificación de funcionamiento

### Versión Desplegada:
- **Frontend:** 2.4.2
- **Backend:** 2.4.2

---

## ✅ Verificación

### Escenarios de Prueba:

#### 1. Registro desde Landing Page

1. Ir a https://archivoenlinea.com
2. Hacer clic en "Comenzar Ahora"
3. Completar formulario de registro
4. Verificar mensaje de éxito
5. **Verificar que el botón "Ir a Iniciar Sesión" apunte a:**
   - ✅ `https://nuevo-tenant.archivoenlinea.com/login`
   - ❌ NO `http://nuevo-tenant.localhost:5173/login`

#### 2. Panel de Super Admin

1. Ir a https://admin.archivoenlinea.com
2. Iniciar sesión como Super Admin
3. Ir a cualquier sección (Users, Services, Questions, Branches)
4. **Verificar que los links de tenant apunten a:**
   - ✅ `https://tenant.archivoenlinea.com`
   - ❌ NO `http://tenant.localhost:5173`

#### 3. Modal de Estadísticas

1. En el panel de Super Admin
2. Abrir modal de estadísticas de un tenant
3. **Verificar que el link apunte a:**
   - ✅ `https://tenant.archivoenlinea.com`
   - ❌ NO `http://tenant.localhost:5173`

---

## 📊 Resumen de Cambios

### Estadísticas:
- **Archivos modificados:** 6
- **Líneas cambiadas:** ~17
- **URLs corregidas:** 7
- **Protocolo:** HTTP → HTTPS
- **Dominio:** localhost:5173 → archivoenlinea.com (dinámico)

### Impacto:
- ✅ **Registro:** Los nuevos usuarios pueden acceder a su cuenta
- ✅ **Administración:** Los links funcionan correctamente
- ✅ **Producción:** Todo apunta al dominio correcto
- ✅ **Seguridad:** Usa HTTPS en lugar de HTTP

---

## 🎯 Mejoras Futuras

### Centralizar Construcción de URLs

Considerar crear una función utilitaria:

```typescript
// frontend/src/utils/tenant-url.ts
export const getTenantUrl = (slug: string, path: string = '') => {
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com';
  const protocol = import.meta.env.DEV ? 'http' : 'https';
  const port = import.meta.env.DEV ? ':5173' : '';
  
  return `${protocol}://${slug}.${baseDomain}${port}${path}`;
};

// Uso:
getTenantUrl('demo-estetica', '/login')
// Desarrollo: http://demo-estetica.localhost:5173/login
// Producción: https://demo-estetica.archivoenlinea.com/login
```

Esto facilitaría:
- Mantenimiento del código
- Cambios futuros de dominio
- Testing y desarrollo
- Consistencia en toda la aplicación

---

## ✨ Resumen

**Problema:** URLs hardcodeadas con localhost impedían acceso a tenants en producción

**Solución:** 
- Reemplazadas todas las URLs hardcodeadas por URLs dinámicas
- Uso de variable de entorno `VITE_BASE_DOMAIN`
- Fallback a `archivoenlinea.com`
- Protocolo HTTPS en producción

**Resultado:**
- ✅ Registro funciona correctamente
- ✅ Links en panel de admin funcionan
- ✅ Usuarios pueden acceder a sus cuentas
- ✅ Todo apunta al dominio correcto
- ✅ Versión 2.4.2 desplegada

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Versión:** 2.4.2  
**Estado:** ✅ Completado y Verificado
