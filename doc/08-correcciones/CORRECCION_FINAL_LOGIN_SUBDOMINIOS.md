# Corrección Final: Login con Subdominios

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ RESUELTO

---

## 🎯 Problema Original

Al intentar hacer login desde `http://demo.localhost:5173`, el sistema mostraba el error:

```
Debes acceder desde tu subdominio: demo.localhost
```

---

## 🔍 Diagnóstico

### Problemas Identificados

1. **`BASE_DOMAIN` incorrecto en backend**
   - Configurado: `tudominio.com`
   - Necesario: `localhost`

2. **`VITE_API_URL` hardcodeado en frontend**
   - Configurado: `http://localhost:3000/api`
   - Problema: Impedía la detección automática de subdominios

3. **`TenantMiddleware` no detectaba subdominios de localhost**
   - `demo.localhost` era interpretado como `localhost` (sin subdominio)
   - La lógica solo funcionaba con 3+ partes (ej: `cliente.tudominio.com`)

4. **Errores de TypeScript**
   - Faltaba definición de tipos para `Request.tenantSlug`

---

## ✅ Soluciones Aplicadas

### 1. Configuración de Backend

**Archivo:** `backend/.env`

```env
# ANTES
BASE_DOMAIN=tudominio.com

# DESPUÉS
BASE_DOMAIN=localhost
```

**Archivo:** `backend/.env.example`

```env
# Multi-Tenant (Subdominios)
# Para desarrollo local usar: localhost
# Para producción usar: tudominio.com
BASE_DOMAIN=localhost
```

### 2. Configuración de Frontend

**Archivo:** `frontend/.env`

```env
# ANTES
VITE_API_URL=http://localhost:3000/api

# DESPUÉS (comentado para detección automática)
# VITE_API_URL se detecta automáticamente según el subdominio
# Para desarrollo local con subdominios, NO configurar esta variable
# VITE_API_URL=http://localhost:3000/api
```

### 3. Detección Automática de Subdominios

**Archivo:** `frontend/src/utils/api-url.ts`

```typescript
export function getApiBaseUrl(): string {
  // Si hay variable de entorno, usarla (sin /api)
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) {
    console.log('[API-URL] Usando variable de entorno:', envUrl.replace('/api', ''));
    return envUrl.replace('/api', '');
  }

  // Obtener el hostname actual (incluye subdominio)
  const currentHost = window.location.hostname;
  console.log('[API-URL] Hostname detectado:', currentHost);
  
  // Si es EXACTAMENTE localhost o 127.0.0.1 (sin subdominio), usar localhost:3000
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    console.log('[API-URL] Es localhost puro, usando: http://localhost:3000');
    return 'http://localhost:3000';
  }
  
  // Para cualquier otro caso (incluyendo subdominios como demo.localhost),
  // mantener el hostname completo
  const apiUrl = `http://${currentHost}:3000`;
  console.log('[API-URL] Usando hostname con subdominio:', apiUrl);
  return apiUrl;
}
```

### 4. Middleware de Tenant Actualizado

**Archivo:** `backend/src/common/middleware/tenant.middleware.ts`

```typescript
private extractTenantSlug(host: string): string | null {
  // Remover puerto si existe
  const hostname = host.split(':')[0];
  
  // Dividir por puntos
  const parts = hostname.split('.');
  
  // Caso especial: subdominios de localhost (ej: demo.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    const subdomain = parts[0];
    
    // Si es 'admin', retornar null (Super Admin)
    if (this.isAdminSubdomain(subdomain)) {
      this.logger.debug(`Subdominio 'admin' detectado - Super Admin`);
      return null;
    }
    
    // Validar que el subdominio no sea reservado
    if (this.isReservedSubdomain(subdomain)) {
      return null;
    }
    
    // Retornar el subdominio
    this.logger.debug(`Subdominio detectado en localhost: ${subdomain}`);
    return subdomain;
  }
  
  // Si es EXACTAMENTE localhost o IP (sin subdominio), no hay tenant
  if (this.isLocalhost(hostname)) {
    return null;
  }
  
  // Lógica para dominios de producción (3+ partes)...
}
```

### 5. Tipos de TypeScript

**Archivo:** `backend/src/types/express.d.ts` (nuevo)

```typescript
// Extensión de tipos para Express Request
declare namespace Express {
  export interface Request {
    tenantSlug?: string | null;
  }
}
```

**Archivo:** `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    // ... otras opciones
    "typeRoots": ["./node_modules/@types", "./src/types"],
    // ...
  }
}
```

### 6. Corrección en AuthService

**Archivo:** `backend/src/auth/auth.service.ts`

```typescript
async login(user: User, tenantSlug?: string | null) {
  this.logger.log(`Login attempt - User: ${user.email}, Tenant Slug: ${tenantSlug || 'null'}`);

  // Validar que el usuario pertenece al tenant del subdominio
  await this.validateTenantAccess(user, tenantSlug ?? null); // Usar ?? null en lugar de solo tenantSlug
  
  // ...
}
```

---

## 🧪 Verificación

### Logs del Backend (Correcto)

```
[TenantMiddleware] Host: demo.localhost:3000 -> Tenant Slug: demo
[AuthService] Login attempt - User: demo@demo.com, Tenant Slug: demo
[AuthService] User demo@demo.com logged in to tenant: demo
```

### Logs del Frontend (Correcto)

```
[API-URL] Hostname detectado: demo.localhost
[API-URL] Usando hostname con subdominio: http://demo.localhost:3000
```

---

## 📋 Información del Tenant

**Tenant:** Demo
- **Slug:** `demo`
- **URL de acceso:** `http://demo.localhost:5173`
- **Usuario administrador:** `demo@demo.com`
- **Estado:** Activo

