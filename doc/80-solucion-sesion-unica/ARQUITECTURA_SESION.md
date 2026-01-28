# Arquitectura del Sistema de Sesión Única

## Visión General

El sistema de sesión única garantiza que un usuario solo pueda tener una sesión activa a la vez. Cuando el usuario inicia sesión en un nuevo dispositivo o navegador, todas las sesiones anteriores se cierran automáticamente.

## Componentes

### 1. Backend

#### SessionService
**Archivo:** `backend/src/auth/services/session.service.ts`

**Responsabilidades:**
- Crear nuevas sesiones
- Validar sesiones existentes
- Cerrar sesiones (individual o todas)
- Limpiar sesiones expiradas
- Actualizar última actividad

**Métodos Principales:**

```typescript
// Crea una nueva sesión y cierra todas las anteriores
async createSession(
  userId: string,
  jwtToken: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<UserSession>

// Valida que una sesión esté activa
async validateSession(jwtToken: string): Promise<boolean>

// Cierra una sesión específica
async closeSession(sessionToken: string): Promise<void>

// Cierra todas las sesiones de un usuario
async closeAllUserSessions(userId: string): Promise<number>
```

**Flujo de createSession:**
```
1. Generar hash SHA-256 del JWT token
2. Cerrar TODAS las sesiones activas del usuario
3. Calcular fecha de expiración (24 horas)
4. Crear nueva sesión en BD
5. Retornar sesión creada
```

**Flujo de validateSession:**
```
1. Generar hash SHA-256 del JWT token
2. Buscar sesión por hash en BD
3. Verificar que esté activa (isActive = true)
4. Verificar que no haya expirado
5. Actualizar última actividad
6. Retornar true/false
```

#### SessionGuard
**Archivo:** `backend/src/auth/guards/session.guard.ts`

**Responsabilidades:**
- Validar cada request HTTP
- Verificar que la sesión esté activa
- Permitir skip en rutas específicas

**Flujo:**
```
1. Verificar si la ruta tiene @SkipSessionCheck
   → Si tiene, permitir acceso
2. Extraer JWT token del header Authorization
3. Llamar a sessionService.validateSession(token)
4. Si válida → Permitir acceso
5. Si inválida → Lanzar UnauthorizedException (401)
```

**Decorador @SkipSessionCheck:**
```typescript
// Permite que una ruta NO sea validada por el SessionGuard
@SkipSessionCheck()
@Get('validate')
async validate() { ... }
```

**Rutas que usan @SkipSessionCheck:**
- `/auth/login` - Login inicial
- `/auth/validate` - Validación de token
- `/auth/refresh-token` - Refresh de token
- `/auth/forgot-password` - Recuperar contraseña
- `/auth/reset-password` - Resetear contraseña
- `/auth/magic-login/:token` - Login mágico
- `/auth/version` - Versión de la API
- `/auth/logout` - Logout (usa JwtAuthGuard pero no SessionGuard)
- `/auth/logout-all` - Logout de todas las sesiones

#### AuthService
**Archivo:** `backend/src/auth/auth.service.ts`

**Método login:**
```typescript
async login(
  user: User,
  tenantSlug?: string | null,
  userAgent?: string,
  ipAddress?: string,
) {
  // 1. Validar acceso al tenant
  await this.validateTenantAccess(user, tenantSlug);

  // 2. Generar JWT payload
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role?.type,
    tenantId: user.tenant?.id || null,
    tenantSlug: user.tenant?.slug || null,
  };

  // 3. Firmar JWT
  const access_token = this.jwtService.sign(payload);

  // 4. Crear sesión (cierra sesiones anteriores)
  await this.sessionService.createSession(
    user.id,
    access_token,
    userAgent,
    ipAddress,
  );

  // 5. Retornar token y datos del usuario
  return { access_token, user: { ... } };
}
```

### 2. Frontend

#### useSessionCheck Hook
**Archivo:** `frontend/src/hooks/useSessionCheck.ts`

**Responsabilidades:**
- Verificar periódicamente si la sesión sigue activa
- Detectar si la sesión fue cerrada en otro dispositivo
- Cerrar sesión local y redirigir al login

**Flujo:**
```
1. Verificar cada 30 segundos (si usuario autenticado)
2. Llamar a /auth/validate
3. Si error 401:
   a. Verificar si el mensaje incluye "sesión ha sido cerrada"
   b. Cerrar sesión local (logout)
   c. Mostrar alerta
   d. Redirigir a /login
```

