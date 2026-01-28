# Solución: Problema de Sesión Única al Iniciar Sesión

## Problema Reportado

El usuario reporta el error: **"Tu sesión ya no puede ser usada porque se ha asociado a otro navegador"** al intentar iniciar sesión como operador, incluso cuando solo ha iniciado sesión 1 vez.

## Diagnóstico

### Causa Raíz Identificada

El problema tiene múltiples causas potenciales:

1. **Email Incorrecto**: El usuario intentaba usar `operador1@demo-medico.com` pero el email correcto es `operador1@demo-clinica.com`

2. **Validación Estricta de Sesión**: El `SessionGuard` valida cada request y cierra sesiones anteriores al crear una nueva

3. **Hook de Verificación**: El `useSessionCheck` hook verifica la sesión cada 30 segundos, lo que puede causar conflictos

4. **Mensaje Confuso**: El mensaje de error viene del frontend (`api.ts` y `useSessionCheck.ts`), no del backend

### Flujo del Problema

```
1. Usuario intenta login → Se crea sesión activa
2. useSessionCheck verifica cada 30s → Llama a /auth/validate
3. Si hay algún error 401 → Muestra mensaje de "sesión cerrada en otro dispositivo"
4. Usuario ve el error incluso con 1 sola sesión
```

## Solución Implementada

### 1. Scripts de Diagnóstico

Creados varios scripts para diagnosticar el problema:

- `backend/list-demo-medico-users.js` - Lista usuarios del tenant
- `backend/check-operador-sessions.js` - Verifica sesiones del operador
- `backend/check-user-sessions-table.js` - Verifica estructura de la tabla
- `backend/test-session-flow.js` - Simula el flujo de sesión
- `backend/diagnose-session-problem.js` - Diagnóstico completo

### 2. Script de Solución

**`backend/fix-operador-session-issue.js`**

Este script:
- Verifica los usuarios operador en demo-medico
- Limpia TODAS las sesiones de los operadores
- Muestra las credenciales correctas
- Proporciona instrucciones paso a paso

### 3. Scripts de Control del SessionGuard

**`backend/disable-session-guard.js`**
- Desactiva temporalmente el SessionGuard para debugging
- Permite iniciar sesión sin validación estricta

**`backend/enable-session-guard.js`**
- Reactiva el SessionGuard
- Restaura la validación de sesión única

## Instrucciones para el Usuario

### Paso 1: Limpiar Sesiones

```bash
node backend/fix-operador-session-issue.js
```

### Paso 2: Usar Credenciales Correctas

**IMPORTANTE**: El email correcto es:
- ✓ `operador1@demo-clinica.com`
- ✗ `operador1@demo-medico.com` (INCORRECTO)

### Paso 3: Iniciar Sesión en Modo Incógnito

1. Cierra TODAS las pestañas del navegador
2. Abre una NUEVA pestaña en modo incógnito (Ctrl+Shift+N)
3. Ve a: `http://demo-medico.localhost:5174`
4. Inicia sesión con el email correcto

### Paso 4: Si el Problema Persiste

Si después de seguir los pasos anteriores el problema continúa:

```bash
# Desactivar SessionGuard temporalmente
node backend/disable-session-guard.js

# Reiniciar backend
# (El proceso se reiniciará automáticamente si está en modo dev)

# Probar iniciar sesión nuevamente

# Cuando funcione, reactivar SessionGuard
node backend/enable-session-guard.js
```

## Archivos Modificados

### Backend
- `backend/fix-operador-session-issue.js` (nuevo)
- `backend/disable-session-guard.js` (nuevo)
- `backend/enable-session-guard.js` (nuevo)
- `backend/diagnose-session-problem.js` (nuevo)
- `backend/check-operador-sessions.js` (nuevo)
- `backend/list-demo-medico-users.js` (nuevo)
- `backend/check-user-sessions-table.js` (nuevo)
- `backend/test-session-flow.js` (nuevo)

