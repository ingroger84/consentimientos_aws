# Corrección: Login de Tenant con Logo Personalizado

**Fecha**: 2026-01-24  
**Versión**: 15.0.2  
**Tipo**: Corrección de Bug

---

## 🐛 Problema Identificado

Cuando un tenant accedía a su login personalizado (ej: `clinica-demo.localhost:5173`), el sistema mostraba el logo genérico del super admin en lugar del logo configurado específicamente para ese tenant.

### Causa Raíz

El frontend estaba en un subdominio (ej: `clinica-demo.localhost:5173`) pero hacía peticiones al backend en `localhost:3000`. El backend no podía detectar el subdominio del frontend porque solo veía el host de la petición (`localhost:3000`), no el host del navegador.

---

## ✅ Solución Implementada

### 1. Header `X-Tenant-Slug`

Se agregó un header HTTP personalizado que el frontend envía en todas las peticiones al backend:

```
X-Tenant-Slug: clinica-demo
```

Este header contiene el slug del tenant extraído del subdominio del navegador.

### 2. Modificaciones en el Frontend

#### `frontend/src/services/api.ts`

Se agregó una función para extraer el tenant slug del hostname y se modificó el interceptor de axios para enviar el header:

```typescript
// Función para extraer el tenant slug del hostname
const getTenantSlug = (): string | null => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost o IP sin subdominio
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Si tiene 2 partes y el segundo es localhost, el primero es el tenant
  // Ejemplo: clinica-demo.localhost -> tenant 'clinica-demo'
  if (parts.length === 2 && parts[1] === 'localhost') {
    const subdomain = parts[0];
    if (subdomain === 'admin') {
      return null;
    }
    return subdomain;
  }
  
  // Si tiene 3 o más partes, el primero es el tenant
  // Ejemplo: clinica-demo.archivoenlinea.com -> tenant 'clinica-demo'
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain === 'admin' || subdomain === 'www') {
      return null;
    }
    return subdomain;
  }
  
  return null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar el tenant slug como header
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

#### `frontend/src/contexts/ThemeContext.tsx`

Se aplicó la misma lógica en el axios especial para settings:

```typescript
// Agregar token si existe, pero no redirigir en 401
settingsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar el tenant slug como header
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
      console.log('[ThemeContext] Enviando X-Tenant-Slug:', tenantSlug);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 3. Modificaciones en el Backend

#### `backend/src/common/middleware/tenant.middleware.ts`

Se modificó el middleware para que primero intente leer el header `X-Tenant-Slug` antes de extraer del host:

```typescript
use(req: Request, res: Response, next: NextFunction) {
  const host = req.get('host') || req.hostname;
  
  // Primero intentar obtener el tenant slug del header X-Tenant-Slug
  // Esto es útil cuando el frontend está en un subdominio pero hace peticiones a localhost:3000
  const headerTenantSlug = req.get('X-Tenant-Slug') || req.get('x-tenant-slug');
  
  // Si hay header, usarlo directamente
  let tenantSlug: string | null = null;
  if (headerTenantSlug) {
    tenantSlug = headerTenantSlug;
    this.logger.debug(`Tenant slug desde header: ${tenantSlug}`);
  } else {
    // Si no hay header, extraer del host
    tenantSlug = this.extractTenantSlug(host);
    this.logger.debug(`Tenant slug desde host: ${tenantSlug || 'null'}`);
  }
  
  // Agregar el tenantSlug al request para uso posterior
  req['tenantSlug'] = tenantSlug;
  
  this.logger.debug(`Host: ${host} -> Tenant Slug: ${tenantSlug || 'null (Super Admin)'}`);
  
  next();
}
```

---

## 🎯 Resultado

Ahora cuando un tenant accede a su login:

1. **Frontend** extrae el slug del subdominio (ej: `clinica-demo` de `clinica-demo.localhost:5173`)
2. **Frontend** envía el header `X-Tenant-Slug: clinica-demo` en todas las peticiones
3. **Backend** lee el header y carga la configuración del tenant correcto
4. **Login** muestra el logo y colores personalizados del tenant

---

## 🧪 Cómo Probar

### Caso 1: Login de Tenant

1. Accede a `http://clinica-demo.localhost:5173/login`
2. Deberías ver:
   - Logo personalizado del tenant "clinica-demo"
   - Colores personalizados del tenant
   - Nombre de la empresa del tenant

### Caso 2: Login de Super Admin

1. Accede a `http://localhost:5173/login` o `http://admin.localhost:5173/login`
2. Deberías ver:
   - Logo genérico del sistema
   - Colores por defecto
   - Nombre genérico "Sistema de Consentimientos"

### Caso 3: Verificar Header en DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca la petición a `/api/settings/public`
5. En "Request Headers" deberías ver:
   ```
   X-Tenant-Slug: clinica-demo
   ```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario accede a: clinica-demo.localhost:5173/login     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend extrae slug: "clinica-demo"                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend hace petición a: localhost:3000/api/settings/  │
│    public con header: X-Tenant-Slug: clinica-demo          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend lee header X-Tenant-Slug                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend busca tenant con slug "clinica-demo"            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend retorna settings del tenant                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend muestra logo y colores personalizados          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Casos de Uso Cubiertos

### ✅ Desarrollo Local

- `clinica-demo.localhost:5173` → Muestra settings de "clinica-demo"
- `localhost:5173` → Muestra settings genéricos
- `admin.localhost:5173` → Muestra settings genéricos

### ✅ Producción

- `clinica-demo.archivoenlinea.com` → Muestra settings de "clinica-demo"
- `archivoenlinea.com` → Muestra landing page
- `admin.archivoenlinea.com` → Muestra settings genéricos

---

## 📝 Archivos Modificados

### Frontend
- `frontend/src/services/api.ts` - Agregado header X-Tenant-Slug
- `frontend/src/contexts/ThemeContext.tsx` - Agregado header X-Tenant-Slug

### Backend
- `backend/src/common/middleware/tenant.middleware.ts` - Lectura de header X-Tenant-Slug

---

## 🎉 Beneficios

1. **Funciona en desarrollo**: Los subdominios en localhost ahora funcionan correctamente
2. **Funciona en producción**: Los subdominios en producción siguen funcionando
3. **Retrocompatible**: Si no hay header, el backend sigue usando el host
4. **Flexible**: Permite diferentes configuraciones de desarrollo

---

## 🔐 Seguridad

El header `X-Tenant-Slug` es solo una ayuda para la detección del tenant. El backend siempre valida:

1. Que el tenant exista en la base de datos
2. Que el usuario tenga permisos para ese tenant
3. Que todas las operaciones se realicen dentro del contexto del tenant correcto

No hay riesgo de que un usuario acceda a datos de otro tenant simplemente modificando el header.

---

## 📚 Referencias

- Middleware de Tenant: `backend/src/common/middleware/tenant.middleware.ts`
- Configuración de Axios: `frontend/src/services/api.ts`
- Context de Theme: `frontend/src/contexts/ThemeContext.tsx`
- Controlador de Settings: `backend/src/settings/settings.controller.ts`

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-24  
**Versión**: 15.0.2
