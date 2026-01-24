# Sistema de Sesión Única - Control de Sesiones Concurrentes

## Descripción

Sistema que garantiza que un usuario solo pueda tener una sesión activa a la vez. Cuando un usuario inicia sesión en un nuevo dispositivo o navegador, la sesión anterior se cierra automáticamente.

## Características

- ✅ **Sesión única por usuario**: Solo una sesión activa permitida
- ✅ **Cierre automático**: La sesión anterior se cierra al iniciar sesión en otro lugar
- ✅ **Notificación al usuario**: Mensaje claro cuando su sesión es cerrada
- ✅ **Registro de sesiones**: Almacena información de cada sesión (IP, user-agent, fecha)
- ✅ **Logout manual**: El usuario puede cerrar su sesión manualmente
- ✅ **Logout de todas las sesiones**: Opción para cerrar todas las sesiones (útil si se pierde un dispositivo)
- ✅ **Limpieza automática**: Las sesiones expiradas se eliminan automáticamente

## Arquitectura

### Backend

#### 1. Entidad UserSession

Tabla `user_sessions` que almacena las sesiones activas:

```typescript
{
  id: UUID
  userId: UUID (FK a users)
  sessionToken: string (hash del JWT)
  userAgent: string (navegador/dispositivo)
  ipAddress: string (IP del cliente)
  isActive: boolean
  lastActivityAt: timestamp
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 2. SessionService

Servicio que maneja la lógica de sesiones:

- `createSession()`: Crea una nueva sesión y cierra las anteriores
- `validateSession()`: Valida que una sesión esté activa
- `closeSession()`: Cierra una sesión específica
- `closeAllUserSessions()`: Cierra todas las sesiones de un usuario
- `cleanExpiredSessions()`: Limpia sesiones expiradas

#### 3. SessionGuard

Guard global que valida cada petición:

- Se ejecuta después del `JwtAuthGuard`
- Verifica que la sesión esté activa en la BD
- Lanza `UnauthorizedException` si la sesión fue cerrada
- Actualiza `lastActivityAt` en cada petición

#### 4. Endpoints

```
POST /api/auth/login          - Login (crea sesión, cierra anteriores)
POST /api/auth/logout         - Logout (cierra sesión actual)
POST /api/auth/logout-all     - Logout de todas las sesiones
GET  /api/auth/validate       - Valida token y sesión
```

### Frontend

#### 1. Interceptor de Axios

Detecta errores 401 con mensaje específico de sesión cerrada:

```typescript
if (message.includes('sesión ha sido cerrada')) {
  alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo');
  // Redirigir a login
}
```

#### 2. AuthService

Servicio para manejar autenticación:

```typescript
authService.login(email, password)
authService.logout()
authService.logoutAll()
authService.validate()
```

## Flujo de Funcionamiento

### Escenario 1: Login Normal

1. Usuario A inicia sesión en Dispositivo 1
2. Backend crea sesión S1 para Usuario A
3. Usuario A puede usar la aplicación normalmente

### Escenario 2: Login en Otro Dispositivo

1. Usuario A ya tiene sesión S1 activa en Dispositivo 1
2. Usuario A inicia sesión en Dispositivo 2
3. Backend:
   - Marca sesión S1 como `isActive = false`
   - Crea nueva sesión S2 para Dispositivo 2
4. Dispositivo 1:
   - En la siguiente petición, SessionGuard detecta que S1 está inactiva
   - Lanza `UnauthorizedException` con mensaje específico
   - Frontend muestra alerta y redirige a login

### Escenario 3: Logout Manual

1. Usuario A hace clic en "Cerrar Sesión"
2. Frontend llama a `POST /api/auth/logout`
3. Backend marca sesión actual como `isActive = false`
4. Frontend limpia localStorage y redirige a login

### Escenario 4: Logout de Todas las Sesiones

1. Usuario A hace clic en "Cerrar todas las sesiones"
2. Frontend llama a `POST /api/auth/logout-all`
3. Backend marca TODAS las sesiones del usuario como `isActive = false`
4. Todas las sesiones activas serán cerradas en su próxima petición

## Instalación

### 1. Crear Tabla en Base de Datos

```bash
psql -U datagree_admin -d consentimientos -f backend/create-user-sessions-table.sql
```

O ejecutar manualmente:

```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "isActive" BOOLEAN DEFAULT true,
    "lastActivityAt" TIMESTAMP,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_active ON user_sessions("userId", "isActive");