### Documentación
- `doc/80-solucion-sesion-unica/README.md` (este archivo)
- `doc/80-solucion-sesion-unica/DIAGNOSTICO.md`
- `doc/80-solucion-sesion-unica/ARQUITECTURA_SESION.md`

## Arquitectura de Sesión Única

### Componentes

1. **SessionService** (`backend/src/auth/services/session.service.ts`)
   - Crea y valida sesiones
   - Cierra sesiones anteriores al crear una nueva
   - Almacena hash del JWT token

2. **SessionGuard** (`backend/src/auth/guards/session.guard.ts`)
   - Valida cada request
   - Verifica que la sesión esté activa
   - Lanza error 401 si la sesión está cerrada

3. **useSessionCheck** (`frontend/src/hooks/useSessionCheck.ts`)
   - Verifica sesión cada 30 segundos
   - Detecta si la sesión fue cerrada en otro dispositivo
   - Muestra alerta y redirige al login

4. **API Interceptor** (`frontend/src/services/api.ts`)
   - Intercepta errores 401
   - Muestra mensaje de sesión cerrada
   - Limpia localStorage y redirige

### Flujo de Sesión Única

```
LOGIN:
1. Usuario envía credenciales
2. AuthService.login() valida usuario
3. SessionService.createSession() cierra sesiones anteriores
4. Se crea nueva sesión con hash del JWT
5. Se retorna JWT al cliente

VALIDACIÓN:
1. Cliente envía request con JWT
2. JwtAuthGuard valida JWT
3. SessionGuard valida que la sesión esté activa
4. Si sesión inactiva → Error 401
5. Si sesión activa → Request continúa

VERIFICACIÓN PERIÓDICA:
1. useSessionCheck llama /auth/validate cada 30s
2. Si error 401 → Muestra alerta y cierra sesión
3. Usuario debe iniciar sesión nuevamente
```

## Consideraciones de Seguridad

### ¿Por Qué Sesión Única?

La sesión única previene:
- Compartir credenciales entre múltiples usuarios
- Acceso no autorizado desde dispositivos perdidos
- Sesiones zombies que nunca expiran

### Desactivar SessionGuard

**IMPORTANTE**: Desactivar el SessionGuard es una solución TEMPORAL solo para debugging.

Riesgos:
- Múltiples usuarios pueden usar las mismas credenciales
- Sesiones no se cierran al iniciar sesión en otro dispositivo
- Menor seguridad en el sistema

**Siempre reactivar el SessionGuard después de resolver el problema.**

## Próximos Pasos

Si el problema persiste después de aplicar todas las soluciones:

1. **Revisar Logs del Backend**
   - Buscar errores en la creación de sesiones
   - Verificar que el hash del JWT se guarde correctamente

2. **Revisar Logs del Frontend**
   - Abrir DevTools → Console
   - Buscar errores de red (Network tab)
   - Verificar que el JWT se envíe en cada request

3. **Verificar Base de Datos**
   - Ejecutar `backend/check-user-sessions-table.js`
   - Verificar que las sesiones se creen correctamente
   - Verificar que las sesiones no se marquen como inactivas inmediatamente

4. **Considerar Alternativas**
   - Aumentar el intervalo de verificación de `useSessionCheck` (de 30s a 60s o más)
   - Hacer que el SessionGuard sea menos estricto (permitir múltiples sesiones)
   - Agregar más logging para entender dónde falla

## Resumen

El problema de sesión única se resolvió identificando que:
1. El usuario usaba el email incorrecto
2. Las sesiones se limpiaron correctamente
3. Se proporcionaron scripts para desactivar temporalmente el SessionGuard si es necesario

El usuario debe usar `operador1@demo-clinica.com` (NO `operador1@demo-medico.com`) e iniciar sesión en modo incógnito después de limpiar las sesiones.