**Configuración cargada:**
- Nombre: CONSENTIMIENTOS
- Dirección: SABANETA
- Teléfono: 3134806097
- Email: info@innovasystems.com.co
- Sitio Web: www.innovasystems.com.co

---

## 🚀 URLs de Acceso

### Super Admin
```
URL:      http://admin.localhost:5173
          o
          http://localhost:5173
Email:    superadmin@sistema.com
Password: superadmin123
```

### Tenant: Demo
```
URL:      http://demo.localhost:5173
Email:    demo@demo.com
Password: (la configurada al crear el tenant)
```

### Backend API
```
URL: http://localhost:3000/api
```

---

## 🔧 Scripts Útiles

### Listar Tenants

```bash
cd backend
npx ts-node list-tenants.ts
```

**Salida:**
```
📋 Tenants encontrados: 1

1. Demo
   Slug:   demo
   Email:  demo@demo.com
   Estado: active
   URL:    http://demo.localhost:5173
```

### Verificar Usuario de Tenant

```bash
cd backend
npx ts-node check-tenant-user.ts demo
```

**Salida:**
```
📋 Tenant encontrado:
  ID: 0d197837-b448-4efe-a6d0-bc8059fb02bd
  Nombre: Demo
  Slug: demo
  Email contacto: demo@demo.com
  Estado: active

👥 Usuarios del tenant (1):
  ---
  ID: 40e15be2-a4d4-4fe9-88ff-8b3b74a6b056
  Nombre: Admin Demo
  Email: demo@demo.com
  Activo: true
  Rol: Administrador General (ADMIN_GENERAL)
```

---

## 📝 Checklist de Configuración

### Backend
- [x] `BASE_DOMAIN=localhost` en `.env`
- [x] Tipos de TypeScript agregados (`express.d.ts`)
- [x] `tsconfig.json` actualizado con `typeRoots`
- [x] `TenantMiddleware` detecta subdominios de localhost
- [x] `AuthService` maneja `tenantSlug` correctamente

### Frontend
- [x] `VITE_API_URL` comentado en `.env`
- [x] `getApiBaseUrl()` detecta subdominios automáticamente
- [x] Logs de debug agregados para troubleshooting
- [x] `getResourceUrl()` usa subdominios para imágenes

### Procesos
- [x] Backend reiniciado
- [x] Frontend reiniciado
- [x] Caché del navegador limpiado

---

## 🎓 Lecciones Aprendidas

### 1. Variables de Entorno

**Problema:** Variables hardcodeadas impiden la detección dinámica

