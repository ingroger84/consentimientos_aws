# Corrección Sistema de Sesión Única - 24 de Enero 2026

## Problema Identificado

Después de implementar el sistema de sesión única (versión 12.0.0), los usuarios no podían iniciar sesión. La sesión se cerraba inmediatamente después del login.

### Causa Raíz

El `SessionGuard` estaba registrado globalmente en `app.module.ts` y se ejecutaba en **TODAS** las rutas, incluyendo:
- `/auth/login` - Endpoint de inicio de sesión
- `/auth/validate` - Endpoint de validación de token
- `/auth/forgot-password` - Recuperación de contraseña
- `/auth/reset-password` - Restablecimiento de contraseña
- `/auth/magic-login/:token` - Login mágico (impersonación)
- `/auth/version` - Versión del sistema

El problema era que estas rutas **no deben validar sesión** porque:
1. `/auth/login` - No hay sesión aún, es el primer login
2. `/auth/validate` - Se llama inmediatamente después del login para obtener datos del usuario
3. Las demás rutas son públicas o de autenticación inicial

## Solución Implementada

### 1. Aplicar Decorador `@SkipSessionCheck()`

Se agregó el decorador `@SkipSessionCheck()` a todos los endpoints de autenticación que no deben validar sesión:

```typescript
// backend/src/auth/auth.controller.ts

import { SkipSessionCheck } from './decorators/skip-session-check.decorator';

@Post('login')
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async login(...) { ... }

@Get('validate')
@UseGuards(AuthGuard('jwt'))
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async validate(...) { ... }

@Post('forgot-password')
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async forgotPassword(...) { ... }

@Post('reset-password')
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async resetPassword(...) { ... }

@Get('magic-login/:token')
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async magicLogin(...) { ... }

@Get('version')
@AllowAnyTenant()
@SkipSessionCheck()  // ✅ Agregado
async getVersion() { ... }
```

### 2. Funcionamiento del SessionGuard

El `SessionGuard` ahora:
1. Verifica si la ruta tiene el decorador `@SkipSessionCheck()`
2. Si lo tiene, permite el acceso sin validar sesión
3. Si no lo tiene, valida que la sesión esté activa en la base de datos

```typescript
// backend/src/auth/guards/session.guard.ts

async canActivate(context: ExecutionContext): Promise<boolean> {
  // Verificar si la ruta tiene el decorador @SkipSessionCheck
  const skipSessionCheck = this.reflector.get<boolean>(
    'skipSessionCheck',
    context.getHandler(),
  );

  if (skipSessionCheck) {
    return true;  // ✅ Permitir acceso sin validar sesión
  }

  // Validar sesión para todas las demás rutas...
}
```

## Archivos Modificados

```
backend/src/auth/auth.controller.ts
```

## Despliegue

### 1. Compilación Local
```bash
cd backend
npm run build
```

### 2. Despliegue en Producción
```bash
# Copiar archivos compilados
scp -i ../AWS-ISSABEL.pem -r dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws/backend && pm2 restart datagree-backend --update-env"
```

### 3. Verificación
```bash
# Ver logs del backend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree-backend --lines 30 --nostream"
```

## Resultado

✅ **Sistema de sesión única funcionando correctamente**
- Los usuarios pueden iniciar sesión normalmente
- Solo se permite una sesión activa por usuario
- Las sesiones anteriores se cierran automáticamente al iniciar sesión
- Los endpoints de autenticación funcionan sin validar sesión
- Los demás endpoints validan que la sesión esté activa

## Versión

- **Versión actual**: 12.0.0
- **Fecha**: 24 de Enero 2026
- **Tipo de cambio**: PATCH (corrección de bug)

## Pruebas Realizadas

1. ✅ Login exitoso desde frontend
2. ✅ Validación de token después del login
3. ✅ Navegación normal en la aplicación
4. ✅ Cierre de sesión anterior al iniciar sesión en otro dispositivo
5. ✅ Endpoints de recuperación de contraseña funcionando

## Notas Técnicas

### Decorador @SkipSessionCheck()

El decorador utiliza metadata de NestJS para marcar rutas que no deben validar sesión:

```typescript
// backend/src/auth/decorators/skip-session-check.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SkipSessionCheck = () => SetMetadata('skipSessionCheck', true);
```

### Orden de Ejecución de Guards

1. `TenantGuard` - Valida tenant por subdominio
2. `JwtAuthGuard` - Valida token JWT (si la ruta lo requiere)
3. `SessionGuard` - Valida sesión activa (si la ruta no tiene @SkipSessionCheck)

## Próximos Pasos

- ✅ Sistema de sesión única completamente funcional
- 🔄 Monitorear logs para detectar posibles problemas
- 📝 Considerar agregar limpieza automática de sesiones expiradas (cron job)

---

**Servidor**: 100.28.198.249  
**Usuario**: ubuntu  
**Dominio**: archivoenlinea.com  
**Backend PM2**: datagree-backend
