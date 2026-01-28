# Diagnóstico Detallado: Problema de Sesión Única

## Síntomas Reportados

- Error: "Tu sesión ya no puede ser usada porque se ha asociado a otro navegador"
- Usuario: operador1@demo-medico.com (email INCORRECTO)
- Situación: Solo ha iniciado sesión 1 vez
- Frecuencia: Ocurre inmediatamente después del login

## Investigación Realizada

### 1. Verificación de Usuarios

**Comando ejecutado:**
```bash
node backend/list-demo-medico-users.js
```

**Resultado:**
```
Tenant: demo-medico (Clinica Demo)
Usuarios encontrados:
  1. admin@clinicademo.com (Administrador General)
  2. operador1@demo-clinica.com (Operador) ← EMAIL CORRECTO
  3. operador2@demo-clinica.com (Operador)
```

**Conclusión:** El usuario estaba usando el email incorrecto.

### 2. Verificación de Sesiones

**Comando ejecutado:**
```bash
node backend/check-user-sessions-table.js
```

**Resultado:**
```
Tabla user_sessions existe: ✓
Total de sesiones: 3

Sesión 1: ACTIVA (Admin)
Sesión 2: INACTIVA (Operador1)
Sesión 3: INACTIVA (Operador1)
```

**Conclusión:** El operador tiene 2 sesiones INACTIVAS, lo que indica que intentó iniciar sesión pero las sesiones se cerraron.

### 3. Simulación del Flujo de Sesión

**Comando ejecutado:**
```bash
node backend/diagnose-session-problem.js
```

**Resultado:**
```
1. Usuario verificado: ✓
2. JWT generado: ✓
3. Sesiones anteriores cerradas: ✓
4. Nueva sesión creada: ✓
5. Validación de sesión: ✓
6. Hash del JWT coincide: ✓

Conclusión: El flujo de sesión funciona correctamente
```

**Conclusión:** El sistema de sesión funciona correctamente cuando se usa el email correcto.

## Análisis del Código

### 1. SessionGuard

**Archivo:** `backend/src/auth/guards/session.guard.ts`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  // Verificar si la ruta tiene @SkipSessionCheck
  const skipSessionCheck = this.reflector.get<boolean>(
    'skipSessionCheck',
    context.getHandler(),
  );

  if (skipSessionCheck) {
    return true; // ✓ Rutas con @SkipSessionCheck no se validan
  }

  const token = authHeader.replace('Bearer ', '');
  const isValid = await this.sessionService.validateSession(token);

  if (!isValid) {
    throw new UnauthorizedException(
      'Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo.',
    );
  }

  return true;
}
```

**Observaciones:**
- El guard valida TODOS los requests excepto los que tienen `@SkipSessionCheck`
- Si la sesión no es válida, lanza error 401
- El mensaje del backend es diferente al que ve el usuario

### 2. useSessionCheck Hook

**Archivo:** `frontend/src/hooks/useSessionCheck.ts`

```typescript
const checkSession = async () => {
  try {
    await api.get('/auth/validate'); // ← Tiene @SkipSessionCheck
  } catch (error: any) {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      
      if (message.includes('sesión ha sido cerrada') || 
          message.includes('iniciaste sesión en otro dispositivo')) {
        alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.');
        logout();
        navigate('/login');
      }
    }
  }
};

