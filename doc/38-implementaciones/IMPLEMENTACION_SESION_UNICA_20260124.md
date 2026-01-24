# Implementación de Sistema de Sesión Única - 24 de Enero 2026

## Resumen Ejecutivo

Implementación completa de un sistema de sesión única que garantiza que cada usuario solo pueda tener una sesión activa a la vez. Cuando un usuario inicia sesión en un nuevo dispositivo o navegador, la sesión anterior se cierra automáticamente.

## Problema a Resolver

**Requerimiento**: Evitar que el mismo usuario esté conectado más de una vez simultáneamente.

**Solución**: Sistema de control de sesiones que:
- Permite solo una sesión activa por usuario
- Cierra automáticamente la sesión anterior al iniciar sesión en otro lugar
- Notifica al usuario cuando su sesión es cerrada
- Registra información de cada sesión para auditoría

## Arquitectura Implementada

### Backend

#### 1. Nueva Entidad: UserSession

**Archivo**: `backend/src/auth/entities/user-session.entity.ts`

Tabla que almacena las sesiones activas con:
- ID de sesión (UUID)
- ID de usuario (FK)
- Token de sesión (hash del JWT)
- User-Agent (navegador/dispositivo)
- IP Address
- Estado activo/inactivo
- Última actividad
- Fecha de expiración

#### 2. Nuevo Servicio: SessionService

**Archivo**: `backend/src/auth/services/session.service.ts`

Métodos principales:
- `createSession()`: Crea sesión y cierra anteriores
- `validateSession()`: Valida que sesión esté activa
- `closeSession()`: Cierra sesión específica
- `closeAllUserSessions()`: Cierra todas las sesiones de un usuario
- `cleanExpiredSessions()`: Limpia sesiones expiradas

#### 3. Nuevo Guard: SessionGuard

**Archivo**: `backend/src/auth/guards/session.guard.ts`

Guard global que:
- Se ejecuta en cada petición autenticada
- Valida que la sesión esté activa en BD
- Lanza excepción si sesión fue cerrada
- Actualiza última actividad

#### 4. Nuevo Decorador: @SkipSessionCheck

**Archivo**: `backend/src/auth/decorators/skip-session-check.decorator.ts`

Permite omitir validación de sesión en rutas específicas (ej: login, register)

#### 5. Endpoints Nuevos

```
POST /api/auth/logout       - Cierra sesión actual
POST /api/auth/logout-all   - Cierra todas las sesiones del usuario
```

#### 6. Modificaciones en AuthService

- Método `login()` ahora crea sesión y cierra anteriores
- Captura User-Agent e IP Address
- Integración con SessionService

### Frontend

#### 1. Interceptor Mejorado

**Archivo**: `frontend/src/services/api.ts`

Detecta error 401 con mensaje específico de sesión cerrada y muestra alerta al usuario antes de redirigir a login.

#### 2. Nuevo Servicio: AuthService

**Archivo**: `frontend/src/services/auth.service.ts`

Métodos para:
- Login
- Logout
- Logout de todas las sesiones
- Validación de token

### Base de Datos

#### Nueva Tabla: user_sessions

**Script**: `backend/create-user-sessions-table.sql`

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    "userId" UUID REFERENCES users(id),
    "sessionToken" VARCHAR(255) UNIQUE,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "isActive" BOOLEAN DEFAULT true,
    "lastActivityAt" TIMESTAMP,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);
