# Refresh Token Automático para Permisos

## Problema Identificado

Cuando se asignan nuevos permisos a un rol, los usuarios con sesión activa no ven los cambios hasta que cierran sesión y vuelven a iniciar. Esto ocurre porque:

1. El JWT se genera en el login con los permisos del momento
2. El token no se actualiza automáticamente cuando cambian los permisos
3. Los usuarios deben cerrar sesión manualmente para obtener un nuevo token

## Solución Implementada

### 1. Endpoint de Refresh Token (Backend)

**Archivo**: `backend/src/auth/auth.controller.ts`

```typescript
@Post('refresh-token')
@UseGuards(AuthGuard('jwt'))
@AllowAnyTenant()
@SkipSessionCheck()
async refreshToken(@Request() req: any, @TenantSlug() tenantSlug: string | null) {
  // Obtener el usuario actualizado con sus permisos actuales
  const user = await this.authService.getUserById(req.user.sub);
  
  // Generar un nuevo token con los permisos actualizados
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  return this.authService.login(user, tenantSlug, userAgent, ipAddress);
}
```

**Características**:
- Endpoint: `POST /api/auth/refresh-token`
- Requiere autenticación JWT
- Obtiene el usuario actualizado de la base de datos
- Genera un nuevo JWT con los permisos actuales
- Retorna el nuevo token y datos del usuario

### 2. Interceptor Automático (Frontend)

**Archivo**: `frontend/src/services/api.ts`

**Funcionalidad**:
- Detecta errores 403 (Forbidden) relacionados con permisos
- Intenta refrescar el token automáticamente
- Reintenta el request original con el nuevo token
- Maneja cola de requests pendientes durante el refresh
- Evita múltiples intentos de refresh simultáneos

**Flujo**:
1. Usuario hace un request que falla con 403 por permisos
2. Interceptor detecta el error de permisos
3. Llama a `/api/auth/refresh-token` para obtener nuevo token
4. Actualiza el token en localStorage
5. Reintenta el request original automáticamente
6. Si falla el refresh, muestra el error original

**Código clave**:
```typescript
// Si es un error de permisos y no hemos intentado refrescar el token
if (message.includes('permiso') || message.includes('permission') || message.includes('autorizado')) {
  // Si ya intentamos refrescar, no intentar de nuevo
  if (originalRequest._retry) {
    return Promise.reject(error);
  }
  
  originalRequest._retry = true;
  isRefreshing = true;
  
  try {
    const response = await api.post('/auth/refresh-token');
    const { access_token, user } = response.data;
    
    // Actualizar token y usuario
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Reintentar el request original
    return api(originalRequest);
  } catch (refreshError) {
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
}
```

### 3. Botón Manual de Refresh (Frontend)

**Archivo**: `frontend/src/components/Layout.tsx`

**Características**:
- Botón con ícono de refresh en el menú de usuario
- Permite actualizar permisos manualmente
- Muestra animación de carga durante el proceso
- Recarga la página después de actualizar

**Ubicación**: Sidebar, sección de información del usuario, junto al botón de logout

**Funcionalidad**:
```typescript
const handleRefreshPermissions = async () => {
  try {
    setRefreshingPermissions(true);
    const response = await api.post('/auth/refresh-token');
    const { access_token, user: updatedUser } = response.data;
    
    // Actualizar token y usuario
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Recargar página
    window.location.reload();
  } catch (error) {
    alert('Error al actualizar permisos');
  }
};
```

## Casos de Uso

### Caso 1: Refresh Automático
1. Admin asigna nuevo permiso "view_templates" al rol "Operador"
2. Usuario operador intenta acceder a `/templates`
3. Backend responde con 403 "No tienes permiso para ver plantillas"
4. Interceptor detecta el error y refresca el token automáticamente
5. Request se reintenta con el nuevo token
6. Usuario ve las plantillas sin necesidad de cerrar sesión

### Caso 2: Refresh Manual
1. Admin asigna nuevos permisos a un rol
2. Usuario hace clic en el botón de refresh (ícono de flechas circulares)
3. Sistema obtiene nuevo token con permisos actualizados
4. Página se recarga con los nuevos permisos
5. Usuario ve las nuevas opciones de menú disponibles

### Caso 3: Múltiples Requests Simultáneos
1. Usuario hace varios requests que fallan por permisos
2. Primer request inicia el proceso de refresh
3. Requests subsecuentes se agregan a una cola
4. Cuando el refresh completa, todos los requests se reintentan
5. Todos los requests se completan exitosamente

## Ventajas

1. **Experiencia de Usuario Mejorada**
   - No necesita cerrar sesión para ver nuevos permisos
   - Transición transparente cuando se actualizan permisos
   - Opción manual para usuarios que prefieren control explícito

2. **Seguridad Mantenida**
   - Los permisos siempre están actualizados
   - El token se valida en cada refresh
   - No se compromete la seguridad del sistema

3. **Eficiencia Operativa**
   - Reduce interrupciones en el flujo de trabajo
   - Facilita la gestión de permisos en tiempo real
   - Menos soporte necesario para problemas de permisos

## Limitaciones

1. **Refresh Automático**
   - Solo se activa cuando hay un error 403 por permisos
   - No detecta cambios de permisos proactivamente
   - Requiere que el usuario intente acceder a un recurso

2. **Refresh Manual**
   - Requiere que el usuario haga clic en el botón
   - Recarga la página completa (pierde estado temporal)

## Mejoras Futuras

1. **Refresh Periódico**
   - Implementar refresh automático cada X minutos
   - Verificar cambios de permisos sin esperar errores

2. **WebSocket para Notificaciones**
   - Notificar al usuario cuando sus permisos cambian
   - Mostrar mensaje "Tus permisos han sido actualizados"

3. **Refresh sin Recargar Página**
   - Actualizar permisos sin recargar la página completa
   - Mantener el estado de la aplicación

4. **Indicador Visual**
   - Mostrar badge cuando hay permisos nuevos disponibles
   - Sugerir al usuario que actualice sus permisos

## Testing

### Prueba 1: Refresh Automático
1. Iniciar sesión como operador sin permiso "view_templates"
2. Admin asigna permiso "view_templates" al rol operador
3. Operador intenta acceder a `/templates`
4. Verificar que se refresca el token automáticamente
5. Verificar que se muestra la página de plantillas

### Prueba 2: Refresh Manual
1. Iniciar sesión como operador
2. Admin asigna nuevos permisos al rol
3. Operador hace clic en botón de refresh
4. Verificar que aparece animación de carga
5. Verificar que la página se recarga
6. Verificar que aparecen nuevas opciones de menú

### Prueba 3: Error de Refresh
1. Iniciar sesión como operador
2. Desconectar backend
3. Hacer clic en botón de refresh
4. Verificar que se muestra mensaje de error
5. Verificar que no se pierde la sesión actual

## Archivos Modificados

- `backend/src/auth/auth.controller.ts` - Endpoint de refresh token
- `frontend/src/services/api.ts` - Interceptor automático
- `frontend/src/components/Layout.tsx` - Botón manual de refresh
- `doc/62-refresh-token-automatico/README.md` - Esta documentación