**Código:**
```typescript
useEffect(() => {
  if (!isAuthenticated) return;

  const checkSession = async () => {
    try {
      await api.get('/auth/validate');
    } catch (error: any) {
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        
        if (message.includes('sesión ha sido cerrada') || 
            message.includes('iniciaste sesión en otro dispositivo')) {
          logout();
          alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.');
          navigate('/login');
        }
      }
    }
  };

  intervalRef.current = window.setInterval(checkSession, 30000);

  return () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
  };
}, [isAuthenticated, logout, navigate]);
```

#### API Interceptor
**Archivo:** `frontend/src/services/api.ts`

**Responsabilidades:**
- Interceptar errores 401
- Detectar sesión cerrada en otro dispositivo
- Limpiar localStorage y redirigir

**Flujo:**
```
1. Interceptar respuesta de error
2. Si status === 401:
   a. Verificar si el mensaje incluye "sesión ha sido cerrada"
   b. Mostrar alerta
   c. Limpiar localStorage (token, user)
   d. Redirigir a /login
3. Si no es sesión cerrada:
   a. Limpiar localStorage
   b. Redirigir a /login (si no está ya en /login)
```

## Base de Datos

### Tabla: user_sessions

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "sessionToken" VARCHAR NOT NULL UNIQUE,
  "userAgent" VARCHAR,
  "ipAddress" VARCHAR,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastActivityAt" TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_userId ON user_sessions("userId");
CREATE INDEX idx_user_sessions_sessionToken ON user_sessions("sessionToken");
CREATE INDEX idx_user_sessions_isActive ON user_sessions("isActive");
```

**Columnas:**
- `id`: ID único de la sesión
- `userId`: ID del usuario (FK a users)
- `sessionToken`: Hash SHA-256 del JWT token
- `userAgent`: User agent del navegador
- `ipAddress`: Dirección IP del cliente
- `isActive`: Si la sesión está activa
- `lastActivityAt`: Última actividad registrada
- `expiresAt`: Fecha de expiración (24 horas)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

## Flujos Completos

### Flujo de Login

```
FRONTEND:
1. Usuario ingresa email y contraseña
2. POST /auth/login con credenciales
3. Recibe { access_token, user }
4. Guarda token en localStorage
5. Guarda user en localStorage
6. Redirige al dashboard

BACKEND:
1. LocalStrategy valida credenciales
2. AuthController.login() recibe usuario validado
3. AuthService.login():
   a. Valida acceso al tenant
   b. Genera JWT token
   c. SessionService.createSession():
      - Cierra sesiones anteriores del usuario
      - Crea nueva sesión con hash del JWT
   d. Retorna token y datos del usuario
```

### Flujo de Request Autenticado

```
FRONTEND:
1. Usuario hace click en "Ver Clientes"
2. GET /clients con header Authorization: Bearer <token>

BACKEND:
1. JwtAuthGuard valida JWT token
2. SessionGuard valida sesión:
   a. Extrae token del header
   b. Genera hash SHA-256
   c. Busca sesión en BD
   d. Verifica isActive = true
   e. Verifica expiresAt > now
   f. Actualiza lastActivityAt
3. Si válida → Request continúa
4. Si inválida → Error 401

FRONTEND:
5. Si error 401:
   a. API Interceptor detecta error
   b. Muestra alerta
   c. Limpia localStorage
   d. Redirige a /login
```

### Flujo de Verificación Periódica

```
FRONTEND (cada 30 segundos):
1. useSessionCheck ejecuta checkSession()
2. GET /auth/validate con token

BACKEND:
1. JwtAuthGuard valida JWT
2. SessionGuard se SALTA (@SkipSessionCheck)
3. AuthController.validate() retorna datos del usuario

FRONTEND:
4. Si éxito → Sesión válida, continuar
5. Si error 401:
   a. Verificar mensaje de error
   b. Si incluye "sesión ha sido cerrada":
      - Cerrar sesión local
      - Mostrar alerta
      - Redirigir a /login
```

### Flujo de Login en Otro Dispositivo

```
DISPOSITIVO 1 (ya logueado):
- Usuario tiene sesión activa
- useSessionCheck verifica cada 30s

DISPOSITIVO 2 (nuevo login):
1. Usuario inicia sesión
2. Backend crea nueva sesión
3. Backend cierra sesión del Dispositivo 1

DISPOSITIVO 1 (después de 30s):
1. useSessionCheck ejecuta checkSession()
2. GET /auth/validate
3. SessionGuard valida sesión
4. Sesión NO encontrada (fue cerrada)
5. Error 401: "Tu sesión ha sido cerrada..."
6. Frontend muestra alerta
7. Frontend redirige a /login
```

## Seguridad

### Hash del JWT Token

El JWT token NO se almacena directamente en la base de datos. Se almacena un hash SHA-256:

```typescript
private hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

