# Implementación de Subdominios Multi-Tenant

## Descripción General

El sistema ahora soporta **gestión de tenants mediante subdominios**, permitiendo una arquitectura SaaS multi-tenant completa donde cada cliente (tenant) opera desde su propio subdominio exclusivo.

## Arquitectura

### Flujo de Autenticación por Subdominio

```
1. Usuario accede a: cliente1.tudominio.com
2. TenantMiddleware detecta el subdominio: "cliente1"
3. Usuario intenta hacer login
4. AuthService valida que el usuario pertenece al tenant "cliente1"
5. Si es válido, genera JWT con información del tenant
6. TenantGuard valida todas las peticiones subsiguientes
```

### Componentes Implementados

#### 1. TenantMiddleware
**Ubicación:** `backend/src/common/middleware/tenant.middleware.ts`

**Responsabilidad:** Detectar y extraer el slug del tenant desde el subdominio.

**Funcionamiento:**
- Analiza el `host` header de cada request
- Extrae el subdominio (primera parte del hostname)
- Valida que no sea un subdominio reservado (www, api, admin, etc.)
- Agrega `tenantSlug` al request para uso posterior

**Ejemplos:**
```typescript
// cliente1.tudominio.com -> tenantSlug = 'cliente1'
// tudominio.com -> tenantSlug = null (Super Admin)
// localhost:3000 -> tenantSlug = null (Desarrollo)
// www.tudominio.com -> tenantSlug = null (Reservado)
```

#### 2. TenantGuard
**Ubicación:** `backend/src/common/guards/tenant.guard.ts`

**Responsabilidad:** Validar que el usuario autenticado tenga acceso al tenant del subdominio.

**Reglas de Validación:**
1. **Dominio base (sin subdominio):**
   - Solo Super Admin puede acceder
   - Usuarios de tenant son rechazados

2. **Subdominio específico:**
   - Solo usuarios del tenant correspondiente pueden acceder
   - Super Admin es rechazado
   - Usuarios de otros tenants son rechazados

**Excepciones:**
- Rutas marcadas con `@AllowAnyTenant()` no son validadas

#### 3. AuthService (Actualizado)
**Ubicación:** `backend/src/auth/auth.service.ts`

**Nuevas Validaciones en Login:**
```typescript
async login(user: User, tenantSlug?: string | null) {
  // Validar que el usuario pertenece al tenant del subdominio
  await this.validateTenantAccess(user, tenantSlug);
  
  // Generar JWT con información del tenant
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role?.type,
    tenantId: user.tenant?.id || null,
    tenantSlug: user.tenant?.slug || null,
  };
  
  return { access_token, user };
}
```

**Mensajes de Error Específicos:**
- Usuario de tenant intenta acceder al dominio base: "Debes acceder desde tu subdominio: cliente1.tudominio.com"
- Super Admin intenta acceder a subdominio: "El Super Admin debe acceder desde el dominio base"
- Usuario intenta acceder a subdominio incorrecto: "No tienes acceso a este tenant. Tu subdominio es: cliente1.tudominio.com"
- Tenant suspendido: "Esta cuenta está suspendida. Contacta al administrador."
- Tenant expirado: "Esta cuenta ha expirado. Contacta al administrador."

#### 4. Decoradores Personalizados

**@TenantSlug()**
```typescript
// Obtener el slug del tenant en cualquier controlador
@Get('data')
getData(@TenantSlug() tenantSlug: string | null) {
  // tenantSlug = 'cliente1' o null
}
```

**@AllowAnyTenant()**
```typescript
// Permitir acceso desde cualquier subdominio
@Get('public')
@AllowAnyTenant()
getPublicData() {
  // No se valida el tenant
}
```

## Configuración

### Variables de Entorno

Agregar en `.env`:
```env
# Multi-Tenant (Subdominios)
BASE_DOMAIN=tudominio.com
```

### CORS

El sistema está configurado para aceptar requests desde:
- El dominio base: `tudominio.com`
- Cualquier subdominio: `*.tudominio.com`
- Localhost (desarrollo): `localhost:5173`

## Casos de Uso

### Caso 1: Super Admin

**Acceso:**
- URL: `https://admin.tudominio.com`
- Login: `superadmin@sistema.com`

**Permisos:**
- Gestionar todos los tenants
- Ver estadísticas globales
- Crear/editar/eliminar tenants
- Configuración global del sistema

**Restricciones:**
- NO puede acceder a subdominios de tenants
- NO puede ver datos específicos de tenants

### Caso 2: Usuario de Tenant

**Acceso:**
- URL: `https://cliente1.tudominio.com`
- Login: `admin@cliente1.com`

**Permisos:**
- Gestionar usuarios de su tenant
- Gestionar sedes, servicios y consentimientos
- Configuración avanzada de su tenant
- Ver estadísticas de su tenant

**Restricciones:**
- NO puede acceder al dominio base
- NO puede acceder a subdominios de otros tenants
- NO puede ver datos de otros tenants

### Caso 3: Desarrollo Local

**Acceso:**
- URL: `http://localhost:5173`
- Login: Cualquier usuario

**Comportamiento:**
- En localhost, el sistema NO detecta subdominios
- Se comporta como el panel de Super Admin
- Útil para desarrollo y pruebas

