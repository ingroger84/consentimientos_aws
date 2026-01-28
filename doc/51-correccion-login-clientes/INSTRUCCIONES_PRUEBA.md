# Instrucciones para Probar el Login y Creación de Clientes

## Estado Actual

✅ Backend corriendo correctamente en `http://localhost:3000`
✅ Contraseña del usuario admin reseteada
✅ Tenant `demo-medico` activo y configurado

## Credenciales de Acceso

**URL de Login:** http://demo-medico.localhost:5173/login

**Credenciales:**
- Email: `admin@clinicademo.com`
- Contraseña: `Demo123!`

⚠️ **IMPORTANTE:** Cambia esta contraseña después de iniciar sesión

## Pasos para Probar

### 1. Verificar que el Backend está Corriendo

El backend debe estar corriendo en el puerto 3000. Verifica que veas el mensaje:
```
🚀 Application is running on: http://localhost:3000
```

### 2. Acceder al Login

1. Abre tu navegador
2. Ve a: `http://demo-medico.localhost:5173/login`
3. Deberías ver el login personalizado del tenant (logo "S" azul)

### 3. Iniciar Sesión

1. Ingresa el email: `admin@clinicademo.com`
2. Ingresa la contraseña: `Demo123!`
3. Haz clic en "Ingresar"

Si todo funciona correctamente, deberías ser redirigido al dashboard.

### 4. Probar Creación de Clientes

1. Una vez en el dashboard, ve a la sección de "Clientes"
2. Haz clic en "Crear Cliente"
3. Llena el formulario con los datos del cliente
4. Haz clic en "Guardar"

Si todo funciona correctamente, el cliente debería crearse sin errores.

## Solución Implementada

### Problema Original

El decorador `@TenantSlug()` retornaba el slug del tenant (string como "demo-medico") pero el servicio `ClientsService` esperaba el `tenantId` (UUID).

### Solución

1. **ClientsModule** importa `TenantsModule` con `forwardRef(() => TenantsModule)`
2. **ClientsController** inyecta `TenantsService` con `@Inject(forwardRef(() => TenantsService))`
3. Método helper `getTenantBySlug()` convierte slug a tenant usando `tenantsService.findBySlug()`
4. Todos los endpoints (POST, GET, PATCH, DELETE) actualizados para usar este patrón

### Cambios en Frontend

- **frontend/src/utils/api-url.ts**: SIEMPRE usa `localhost:3000` en desarrollo local (sin subdominio)
- El tenant se identifica mediante header `X-Tenant-Slug`
- **frontend/src/services/api.ts**: Configurado para enviar el header `X-Tenant-Slug` en todos los requests

### Advertencia de Dependencia Circular

El backend muestra un WARNING de dependencia circular entre `ClientsModule` y `TenantsModule`. Esto es esperado y NO es crítico. Es una solución temporal hasta que se refactorice el código para eliminar la dependencia circular.

## Troubleshooting

### Si no puedes iniciar sesión:

1. Verifica que el backend esté corriendo en el puerto 3000
2. Verifica que estés accediendo desde `demo-medico.localhost:5173`
3. Abre las herramientas de desarrollador (F12) y revisa la pestaña "Network"
4. Busca el request a `/api/auth/login` y verifica:
   - Status code (debería ser 200 o 201)
   - Headers (debería incluir `X-Tenant-Slug: demo-medico`)
   - Response (debería incluir `access_token` y `user`)

### Si el login personalizado no se carga:

1. Verifica que el request a `/api/settings/public` retorne Status 200
2. Verifica que el header `X-Tenant-Slug` se esté enviando correctamente
3. Revisa la consola del navegador para ver si hay errores

### Si no puedes crear clientes:

1. Verifica que hayas iniciado sesión correctamente
2. Verifica que el token JWT se esté enviando en el header `Authorization`
3. Verifica que el header `X-Tenant-Slug` se esté enviando correctamente
4. Revisa los logs del backend para ver el error específico

## Próximos Pasos

Una vez que verifiques que el login y la creación de clientes funcionan correctamente:

1. Cambia la contraseña del usuario admin
2. Prueba crear varios clientes para verificar que todo funciona
3. Prueba los otros endpoints de clientes (editar, eliminar, buscar)
4. Reporta cualquier error que encuentres

## Scripts Útiles

### Verificar Usuarios del Tenant

```bash
node backend/scripts/check-users-demo-medico.js
```

### Resetear Contraseña del Admin

```bash
node backend/scripts/reset-password-demo-medico.js
```

### Verificar Tenant

```bash
node backend/scripts/check-tenant-demo-medico.js
```

## Notas Técnicas

- El sistema usa subdominios para multi-tenancy
- En desarrollo local, el frontend está en `demo-medico.localhost:5173`
- El backend está en `localhost:3000` (sin subdominio)
- El tenant se identifica mediante el header `X-Tenant-Slug`
- El middleware `TenantMiddleware` extrae el tenant slug del header o del hostname
- El decorador `@TenantSlug()` obtiene el tenant slug del request

## Versión

Sistema: 15.0.9
Fecha: 25/01/2026