CREATE INDEX idx_user_sessions_token ON user_sessions("sessionToken");
CREATE INDEX idx_user_sessions_expires ON user_sessions("expiresAt");
```

### 2. Verificar Instalación

```bash
# Verificar que la tabla existe
psql -U datagree_admin -d consentimientos -c "\d user_sessions"

# Verificar índices
psql -U datagree_admin -d consentimientos -c "\di user_sessions*"
```

## Configuración

### Variables de Entorno

```env
# Tiempo de expiración del JWT (debe coincidir con expiresAt de sesiones)
JWT_EXPIRATION=24h
```

### Ajustar Tiempo de Expiración

En `backend/src/auth/services/session.service.ts`:

```typescript
// Cambiar de 24 horas a otro valor
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24); // Cambiar aquí
```

## Uso

### Desde el Frontend

#### Login

```typescript
import { authService } from '@/services/auth.service';

const handleLogin = async () => {
  try {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    // Redirigir al dashboard
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

#### Logout

```typescript
const handleLogout = async () => {
  try {
    await authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } catch (error) {
    console.error('Error en logout:', error);
  }
};
```

#### Logout de Todas las Sesiones

```typescript
const handleLogoutAll = async () => {
  try {
    const response = await authService.logoutAll();
    alert(`${response.count} sesión(es) cerrada(s)`);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } catch (error) {
    console.error('Error en logout all:', error);
  }
};
```

### Desde el Backend

#### Cerrar Sesiones de un Usuario (Administrativamente)

```typescript
import { SessionService } from './auth/services/session.service';

// En un controlador o servicio
async suspendUser(userId: string) {
  // Cerrar todas las sesiones del usuario
  await this.sessionService.closeAllUserSessions(userId);
  
  // Suspender cuenta
  await this.usersService.suspend(userId);
}
```

## Mantenimiento

### Limpieza de Sesiones Expiradas

Se recomienda ejecutar periódicamente (ej: cada hora) para limpiar sesiones expiradas:

```typescript
// Crear un cron job o scheduled task
import { SessionService } from './auth/services/session.service';

@Cron('0 * * * *') // Cada hora
async cleanExpiredSessions() {
  const count = await this.sessionService.cleanExpiredSessions();
  this.logger.log(`${count} sesiones expiradas eliminadas`);
}
```

### Monitoreo

#### Ver Sesiones Activas de un Usuario

```sql
SELECT 
  id,
  "userId",
  "userAgent",
  "ipAddress",
  "lastActivityAt",
  "expiresAt",
  "createdAt"
FROM user_sessions
WHERE "userId" = 'USER_UUID_HERE'
  AND "isActive" = true
ORDER BY "lastActivityAt" DESC;
```

#### Ver Todas las Sesiones Activas

```sql
SELECT 
  us.id,
  u.email,
  us."userAgent",
  us."ipAddress",
  us."lastActivityAt",
  us."expiresAt"
FROM user_sessions us
JOIN users u ON us."userId" = u.id
WHERE us."isActive" = true
ORDER BY us."lastActivityAt" DESC;
```

#### Estadísticas de Sesiones

```sql
-- Sesiones activas por usuario
SELECT 
  u.email,
  COUNT(*) as active_sessions
FROM user_sessions us
JOIN users u ON us."userId" = u.id
WHERE us."isActive" = true
GROUP BY u.email
ORDER BY active_sessions DESC;

-- Sesiones por día
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as sessions_created
FROM user_sessions
GROUP BY DATE("createdAt")
ORDER BY date DESC
LIMIT 30;
```

## Seguridad

### Consideraciones

1. **Hash del Token**: El JWT se almacena hasheado (SHA-256) en la BD
2. **Expiración**: Las sesiones expiran automáticamente después de 24 horas
3. **Limpieza**: Las sesiones expiradas se eliminan de la BD
4. **Validación en Cada Petición**: El SessionGuard valida la sesión en cada request
5. **Información de Sesión**: Se registra IP y User-Agent para auditoría

### Mejores Prácticas

1. **No almacenar tokens en texto plano**: Siempre hashear antes de guardar
2. **Limpiar sesiones expiradas**: Ejecutar limpieza periódica
3. **Monitorear sesiones sospechosas**: Revisar logs de sesiones cerradas
4. **Permitir logout remoto**: Dar opción al usuario de cerrar todas las sesiones
5. **Notificar al usuario**: Informar claramente cuando su sesión es cerrada

## Pruebas

### Prueba Manual

1. **Abrir dos navegadores diferentes** (ej: Chrome y Firefox)
2. **Iniciar sesión en Chrome** con un usuario
3. **Verificar que funciona** correctamente en Chrome
4. **Iniciar sesión en Firefox** con el mismo usuario
5. **Volver a Chrome** y hacer cualquier acción
6. **Verificar que aparece el mensaje**: "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo"
7. **Verificar que Chrome redirige** a la página de login

### Prueba con Postman

```bash
# 1. Login
POST http://localhost:3000/api/auth/login
Body: { "email": "test@example.com", "password": "password" }
# Guardar el access_token

# 2. Hacer una petición autenticada
GET http://localhost:3000/api/users/me
Headers: Authorization: Bearer {access_token}
# Debe funcionar

# 3. Login nuevamente (simular otro dispositivo)
POST http://localhost:3000/api/auth/login
Body: { "email": "test@example.com", "password": "password" }
# Guardar el nuevo access_token

# 4. Intentar usar el primer token
GET http://localhost:3000/api/users/me
Headers: Authorization: Bearer {primer_access_token}
# Debe retornar 401 con mensaje de sesión cerrada
```

## Troubleshooting

### Problema: Usuario no puede iniciar sesión

**Causa**: Sesión anterior no se cerró correctamente

**Solución**:
```sql
-- Cerrar todas las sesiones del usuario
UPDATE user_sessions 
SET "isActive" = false 
WHERE "userId" = 'USER_UUID_HERE';
```

### Problema: Sesiones no se cierran automáticamente

**Causa**: SessionGuard no está registrado globalmente

**Solución**: Verificar en `app.module.ts`:
```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: SessionGuard,
  },
],
```

### Problema: Error "Cannot read property 'sessionToken'"

**Causa**: Tabla `user_sessions` no existe

**Solución**: Ejecutar el script SQL de creación de tabla

## Limitaciones

1. **No funciona con múltiples instancias del backend**: Si tienes múltiples servidores, necesitarás Redis para compartir el estado de sesiones
2. **Requiere base de datos**: No funciona sin conexión a BD
3. **Overhead en cada petición**: Agrega una consulta a BD por cada request autenticado

## Mejoras Futuras

1. **Redis para sesiones**: Usar Redis en lugar de PostgreSQL para mejor rendimiento
2. **WebSockets**: Notificar en tiempo real cuando la sesión es cerrada
3. **Gestión de sesiones en UI**: Mostrar lista de sesiones activas al usuario
4. **Geolocalización**: Mostrar ubicación aproximada de cada sesión
5. **Notificaciones por email**: Enviar email cuando se inicia sesión en nuevo dispositivo
6. **Sesiones de confianza**: Permitir múltiples sesiones en dispositivos de confianza

## Referencias

- [NestJS Guards](https://docs.nestjs.com/guards)
- [TypeORM Relations](https://typeorm.io/relations)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

**Versión**: 1.0.0  
**Fecha**: 24 de enero de 2026  
**Autor**: Kiro AI Assistant
