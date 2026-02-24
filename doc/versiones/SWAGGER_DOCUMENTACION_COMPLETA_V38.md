# Swagger - Documentación Completa v38.0.0

**Fecha:** 2026-02-13  
**Estado:** ✅ Implementado

---

## 📚 Controllers Documentados con Swagger

### ✅ Completamente Documentados

1. **auth.controller.ts** - Autenticación y sesiones
   - Login, logout, refresh token
   - Recuperación de contraseña
   - Validación de token
   - Suplantación de usuario
   - Magic login

2. **health.controller.ts** - Estado del sistema
   - Health check básico
   - Health check detallado
   - Información de versión completa

3. **users.controller.ts** - Gestión de usuarios
   - CRUD completo de usuarios
   - Cambio de contraseña
   - Filtrado por tenant

4. **clients.controller.ts** - Gestión de clientes/pacientes
   - CRUD completo de clientes
   - Búsqueda avanzada
   - Estadísticas
   - Multi-tenancy

### 🔄 Con Decoradores Básicos

5. **consents.controller.ts** - Consentimientos informados
6. **medical-records.controller.ts** - Historias clínicas
7. **tenants.controller.ts** - Multi-tenancy
8. **plans.controller.ts** - Planes y precios

### 📋 Pendientes de Documentación Detallada

9. branches.controller.ts
10. consent-templates.controller.ts
11. mr-consent-templates.controller.ts
12. services.controller.ts
13. questions.controller.ts
14. roles.controller.ts
15. settings.controller.ts
16. payments.controller.ts
17. invoices.controller.ts
18. billing.controller.ts
19. notifications.controller.ts
20. webhooks.controller.ts
21. storage.controller.ts

---

## 🎯 Decoradores Implementados

### @ApiTags
Agrupa endpoints por módulo funcional:
```typescript
@ApiTags('users')
@ApiTags('clients')
@ApiTags('auth')
```

### @ApiBearerAuth
Indica que el endpoint requiere autenticación JWT:
```typescript
@ApiBearerAuth('JWT-auth')
```

### @ApiOperation
Describe el propósito del endpoint:
```typescript
@ApiOperation({ 
  summary: 'Crear usuario',
  description: 'Crea un nuevo usuario en el tenant actual'
})
```

### @ApiResponse
Documenta las respuestas posibles:
```typescript
@ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos' })
@ApiResponse({ status: 403, description: 'Sin permisos' })
```

### @ApiBody
Documenta el cuerpo de la petición:
```typescript
@ApiBody({ type: CreateUserDto })
```

### @ApiParam
Documenta parámetros de ruta:
```typescript
@ApiParam({ name: 'id', description: 'ID del usuario' })
```

### @ApiQuery
Documenta query parameters:
```typescript
@ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
```

---

## 📊 Estadísticas

### Controllers Totales: 21
- ✅ Completamente documentados: 4 (19%)
- 🔄 Con decoradores básicos: 4 (19%)
- 📋 Pendientes: 13 (62%)

### Endpoints Documentados
- Auth: 10 endpoints
- Health: 3 endpoints
- Users: 6 endpoints
- Clients: 7 endpoints
- **Total documentados: ~26 endpoints**

---

## 🚀 Acceso a Swagger

### URLs
- **Desarrollo:** http://localhost:3000/api/docs
- **Producción:** https://api.archivoenlinea.com/api/docs

### Características
- Interfaz interactiva
- Prueba de endpoints en tiempo real
- Autenticación JWT integrada
- Ejemplos de request/response
- Filtrado de endpoints
- Tema oscuro (monokai)

---

## 📝 Cómo Usar Swagger

### 1. Acceder a la Documentación
```
http://localhost:3000/api/docs
```

### 2. Autenticarse
1. Expandir endpoint `/api/auth/login`
2. Clic en "Try it out"
3. Ingresar credenciales:
   ```json
   {
     "email": "admin@ejemplo.com",
     "password": "tu_contraseña"
   }
   ```
4. Clic en "Execute"
5. Copiar el `access_token` de la respuesta
6. Clic en botón "Authorize" (candado verde arriba)
7. Pegar token en campo "JWT-auth"
8. Clic en "Authorize"

### 3. Probar Endpoints
1. Expandir cualquier endpoint
2. Clic en "Try it out"
3. Completar parámetros requeridos
4. Clic en "Execute"
5. Ver respuesta en tiempo real

---

## 🔧 Configuración Swagger

### main.ts
```typescript
const config = new DocumentBuilder()
  .setTitle('Sistema de Consentimientos y Historias Clínicas')
  .setDescription('API REST completa...')
  .setVersion('38.0.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }, 'JWT-auth')
  .addApiKey({
    type: 'apiKey',
    name: 'X-Tenant-Slug',
    in: 'header',
  }, 'tenant-slug')
  .addTag('auth', 'Autenticación y gestión de sesiones')
  .addTag('users', 'Gestión de usuarios')
  // ... más tags
  .build();
```

### Opciones Personalizadas
```typescript
SwaggerModule.setup('api/docs', app, document, {
  customSiteTitle: 'API Docs - Sistema de Consentimientos',
  customfavIcon: 'https://archivoenlinea.com/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
});
```

---

## 📦 Tags Organizados

### Módulos Principales
- `auth` - Autenticación y sesiones
- `users` - Gestión de usuarios
- `clients` - Clientes/pacientes
- `consents` - Consentimientos informados
- `medical-records` - Historias clínicas electrónicas

### Administración
- `tenants` - Multi-tenancy
- `plans` - Planes y precios
- `payments` - Pagos y facturación
- `invoices` - Facturas
- `billing` - Facturación

### Configuración
- `templates` - Plantillas de consentimientos
- `branches` - Sucursales
- `roles` - Roles y permisos
- `settings` - Configuración del sistema

### Sistema
- `health` - Estado del sistema
- `webhooks` - Webhooks externos
- `storage` - Almacenamiento

---

## 🎯 Próximos Pasos

### Fase 1: Documentación Completa (Recomendado)
1. Agregar decoradores detallados a todos los controllers
2. Documentar DTOs con `@ApiProperty()`
3. Agregar ejemplos de respuesta
4. Documentar códigos de error específicos

### Fase 2: Mejoras Avanzadas
1. Agregar schemas de respuesta personalizados
2. Documentar headers personalizados
3. Agregar ejemplos múltiples por endpoint
4. Implementar versionamiento de API (v1, v2)

### Fase 3: Integración
1. Generar cliente TypeScript desde Swagger
2. Exportar documentación a Postman
3. Integrar con herramientas de testing
4. Crear documentación externa

---

## ✅ Beneficios Actuales

### Para Desarrolladores
- Documentación siempre actualizada
- Pruebas sin Postman
- Comprensión rápida de la API
- Ejemplos integrados

### Para el Equipo
- Onboarding más rápido
- Menos preguntas sobre la API
- Estándar de documentación
- Referencia centralizada

### Para el Proyecto
- Profesionalismo
- Mantenibilidad
- Escalabilidad
- Integración con herramientas

---

## 📞 Recursos

**Swagger UI:** http://localhost:3000/api/docs  
**Documentación NestJS:** https://docs.nestjs.com/openapi/introduction  
**Swagger Spec:** https://swagger.io/specification/

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-02-13  
**Versión:** 38.0.0  
**Estado:** ✅ Funcional y listo para uso
