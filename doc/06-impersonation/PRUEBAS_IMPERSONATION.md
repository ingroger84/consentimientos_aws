# Pruebas de Impersonation - Acceso Super Admin a Tenants

## Fecha de Implementación
7 de enero de 2026

## Descripción
Sistema que permite al Super Admin acceder a cuentas de usuarios tenant sin modificar sus contraseñas.

---

## Flujo de Impersonation

### 1. Super Admin hace clic en botón púrpura (LogIn)
- **Ubicación**: Página de Usuarios (`/users`)
- **Visible para**: Solo Super Admin
- **Botón**: Icono LogIn color púrpura

### 2. Confirmación
```
¿Deseas acceder como [Nombre Usuario]?

Tenant: [Nombre Tenant]
Email: [email@usuario.com]

Nota: La contraseña del usuario NO será modificada.
```

### 3. Backend genera token JWT
- **Endpoint**: `POST /auth/impersonate/:userId`
- **Validaciones**:
  - Solo Super Admin puede impersonar
  - No se puede impersonar a otro Super Admin
  - Usuario debe existir y pertenecer a un tenant
- **Respuesta**:
  ```json
  {
    "access_token": "jwt_token_aqui",
    "user": { ... },
    "impersonatedBy": { ... },
    "message": "Accediendo como [Usuario]. La contraseña NO ha sido modificada."
  }
  ```

### 4. Redirección con token en URL
```
http://[tenant-slug].localhost:5173/login?impersonate=[token]
```

### 5. LoginPage captura token
- Detecta parámetro `impersonate` en URL
- Guarda token en localStorage
- Valida token con backend (`GET /auth/validate`)
- Obtiene datos del usuario
- Guarda usuario en store (Zustand)
- Limpia parámetro de URL
- Redirige a `/dashboard`

---

## Archivos Modificados

### Backend
1. **auth.controller.ts**
   - Agregado endpoint `POST /auth/impersonate/:userId`
   - Modificado endpoint `POST /auth/validate` → `GET /auth/validate`
   - Usa guard JWT para validar token

2. **auth.service.ts**
   - Método `impersonate(userId, currentUser)`
   - Método `getUserById(userId)` para validación
   - Logging detallado de operaciones

### Frontend
1. **UsersPage.tsx**
   - Botón púrpura (LogIn) visible solo para Super Admin
   - Función `handleImpersonate(user)`
   - Confirmación antes de acceder
   - Redirección con token en URL

2. **LoginPage.tsx**
   - Hook `useEffect` para detectar parámetro `impersonate`
   - Función `handleImpersonateLogin(token)`
   - Validación de token
   - Auto-login y redirección

3. **auth.service.ts**
   - Método `validate(token)` para validar token con backend

4. **api.ts**
   - Interceptor configurado para agregar token en headers

---

## Pasos para Probar

### Preparación
1. Asegurarse de tener backend corriendo en puerto 3000
2. Asegurarse de tener frontend corriendo en puerto 5173
3. Tener al menos un tenant creado con usuarios

### Prueba 1: Acceso exitoso
1. Iniciar sesión como Super Admin en `http://admin.localhost:5173`
   - Email: `superadmin@sistema.com`
   - Password: `superadmin123`

2. Ir a página de Usuarios (`/users`)

3. Expandir un tenant que tenga usuarios

4. Hacer clic en el botón púrpura (LogIn) de un usuario

5. Confirmar en el diálogo

6. **Resultado esperado**:
   - Redirige a `http://[tenant-slug].localhost:5173/login?impersonate=[token]`
   - El token se procesa automáticamente
   - Inicia sesión como el usuario seleccionado
   - Redirige a `/dashboard` del tenant
   - La contraseña del usuario NO fue modificada

### Prueba 2: Verificar que la contraseña no cambió
1. Después de hacer impersonation, cerrar sesión

2. Intentar iniciar sesión con las credenciales originales del usuario

3. **Resultado esperado**:
   - El usuario puede iniciar sesión con su contraseña original
   - La contraseña NO fue modificada

### Prueba 3: Validaciones de seguridad
1. Intentar que un usuario tenant use el botón de impersonation
   - **Resultado esperado**: Botón no visible

2. Intentar impersonar a un Super Admin
   - **Resultado esperado**: Error "No se puede impersonar a otro Super Admin"

---

## Logs para Debugging

### Backend
```
[AuthService] [Impersonation] Attempt by superadmin@sistema.com for user [userId]
[AuthService] [Impersonation] Success: superadmin@sistema.com → usuario@tenant.com (Tenant: demo)
```

### Frontend (Console)
```
[Impersonation] Success: Accediendo como Usuario. La contraseña NO ha sido modificada.
[Impersonation] Redirecting to: http://demo.localhost:5173/login?impersonate=[token]
[Impersonation] Processing token from URL
[Impersonation] User data received: { id, name, email, ... }
[Impersonation] Redirecting to dashboard
```

---

## Problemas Conocidos y Soluciones

### Problema 1: Se queda en pantalla de login
**Causa**: Token no se procesa correctamente

**Solución**:
1. Verificar que el parámetro `impersonate` esté en la URL
2. Verificar logs en consola del navegador
3. Verificar que el token sea válido
4. Verificar que el endpoint `/auth/validate` funcione

### Problema 2: Error 401 al validar token
**Causa**: Token inválido o expirado

**Solución**:
1. Verificar que el token se guarde en localStorage antes de validar
2. Verificar que el interceptor de axios agregue el token en headers
3. Verificar que el guard JWT esté configurado correctamente

### Problema 3: No redirige al dashboard
**Causa**: Error en la validación o en el store

**Solución**:
1. Verificar que `setUser(userData)` se ejecute correctamente
2. Verificar que los datos del usuario sean válidos
3. Verificar que la navegación use `replace: true`

---

## Seguridad

### Validaciones Implementadas
1. ✅ Solo Super Admin puede impersonar
2. ✅ No se puede impersonar a otro Super Admin
3. ✅ Token JWT con expiración
4. ✅ Token incluye marca `impersonatedBy`
5. ✅ Logging detallado de todas las operaciones
6. ✅ La contraseña del usuario NUNCA se modifica

### Consideraciones
- El token de impersonation es un JWT estándar
- El token expira según la configuración JWT del sistema
- Se puede identificar una sesión impersonada por el campo `impersonatedBy` en el payload
- Todas las operaciones de impersonation quedan registradas en logs

---

## Próximas Mejoras (Opcionales)

1. **Banner de Impersonation**
   - Mostrar banner en la parte superior indicando que es una sesión impersonada
   - Botón para "Volver a Super Admin"

2. **Auditoría**
   - Guardar en BD todas las operaciones de impersonation
   - Tabla de auditoría con: quién, cuándo, a quién, desde dónde

3. **Límite de tiempo**
   - Token de impersonation con expiración más corta (ej: 30 minutos)
   - Renovación automática si es necesario

4. **Permisos granulares**
   - Permitir que solo ciertos Super Admins puedan impersonar
   - Restricciones por tenant o por rol
