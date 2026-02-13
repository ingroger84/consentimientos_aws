# Decoradores Swagger Agregados

## Controllers Documentados

### ✅ Completados
1. **auth.controller.ts** - Autenticación y sesiones
2. **health.controller.ts** - Estado del sistema
3. **users.controller.ts** - Gestión de usuarios

### 🔄 En Proceso
4. **clients.controller.ts** - Gestión de clientes/pacientes
5. **consents.controller.ts** - Consentimientos informados
6. **medical-records.controller.ts** - Historias clínicas
7. **tenants.controller.ts** - Multi-tenancy
8. **plans.controller.ts** - Planes y precios

### 📋 Pendientes
9. **branches.controller.ts** - Sucursales
10. **consent-templates.controller.ts** - Plantillas de consentimientos
11. **mr-consent-templates.controller.ts** - Plantillas HC
12. **services.controller.ts** - Servicios médicos
13. **questions.controller.ts** - Preguntas de formularios
14. **roles.controller.ts** - Roles y permisos
15. **settings.controller.ts** - Configuración
16. **payments.controller.ts** - Pagos
17. **invoices.controller.ts** - Facturas
18. **billing.controller.ts** - Facturación
19. **notifications.controller.ts** - Notificaciones
20. **webhooks.controller.ts** - Webhooks
21. **storage.controller.ts** - Almacenamiento

## Decoradores Utilizados

### @ApiTags
- Agrupa endpoints por módulo
- Ejemplo: `@ApiTags('users')`

### @ApiOperation
- Describe el endpoint
- Incluye summary y description

### @ApiResponse
- Documenta respuestas posibles
- Incluye códigos de estado

### @ApiBearerAuth
- Indica autenticación JWT requerida

### @ApiBody
- Documenta el body del request

### @ApiParam
- Documenta parámetros de ruta

### @ApiQuery
- Documenta query parameters

## Patrón de Implementación

```typescript
@ApiTags('module-name')
@ApiBearerAuth('JWT-auth')
@Controller('module-name')
export class ModuleController {
  
  @Post()
  @ApiOperation({ 
    summary: 'Acción breve',
    description: 'Descripción detallada'
  })
  @ApiBody({ type: CreateDto })
  @ApiResponse({ status: 201, description: 'Creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  create(@Body() dto: CreateDto) {
    // ...
  }
}
```