## Flujo de Creación de Tenant

1. **Super Admin crea tenant:**
   ```
   POST /api/tenants
   {
     "name": "Clínica ABC",
     "slug": "clinica-abc",
     "contactEmail": "admin@clinica-abc.com",
     ...
   }
   ```

2. **Sistema crea:**
   - Registro del tenant en BD
   - Usuario administrador del tenant
   - Configuración inicial del tenant

3. **Notificación al cliente:**
   - Email con credenciales
   - URL de acceso: `https://clinica-abc.tudominio.com`
   - Instrucciones de primer acceso

4. **Cliente accede:**
   - Navega a su subdominio
   - Hace login con sus credenciales
   - Sistema valida que pertenece al tenant
   - Accede a su panel personalizado

## Seguridad

### Aislamiento de Datos

✅ **Nivel de Middleware:** Detecta el tenant desde el subdominio
✅ **Nivel de Autenticación:** Valida que el usuario pertenece al tenant
✅ **Nivel de Guard:** Valida cada request contra el tenant
✅ **Nivel de Servicio:** Filtra datos por tenantId
✅ **Nivel de Base de Datos:** Foreign keys y constraints

### Validaciones Implementadas

1. **Subdominio válido:** No permite subdominios reservados
2. **Usuario válido:** Debe pertenecer al tenant del subdominio
3. **Tenant activo:** Valida estado (active, suspended, expired)
4. **Token válido:** JWT incluye información del tenant
5. **Permisos:** Valida permisos específicos del rol

### Prevención de Ataques

- **Subdomain Takeover:** Validación estricta de slugs únicos
- **Cross-Tenant Access:** Guard valida en cada request
- **Session Hijacking:** JWT incluye tenantId y se valida
- **CORS:** Solo permite origins autorizados
- **Rate Limiting:** Por IP y por tenant

## Despliegue en Producción

### DNS Configuration

Configurar wildcard DNS para subdominios:
```
A    @              -> IP_DEL_SERVIDOR
A    *              -> IP_DEL_SERVIDOR
CNAME www          -> tudominio.com
```

### SSL/TLS

Usar certificado wildcard:
```bash
# Let's Encrypt
certbot certonly --dns-cloudflare \
  -d tudominio.com \
  -d *.tudominio.com
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com *.tudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }
}
```

### Variables de Entorno (Producción)

```env
NODE_ENV=production
BASE_DOMAIN=tudominio.com
CORS_ORIGIN=https://tudominio.com
JWT_SECRET=<strong-random-secret>
```

## Testing

### Pruebas Locales con Subdominios

Editar `/etc/hosts` (Linux/Mac) o `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 tudominio.local
127.0.0.1 admin.tudominio.local
127.0.0.1 cliente1.tudominio.local
127.0.0.1 cliente2.tudominio.local
```

Actualizar `.env`:
```env
BASE_DOMAIN=tudominio.local
CORS_ORIGIN=http://admin.tudominio.local:5173
```

Acceder a:
- `http://admin.tudominio.local:5173` (Super Admin)
- `http://cliente1.tudominio.local:5173` (Tenant 1)
- `http://cliente2.tudominio.local:5173` (Tenant 2)

### Casos de Prueba

1. ✅ Super Admin puede acceder al dominio base
2. ✅ Super Admin NO puede acceder a subdominios
3. ✅ Usuario de tenant puede acceder a su subdominio
4. ✅ Usuario de tenant NO puede acceder al dominio base
5. ✅ Usuario de tenant NO puede acceder a otros subdominios
6. ✅ Tenant suspendido no puede hacer login
7. ✅ Tenant expirado no puede hacer login
8. ✅ Subdominios reservados (www, api) no son tratados como tenants

## Monitoreo y Logs

El sistema registra:
- Detección de subdominios
- Intentos de login por subdominio
- Validaciones de acceso
- Errores de tenant

Ejemplo de logs:
```
[TenantMiddleware] Host: cliente1.tudominio.com -> Tenant Slug: cliente1
[AuthService] Login attempt - User: admin@cliente1.com, Tenant Slug: cliente1
[AuthService] User admin@cliente1.com logged in to tenant: cliente1
[TenantGuard] Validando acceso - Subdominio: cliente1, Usuario: admin@cliente1.com
```

## Beneficios

✅ **Escalabilidad:** Agregar nuevos tenants sin cambios en infraestructura
✅ **Aislamiento:** Separación completa de datos y configuración
✅ **Personalización:** Cada tenant tiene su propia identidad
✅ **Seguridad:** Múltiples capas de validación
✅ **UX:** URLs amigables y profesionales
✅ **SEO:** Cada tenant puede tener su propio SEO
✅ **Branding:** Subdominios refuerzan la marca del cliente

## Próximos Pasos

1. ⏳ Implementar detección de subdominio en el frontend
2. ⏳ Agregar redirección automática al subdominio correcto
3. ⏳ Implementar custom domains (dominios propios por tenant)
4. ⏳ Agregar analytics por tenant
5. ⏳ Implementar rate limiting por tenant
6. ⏳ Agregar logs de auditoría por tenant

## Soporte

Para más información o soporte, consultar:
- Documentación técnica: `/doc`
- Logs del sistema: Backend console
- Configuración: `.env` y `backend/src/common/`
