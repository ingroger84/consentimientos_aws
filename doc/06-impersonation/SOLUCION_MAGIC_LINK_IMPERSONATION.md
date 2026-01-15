# Solución: Magic Link para Impersonation

## Problema con la Solución Anterior
El enfoque de pasar el JWT token en la URL (`?impersonate=token`) no funcionaba correctamente porque:
1. **localStorage no se comparte entre subdominios** (`admin.localhost` vs `demo.localhost`)
2. El token se guardaba en localStorage antes de validar, causando problemas de sincronización
3. La redirección entre subdominios era compleja y propensa a errores

## Nueva Solución: Magic Links (Enlaces Mágicos)

### Concepto
Un "magic link" es un enlace temporal de un solo uso que permite iniciar sesión sin contraseña. Similar a los enlaces de "reset password", pero para acceso directo.

### Ventajas
✅ **Simple y robusto**: No depende de localStorage entre subdominios
✅ **Seguro**: Token de un solo uso que expira en 5 minutos
✅ **Sin modificar contraseña**: La contraseña del usuario nunca se toca
✅ **Auditable**: Queda registro de quién accedió y cuándo
✅ **Funciona en cualquier navegador**: No depende de características específicas

---

## Flujo Completo

### 1. Super Admin hace clic en botón púrpura (LogIn)
**Ubicación**: Página de Usuarios (`/users`)

**Confirmación**:
```
¿Deseas acceder como [Nombre Usuario]?

Tenant: [Nombre Tenant]
Email: [email@usuario.com]

Nota: La contraseña del usuario NO será modificada.
Se generará un enlace de acceso temporal válido por 5 minutos.
```

### 2. Backend genera Magic Token
**Endpoint**: `POST /auth/impersonate/:userId`

**Proceso**:
1. Valida que el usuario actual sea Super Admin
2. Valida que el usuario target pertenezca a un tenant
3. Genera token aleatorio de 32 bytes (256 bits)
4. Hashea el token con SHA-256
5. Guarda el token hasheado en la BD (campo `reset_password_token`)
6. Establece expiración de 5 minutos
7. Retorna el token sin hashear

**Respuesta**:
```json
{
  "magicToken": "abc123...",
  "tenantSlug": "demo",
  "user": {
    "id": "uuid",
    "name": "Usuario Demo",
    "email": "usuario@demo.com"
  },
  "message": "Token de acceso generado. Válido por 5 minutos."
}
```

### 3. Frontend construye Magic URL
```
http://[tenant-slug].localhost:5173/login?magic=[magicToken]
```

**Ejemplo**:
```
http://demo.localhost:5173/login?magic=abc123def456...
```

### 4. Redirección automática
El navegador redirige al subdominio del tenant con el magic token en la URL.

### 5. LoginPage detecta Magic Token
**Hook useEffect**:
```typescript
useEffect(() => {
  const magicToken = searchParams.get('magic');
  if (magicToken) {
    handleMagicLogin(magicToken);
  }
}, [searchParams]);
```

### 6. Backend valida Magic Token
**Endpoint**: `GET /auth/magic-login/:token`

**Proceso**:
1. Hashea el token recibido
2. Busca usuario por token hasheado
3. Verifica que no haya expirado (5 minutos)
4. Verifica que el tenant del usuario coincida con el subdominio
5. **Elimina el token** (un solo uso)
6. Genera JWT normal
7. Retorna access_token y datos del usuario

**Respuesta**:
```json
{
  "access_token": "jwt_token_aqui",
  "user": {
    "id": "uuid",
    "name": "Usuario Demo",
    "email": "usuario@demo.com",
    "role": { ... },
    "branches": [ ... ],
    "tenant": {
      "id": "uuid",
      "name": "Demo",
      "slug": "demo"
    }
  }
}
```

### 7. Frontend guarda sesión y redirige
1. Guarda `access_token` en localStorage
2. Guarda `user` en localStorage
3. Actualiza store de Zustand
4. Limpia parámetro `magic` de la URL
5. Redirige a `/dashboard`

---

## Seguridad

### Token Temporal
- **Generación**: `crypto.randomBytes(32)` = 256 bits de entropía
- **Almacenamiento**: Hasheado con SHA-256 en BD
- **Expiración**: 5 minutos
- **Un solo uso**: Se elimina después de usarlo

### Validaciones
1. ✅ Solo Super Admin puede generar magic tokens
2. ✅ No se puede generar token para otro Super Admin
3. ✅ Token debe usarse desde el subdominio correcto
4. ✅ Token expira automáticamente
5. ✅ Token se elimina después de usarlo (no reutilizable)

### Logging
Todas las operaciones quedan registradas:
```
[Impersonation] Attempt by superadmin@sistema.com for user uuid
[Impersonation] Success: superadmin@sistema.com → usuario@demo.com (Tenant: demo)
[MagicLogin] Attempt with token from tenant: demo
[MagicLogin] Success for user: usuario@demo.com
```