```

Con índices optimizados para:
- Búsqueda por usuario y estado activo
- Búsqueda por token de sesión
- Limpieza de sesiones expiradas

## Archivos Creados

### Backend (7 archivos)

1. `backend/src/auth/entities/user-session.entity.ts` - Entidad de sesión
2. `backend/src/auth/services/session.service.ts` - Servicio de sesiones
3. `backend/src/auth/guards/session.guard.ts` - Guard de validación
4. `backend/src/auth/decorators/skip-session-check.decorator.ts` - Decorador
5. `backend/create-user-sessions-table.sql` - Script SQL
6. `backend/src/auth/auth.service.ts` - Modificado
7. `backend/src/auth/auth.controller.ts` - Modificado

### Frontend (2 archivos)

1. `frontend/src/services/auth.service.ts` - Nuevo servicio
2. `frontend/src/services/api.ts` - Modificado

### Documentación (2 archivos)

1. `doc/34-sesion-unica/README.md` - Documentación completa
2. `IMPLEMENTACION_SESION_UNICA_20260124.md` - Este documento

### Configuración (2 archivos)

1. `backend/src/auth/auth.module.ts` - Modificado
2. `backend/src/app.module.ts` - Modificado

## Flujo de Funcionamiento

### Escenario: Usuario Inicia Sesión en Otro Dispositivo

1. **Usuario A** tiene sesión activa en **Dispositivo 1**
2. **Usuario A** inicia sesión en **Dispositivo 2**
3. **Backend**:
   - Recibe petición de login
   - Llama a `SessionService.createSession()`
   - Cierra todas las sesiones anteriores del usuario (marca `isActive = false`)
   - Crea nueva sesión para Dispositivo 2
   - Retorna JWT
4. **Dispositivo 1**:
   - Usuario intenta hacer cualquier acción
   - `SessionGuard` valida el token JWT
   - Busca sesión en BD por hash del token
   - Encuentra que `isActive = false`
   - Lanza `UnauthorizedException` con mensaje específico
5. **Frontend Dispositivo 1**:
   - Interceptor de axios captura error 401
   - Detecta mensaje de sesión cerrada
   - Muestra alerta: "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo"
   - Limpia localStorage
   - Redirige a login

## Pasos de Instalación

### 1. Crear Tabla en Base de Datos

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar script SQL
psql -U datagree_admin -d consentimientos -f /home/ubuntu/consentimientos_aws/backend/create-user-sessions-table.sql

# Verificar que la tabla existe
psql -U datagree_admin -d consentimientos -c "\d user_sessions"
```

### 2. Compilar Backend

```bash
# En local
cd backend
npm run build

# Copiar archivos compilados al servidor
scp -i AWS-ISSABEL.pem -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
```

### 3. Reiniciar Backend

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
pm2 restart datagree-backend --update-env
pm2 logs datagree-backend --lines 50
```

### 4. Compilar y Desplegar Frontend

```bash
# En local
cd frontend
npm run build

# Desplegar en ambas ubicaciones
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/var/www/html/
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```

## Verificación

### 1. Verificar Tabla en BD

```sql
-- Ver estructura de la tabla
\d user_sessions

-- Ver índices
\di user_sessions*

-- Verificar que está vacía inicialmente
SELECT COUNT(*) FROM user_sessions;
```

### 2. Verificar Backend

```bash
# Ver logs del backend
pm2 logs datagree-backend --lines 50

# Verificar que no hay errores
# Buscar líneas como:
# "SessionService initialized"
# "SessionGuard registered"
```

### 3. Prueba Manual

1. Abrir Chrome e iniciar sesión
2. Verificar que funciona correctamente
3. Abrir Firefox e iniciar sesión con el mismo usuario
4. Volver a Chrome y hacer cualquier acción
5. Verificar que aparece alerta de sesión cerrada
6. Verificar que redirige a login

### 4. Verificar en Base de Datos

```sql
-- Ver sesiones activas
SELECT 
  us.id,
  u.email,
  us."userAgent",
  us."ipAddress",
  us."isActive",
  us."lastActivityAt",
  us."createdAt"
FROM user_sessions us
JOIN users u ON us."userId" = u.id
ORDER BY us."createdAt" DESC
LIMIT 10;
```

## Configuración

### Variables de Entorno

En `backend/.env`:

```env
# Tiempo de expiración del JWT (debe coincidir con sesiones)
JWT_EXPIRATION=24h
```

### Ajustar Tiempo de Sesión

Si necesitas cambiar el tiempo de expiración de sesiones, editar en `backend/src/auth/services/session.service.ts`:

```typescript
// Línea ~45
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24); // Cambiar aquí
```

## Seguridad

### Medidas Implementadas

1. **Hash del Token**: JWT se almacena hasheado (SHA-256) en BD
2. **Validación en Cada Petición**: SessionGuard valida en cada request
3. **Expiración Automática**: Sesiones expiran después de 24 horas
4. **Registro de Auditoría**: Se guarda IP y User-Agent de cada sesión
5. **Limpieza Automática**: Sesiones expiradas se pueden limpiar periódicamente

### Recomendaciones

1. **Implementar limpieza periódica**: Crear cron job para limpiar sesiones expiradas
2. **Monitorear sesiones sospechosas**: Revisar logs de sesiones cerradas
3. **Notificar por email**: Enviar email cuando se inicia sesión en nuevo dispositivo (mejora futura)
4. **Geolocalización**: Mostrar ubicación aproximada de sesiones (mejora futura)

## Mantenimiento

### Limpieza Manual de Sesiones Expiradas

```sql
-- Ver sesiones expiradas
SELECT COUNT(*) 
FROM user_sessions 
WHERE "expiresAt" < NOW();