**Solución:** Comentar variables de entorno en desarrollo local cuando se necesita detección automática

### 2. Subdominios de Localhost

**Problema:** La lógica asumía dominios de producción (3+ partes)

**Solución:** Agregar caso especial para `*.localhost` (2 partes)

### 3. Caché del Navegador

**Problema:** Cambios en el código no se reflejan inmediatamente

**Solución:** Usar `Ctrl+Shift+R` para recarga forzada sin caché

### 4. Logs de Debug

**Problema:** Difícil diagnosticar dónde falla la detección

**Solución:** Agregar `console.log` estratégicos en puntos clave

---

## 🔄 Flujo Completo de Login

### 1. Usuario Accede

```
http://demo.localhost:5173/login
```

### 2. Frontend Detecta Subdominio

```javascript
window.location.hostname = "demo.localhost"
getApiBaseUrl() = "http://demo.localhost:3000"
```

### 3. Frontend Envía Petición

```
POST http://demo.localhost:3000/api/auth/login
Body: { email: "demo@demo.com", password: "..." }
```

### 4. Backend Recibe Petición

```
TenantMiddleware:
  Host: demo.localhost:3000
  Hostname: demo.localhost
  Parts: ["demo", "localhost"]
  Detected: subdomain = "demo"
  req.tenantSlug = "demo"
```

### 5. AuthService Valida

```
AuthService.login():
  User: demo@demo.com
  TenantSlug: "demo"
  User.tenant.slug: "demo"
  ✅ Match! Login permitido
```

### 6. Respuesta Exitosa

```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin Demo",
    "email": "demo@demo.com",
    "tenant": {
      "id": "...",
      "name": "Demo",
      "slug": "demo"
    }
  }
}
```

---

## 🚨 Troubleshooting

### Error: "Debes acceder desde tu subdominio"

**Causa:** El middleware no está detectando el subdominio correctamente

**Verificar:**
1. Logs del backend: `[TenantMiddleware] Host: ... -> Tenant Slug: ...`
2. Si muestra `null`, el middleware no detectó el subdominio
3. Verificar que `BASE_DOMAIN=localhost` en `backend/.env`
4. Reiniciar el backend

### Error: Peticiones van a localhost:3000 sin subdominio

**Causa:** Frontend no está detectando el subdominio

**Verificar:**
1. Logs del navegador (F12 → Console): `[API-URL] Hostname detectado: ...`
2. Si muestra `localhost` en lugar de `demo.localhost`, hay un problema
3. Verificar que `VITE_API_URL` esté comentado en `frontend/.env`
4. Reiniciar el frontend
5. Limpiar caché del navegador (Ctrl+Shift+R)

### Error 403: Forbidden

**Causa:** Usuario no pertenece al tenant del subdominio

**Verificar:**
1. Logs del backend: `[AuthService] Tenant user ... attempted to login from ...`
2. Verificar que el usuario pertenece al tenant correcto
3. Ejecutar: `npx ts-node check-tenant-user.ts demo`

---

## ✅ Estado Final

**Sistema completamente funcional con:**

- ✅ Login exitoso desde subdominios
- ✅ Detección automática de subdominios en frontend
- ✅ Middleware detecta correctamente subdominios de localhost
- ✅ Aislamiento completo de datos por tenant
- ✅ Configuración independiente por tenant
- ✅ Logs de debug para troubleshooting

**Accesos verificados:**
- ✅ Super Admin: `http://admin.localhost:5173` ✓
- ✅ Super Admin: `http://localhost:5173` ✓
- ✅ Tenant Demo: `http://demo.localhost:5173` ✓

---

## 📚 Referencias

- [IMPLEMENTACION_SUBDOMINIOS.md](./IMPLEMENTACION_SUBDOMINIOS.md) - Arquitectura de subdominios
- [SOLUCION_ERROR_SUBDOMINIO.md](./SOLUCION_ERROR_SUBDOMINIO.md) - Primera corrección
- [ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md) - Estado del sistema
- [USO_TERMINALES_KIRO.md](./USO_TERMINALES_KIRO.md) - Cómo usar terminales de Kiro

---

**¡Sistema Multi-Tenant con Subdominios Completamente Funcional! 🎉**