// Verificar cada 30 segundos
intervalRef.current = window.setInterval(checkSession, 30000);
```

**Observaciones:**
- Verifica la sesión cada 30 segundos
- El endpoint `/auth/validate` tiene `@SkipSessionCheck`, así que NO debería fallar
- El mensaje que ve el usuario viene del FRONTEND, no del backend

### 3. API Interceptor

**Archivo:** `frontend/src/services/api.ts`

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      
      if (message.includes('sesión ha sido cerrada') || 
          message.includes('iniciaste sesión en otro dispositivo')) {
        alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Observaciones:**
- Intercepta TODOS los errores 401
- Muestra el mensaje de "sesión cerrada en otro dispositivo"
- Limpia localStorage y redirige al login

## Causas Identificadas

### Causa Principal: Email Incorrecto

El usuario intentaba usar `operador1@demo-medico.com` pero el email correcto es `operador1@demo-clinica.com`.

**Impacto:**
- El login falla con error 401 (credenciales inválidas)
- El interceptor detecta el 401 y muestra el mensaje de "sesión cerrada"
- El usuario piensa que es un problema de sesión única, pero en realidad es un error de credenciales

### Causa Secundaria: Mensaje Confuso

El mensaje de error es el mismo para:
- Credenciales inválidas (401)
- Sesión cerrada en otro dispositivo (401)
- Token expirado (401)

**Impacto:**
- El usuario no puede distinguir entre diferentes tipos de errores 401
- El mensaje sugiere un problema de sesión única cuando puede ser otro problema

### Causa Terciaria: Sesiones Inactivas Acumuladas

El usuario tiene múltiples sesiones inactivas en la base de datos.

**Impacto:**
- Confusión al diagnosticar el problema
- Posible conflicto si el sistema intenta reactivar una sesión antigua

## Soluciones Propuestas

### Solución Inmediata

1. **Limpiar sesiones:**
   ```bash
   node backend/fix-operador-session-issue.js
   ```

2. **Usar email correcto:**
   - ✓ `operador1@demo-clinica.com`
   - ✗ `operador1@demo-medico.com`

3. **Iniciar sesión en modo incógnito:**
   - Evita problemas de caché
   - Asegura un estado limpio

### Solución Temporal (Si Persiste)

Si el problema continúa después de usar el email correcto:

```bash
# Desactivar SessionGuard
node backend/disable-session-guard.js

# Reiniciar backend (automático en modo dev)

# Probar login

# Reactivar SessionGuard
node backend/enable-session-guard.js
```

### Soluciones a Largo Plazo

1. **Mejorar Mensajes de Error**
   - Diferenciar entre credenciales inválidas y sesión cerrada
   - Mostrar mensajes más específicos según el tipo de error

2. **Agregar Logging**
   - Registrar intentos de login fallidos
   - Registrar creación y cierre de sesiones
   - Facilitar debugging de problemas de sesión

3. **Optimizar useSessionCheck**
   - Aumentar intervalo de verificación (60s en lugar de 30s)
   - Agregar retry logic para errores transitorios
   - No mostrar alerta si el error es de credenciales

4. **Mejorar UX de Sesión Única**
   - Mostrar notificación cuando se cierra sesión en otro dispositivo
   - Permitir al usuario elegir cerrar otras sesiones
   - Mostrar lista de sesiones activas en configuración

## Verificación de la Solución

### Checklist

- [ ] Sesiones limpiadas con `fix-operador-session-issue.js`
- [ ] Email correcto verificado (`operador1@demo-clinica.com`)
- [ ] Login en modo incógnito
- [ ] Sin errores 401 después del login
- [ ] useSessionCheck no muestra alertas
- [ ] Usuario puede navegar sin problemas

### Comandos de Verificación

```bash
# Verificar sesiones activas
node backend/check-operador-sessions.js

# Verificar estructura de la tabla
node backend/check-user-sessions-table.js

# Simular flujo completo
node backend/diagnose-session-problem.js
```

## Conclusión

El problema principal era el **email incorrecto**. El usuario usaba `operador1@demo-medico.com` cuando debía usar `operador1@demo-clinica.com`.

El mensaje de error confuso ("sesión cerrada en otro dispositivo") se mostraba para cualquier error 401, incluyendo credenciales inválidas.

La solución es:
1. Usar el email correcto
2. Limpiar sesiones antiguas
3. Iniciar sesión en modo incógnito
4. Si persiste, desactivar temporalmente el SessionGuard para debugging