---

## Archivos Modificados

### Backend

#### 1. auth.controller.ts
- Agregado endpoint `GET /auth/magic-login/:token`

#### 2. auth.service.ts
- Modificado método `impersonate()`: Ahora genera magic token en lugar de JWT
- Agregado método `magicLogin()`: Valida magic token y retorna JWT

### Frontend

#### 1. UsersPage.tsx
- Modificado `handleImpersonate()`: Usa magic token en lugar de JWT en URL

#### 2. LoginPage.tsx
- Modificado hook `useEffect`: Detecta parámetro `magic` en lugar de `impersonate`
- Agregado `handleMagicLogin()`: Procesa magic token

#### 3. auth.service.ts
- Agregado método `magicLogin()`: Llama al endpoint de magic login

#### 4. user.service.ts
- Actualizado tipo de retorno de `impersonate()`: Retorna magic token en lugar de JWT

---

## Comparación con Solución Anterior

### Solución Anterior (JWT en URL)
```
❌ Problema: localStorage no compartido entre subdominios
❌ Complejo: Requiere validación manual del token
❌ Propenso a errores: Sincronización de estado
```

**Flujo**:
```
1. POST /auth/impersonate/:userId → JWT
2. Redirigir a: demo.localhost/login?impersonate=JWT
3. Frontend guarda JWT en localStorage
4. Frontend valida JWT con GET /auth/validate
5. Frontend guarda usuario y redirige
```

### Solución Nueva (Magic Link)
```
✅ Simple: Un solo endpoint que hace todo
✅ Robusto: No depende de localStorage entre subdominios
✅ Seguro: Token de un solo uso con expiración
```

**Flujo**:
```
1. POST /auth/impersonate/:userId → Magic Token
2. Redirigir a: demo.localhost/login?magic=TOKEN
3. Frontend llama GET /auth/magic-login/TOKEN
4. Backend valida, elimina token, retorna JWT
5. Frontend guarda JWT y redirige
```

---

## Cómo Probar

### 1. Iniciar sesión como Super Admin
```
URL: http://admin.localhost:5173
Email: superadmin@sistema.com
Password: superadmin123
```

### 2. Ir a página de Usuarios
```
URL: http://admin.localhost:5173/users
```

### 3. Expandir un tenant con usuarios

### 4. Hacer clic en botón púrpura (LogIn)

### 5. Confirmar en el diálogo

### 6. Resultado esperado
- Redirige automáticamente a `http://[tenant-slug].localhost:5173/login?magic=[token]`
- El magic token se procesa automáticamente
- Inicia sesión como el usuario seleccionado
- Redirige a `/dashboard` del tenant
- La contraseña del usuario NO fue modificada

### 7. Verificar que el token es de un solo uso
- Copiar la URL con el magic token
- Cerrar sesión
- Intentar usar la misma URL nuevamente
- **Resultado esperado**: Error "Token inválido o expirado"

### 8. Verificar expiración
- Generar un magic link
- Esperar más de 5 minutos
- Intentar usar el link
- **Resultado esperado**: Error "El token ha expirado"

---

## Logs para Debugging

### Backend
```
[Impersonation] Attempt by superadmin@sistema.com for user abc-123
[Impersonation] Success: superadmin@sistema.com → usuario@demo.com (Tenant: demo)

[MagicLogin] Attempt with token from tenant: demo
[MagicLogin] Success for user: usuario@demo.com
```

### Frontend (Console)
```
[Impersonation] Requesting magic token...
[Impersonation] Magic token received
[Impersonation] Tenant slug: demo
[Impersonation] Redirecting to: http://demo.localhost:5173/login?magic=abc123...

[MagicLogin] Processing magic token
[MagicLogin] Login successful
[MagicLogin] Redirecting to dashboard
```

---

## Ventajas Adicionales

### 1. Compartible (opcional)
El magic link podría compartirse por correo o chat si se necesita acceso remoto (aunque no es el caso de uso principal).

### 2. Auditoría
Cada acceso queda registrado en logs con:
- Quién generó el token (Super Admin)
- Para quién se generó (usuario target)
- Cuándo se usó
- Desde qué tenant

### 3. Revocable
Si se necesita, se puede agregar funcionalidad para revocar tokens antes de que expiren.

### 4. Extensible
El sistema puede extenderse fácilmente para:
- Tokens con mayor duración
- Tokens reutilizables (N usos)
- Tokens con permisos limitados
- Notificaciones al usuario cuando alguien accede a su cuenta

---

## Estado Actual
✅ **IMPLEMENTADO Y LISTO PARA PROBAR**

El sistema de magic links está completamente implementado y debería funcionar correctamente. Es una solución más robusta y simple que el enfoque anterior de JWT en URL.