**Ventajas:**
- Si la BD es comprometida, los tokens no son expuestos
- No se puede reconstruir el JWT original desde el hash
- Validación rápida (comparación de hashes)

### Expiración de Sesiones

Las sesiones expiran después de 24 horas:

```typescript
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);
```

**Limpieza automática:**
```typescript
async cleanExpiredSessions(): Promise<number> {
  const result = await this.sessionRepository.delete({
    expiresAt: LessThan(new Date()),
  });
  return result.affected || 0;
}
```

### Validación Estricta

El SessionGuard valida CADA request (excepto los que tienen @SkipSessionCheck):

- Verifica que la sesión exista
- Verifica que esté activa (isActive = true)
- Verifica que no haya expirado
- Actualiza última actividad

## Configuración

### Variables de Entorno

```env
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=consentimientos
DB_USER=admin
DB_PASSWORD=admin123
```

### Registro Global del SessionGuard

**Archivo:** `backend/src/app.module.ts`

```typescript
providers: [
  // ... otros providers
  {
    provide: APP_GUARD,
    useClass: SessionGuard,
  },
],
```

## Troubleshooting

### Problema: Usuario no puede iniciar sesión

**Síntomas:**
- Error 401 inmediatamente después del login
- Mensaje: "Tu sesión ha sido cerrada..."

**Diagnóstico:**
```bash
# Verificar sesiones del usuario
node backend/check-operador-sessions.js

# Verificar estructura de la tabla
node backend/check-user-sessions-table.js

# Simular flujo completo
node backend/diagnose-session-problem.js
```

**Soluciones:**
1. Verificar que el email sea correcto
2. Limpiar sesiones: `node backend/fix-operador-session-issue.js`
3. Iniciar sesión en modo incógnito
4. Si persiste: `node backend/disable-session-guard.js`

### Problema: Sesión se cierra aleatoriamente

**Síntomas:**
- Usuario es deslogueado sin razón aparente
- Mensaje: "Tu sesión ha sido cerrada..."

**Causas posibles:**
1. Usuario inició sesión en otro dispositivo
2. Sesión expiró (24 horas)
3. Error en la validación del token
4. Problema con el hash del JWT

**Diagnóstico:**
```bash
# Verificar sesiones activas
node backend/check-operador-sessions.js

# Verificar logs del backend
# Buscar: "Sesión inválida o cerrada"
```

### Problema: Múltiples sesiones activas

**Síntomas:**
- Usuario puede estar logueado en múltiples dispositivos
- SessionGuard no está funcionando

**Diagnóstico:**
```bash
# Verificar que el SessionGuard esté activo
grep -n "SessionGuard" backend/src/app.module.ts

# Verificar sesiones del usuario
node backend/check-operador-sessions.js
```

**Solución:**
```bash
# Reactivar SessionGuard
node backend/enable-session-guard.js

# Reiniciar backend
```

## Mejoras Futuras

### 1. Gestión de Sesiones en UI

Agregar una página de configuración donde el usuario pueda:
- Ver todas sus sesiones activas
- Ver información de cada sesión (dispositivo, IP, última actividad)
- Cerrar sesiones específicas
- Cerrar todas las sesiones excepto la actual

### 2. Notificaciones de Sesión

Enviar notificaciones cuando:
- Se inicia sesión en un nuevo dispositivo
- Se cierra una sesión desde otro dispositivo
- Una sesión está por expirar

### 3. Sesiones Múltiples Opcionales

Permitir que algunos usuarios (ej: Admin) tengan múltiples sesiones activas:
- Agregar campo `allowMultipleSessions` en tabla users
- Modificar SessionService para respetar esta configuración
- Agregar UI para configurar esta opción

### 4. Refresh Token

Implementar refresh tokens para:
- Extender sesiones sin requerir login
- Mejorar seguridad (access token corto, refresh token largo)
- Permitir revocación granular

### 5. Logging Mejorado

Agregar más logging para:
- Intentos de login fallidos
- Creación y cierre de sesiones
- Validaciones de sesión
- Facilitar debugging

## Conclusión

El sistema de sesión única es robusto y seguro, pero puede ser confuso para los usuarios cuando se encuentran con errores. Las mejoras propuestas ayudarían a mejorar la experiencia del usuario y facilitar el debugging de problemas.