-- Eliminar sesiones expiradas
DELETE FROM user_sessions 
WHERE "expiresAt" < NOW();
```

### Cerrar Sesiones de un Usuario (Administrativamente)

```sql
-- Cerrar todas las sesiones de un usuario
UPDATE user_sessions 
SET "isActive" = false 
WHERE "userId" = 'USER_UUID_HERE';
```

### Estadísticas

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

-- Sesiones creadas hoy
SELECT COUNT(*) 
FROM user_sessions 
WHERE DATE("createdAt") = CURRENT_DATE;
```

## Pruebas

### Prueba 1: Login en Dos Navegadores

1. Abrir Chrome
2. Ir a `https://tenant.archivoenlinea.com/login`
3. Iniciar sesión con usuario de prueba
4. Navegar por la aplicación (debe funcionar)
5. Abrir Firefox
6. Ir a `https://tenant.archivoenlinea.com/login`
7. Iniciar sesión con el mismo usuario
8. Volver a Chrome
9. Hacer clic en cualquier menú
10. **Resultado esperado**: Alerta "Tu sesión ha sido cerrada..." y redirige a login

### Prueba 2: Logout Manual

1. Iniciar sesión
2. Hacer clic en "Cerrar Sesión"
3. **Resultado esperado**: Redirige a login
4. Verificar en BD que sesión está inactiva:
```sql
SELECT "isActive" FROM user_sessions WHERE "userId" = 'USER_UUID' ORDER BY "createdAt" DESC LIMIT 1;
```

### Prueba 3: Múltiples Logins Consecutivos

1. Iniciar sesión 5 veces seguidas
2. Verificar en BD que solo hay 1 sesión activa:
```sql
SELECT COUNT(*) FROM user_sessions WHERE "userId" = 'USER_UUID' AND "isActive" = true;
```
3. **Resultado esperado**: COUNT = 1

## Troubleshooting

### Problema: "Cannot find module 'SessionService'"

**Causa**: Archivos no compilados o no copiados al servidor

**Solución**:
```bash
cd backend
npm run build
# Copiar dist al servidor
```

### Problema: "Table user_sessions does not exist"

**Causa**: Script SQL no ejecutado

**Solución**:
```bash
psql -U datagree_admin -d consentimientos -f backend/create-user-sessions-table.sql
```

### Problema: Usuario no puede iniciar sesión

**Causa**: Sesión anterior no cerrada correctamente

**Solución**:
```sql
UPDATE user_sessions SET "isActive" = false WHERE "userId" = 'USER_UUID';
```

### Problema: SessionGuard no se ejecuta

**Causa**: No registrado globalmente en AppModule

**Solución**: Verificar en `app.module.ts`:
```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: SessionGuard,
  },
],
```

## Impacto en Rendimiento

### Overhead por Petición

- **1 consulta adicional a BD** por cada petición autenticada
- **Tiempo estimado**: ~5-10ms
- **Impacto**: Mínimo (aceptable para la mayoría de aplicaciones)

### Optimizaciones Aplicadas

1. **Índices en BD**: Optimizan búsqueda por token y usuario
2. **Hash del token**: Búsqueda rápida por índice único
3. **Actualización asíncrona**: `lastActivityAt` se actualiza sin bloquear

### Mejoras Futuras para Rendimiento

1. **Redis**: Usar Redis en lugar de PostgreSQL para sesiones
2. **Caché**: Cachear validación de sesión por 1-2 minutos
3. **Batch updates**: Actualizar `lastActivityAt` cada N minutos en lugar de cada petición

## Mejoras Futuras

1. **WebSockets**: Notificar en tiempo real cuando sesión es cerrada
2. **Gestión de sesiones en UI**: Mostrar lista de sesiones activas al usuario
3. **Sesiones de confianza**: Permitir múltiples sesiones en dispositivos de confianza
4. **Notificaciones por email**: Enviar email cuando se inicia sesión en nuevo dispositivo
5. **Geolocalización**: Mostrar ubicación aproximada de cada sesión
6. **Redis**: Migrar a Redis para mejor rendimiento

## Conclusión

Sistema de sesión única implementado exitosamente con:
- ✅ Control de sesiones concurrentes
- ✅ Cierre automático de sesiones anteriores
- ✅ Notificación clara al usuario
- ✅ Registro de auditoría
- ✅ Endpoints de logout
- ✅ Documentación completa

El sistema está listo para desplegar en producción una vez ejecutados los pasos de instalación.

---

**Versión**: 1.0.0  
**Fecha**: 24 de enero de 2026  
**Estado**: Listo para despliegue  
**Autor**: Kiro AI Assistant
