# Corrección del Error 500 al Crear Clientes

**Versión:** 15.0.9  
**Fecha:** 2026-01-25  
**Tipo:** PATCH - Corrección de Bug Crítico

---

## 📋 Resumen Ejecutivo

Se corrigió un error crítico que impedía la creación de clientes en el sistema. El problema se originaba por una confusión entre el **slug del tenant** (string como "demo-medico") y el **ID del tenant** (UUID). El controlador de clientes recibía el slug pero pasaba directamente al servicio que esperaba un UUID, causando un error 500.

---

## 🐛 Problema Identificado

### Síntomas
- Error 500 (Internal Server Error) al intentar crear un cliente
- Errores de deserialización en la consola del navegador
- El sistema no podía crear clientes desde ningún tenant

### Causa Raíz
El decorador `@TenantSlug()` retorna el **slug** del tenant (ej: "demo-medico"), pero el servicio `ClientsService` espera el **tenantId** (UUID). El controlador pasaba directamente el slug sin convertirlo a ID.

```typescript
// ❌ ANTES (INCORRECTO)
@Post()
create(
  @Body() createClientDto: CreateClientDto,
  @TenantSlug() tenantId: string,  // ⚠️ Esto es un SLUG, no un ID
) {
  return this.clientsService.create(createClientDto, tenantId);
}
```

---

## ✅ Solución Implementada

### 1. Modificación del ClientsController

Se actualizaron **todos los endpoints** del controlador para:
1. Recibir correctamente el `tenantSlug` del decorador
2. Usar `tenantsService.findBySlug()` para obtener el tenant completo
3. Pasar el `tenant.id` (UUID) al servicio

```typescript
// ✅ DESPUÉS (CORRECTO)
@Post()
async create(
  @Body() createClientDto: CreateClientDto,
  @TenantSlug() tenantSlug: string,  // ✅ Nombre correcto
) {
  const tenant = await this.tenantsService.findBySlug(tenantSlug);
  return this.clientsService.create(createClientDto, tenant.id);  // ✅ Pasa el UUID
}
```

### 2. Inyección de TenantsService

Se agregó el `TenantsService` al constructor del controlador:

```typescript
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly tenantsService: TenantsService,  // ✅ Agregado
  ) {}
}
```

### 3. Endpoints Actualizados

Todos los endpoints del controlador fueron corregidos:
- ✅ `POST /clients` - Crear cliente
- ✅ `GET /clients` - Listar clientes
- ✅ `GET /clients/search` - Buscar clientes
- ✅ `GET /clients/stats` - Estadísticas
- ✅ `GET /clients/:id` - Ver cliente
- ✅ `PATCH /clients/:id` - Actualizar cliente
- ✅ `DELETE /clients/:id` - Eliminar cliente

---

## 📁 Archivos Modificados

### Backend
```
backend/src/clients/
├── clients.controller.ts    ✅ Corregido - Todos los endpoints
└── clients.module.ts         ✓ Ya importaba TenantsModule
```

---

## 🔍 Patrón Correcto

Este patrón es consistente con otros controladores del sistema:

```typescript
// Patrón usado en auth.controller.ts, consents.controller.ts, etc.
async someEndpoint(@TenantSlug() tenantSlug: string) {
  const tenant = await this.tenantsService.findBySlug(tenantSlug);
  // Usar tenant.id para operaciones
  return this.someService.doSomething(tenant.id);
}
```

---

## 🧪 Pruebas Realizadas

### Escenario de Prueba
1. ✅ Acceder desde `demo-medico.localhost:5173`
2. ✅ Navegar a la página de Clientes
3. ✅ Hacer clic en "Nuevo Cliente"
4. ✅ Llenar el formulario con datos válidos
5. ✅ Hacer clic en "Crear Cliente"
6. ✅ Verificar que el cliente se crea exitosamente
7. ✅ Verificar que aparece en la lista de clientes

### Resultados Esperados
- ✅ No hay error 500
- ✅ El cliente se crea correctamente
- ✅ Se muestra mensaje de éxito
- ✅ El cliente aparece en la lista

---

## 📊 Impacto

### Antes de la Corrección
- ❌ Imposible crear clientes
- ❌ Error 500 en todos los tenants
- ❌ Funcionalidad crítica bloqueada

### Después de la Corrección
- ✅ Creación de clientes funciona correctamente
- ✅ Todos los endpoints de clientes operativos
- ✅ Patrón consistente con el resto del sistema

---

## 🎯 Lecciones Aprendidas

### 1. Nomenclatura Clara
- Usar `tenantSlug` cuando el decorador retorna un slug
- Usar `tenantId` solo cuando se tiene el UUID
- Evitar confusión entre slug y ID

### 2. Patrón de Conversión
- Siempre convertir slug a ID en el controlador
- No pasar slugs a servicios que esperan IDs
- Usar `tenantsService.findBySlug()` para la conversión

### 3. Consistencia
- Seguir el patrón establecido en otros controladores
- Revisar controladores existentes antes de implementar nuevos
- Mantener coherencia en toda la aplicación

---

## 🔄 Próximos Pasos

### Recomendaciones
1. ✅ Revisar otros controladores para verificar el mismo patrón
2. ✅ Documentar el patrón en guías de desarrollo
3. ✅ Agregar validación de tenant en middleware si es necesario

---

## 📝 Notas Técnicas

### ¿Por qué usar findBySlug()?
- El middleware de tenant extrae el slug del subdominio
- El decorador `@TenantSlug()` retorna ese slug
- Los servicios trabajan con UUIDs por seguridad y consistencia
- La conversión debe hacerse en el controlador

### Alternativa Considerada
Se consideró modificar el decorador para retornar directamente el ID, pero se descartó porque:
- Requeriría inyectar el servicio en el decorador (anti-patrón)
- Otros controladores ya usan el patrón actual
- La conversión en el controlador es más explícita y mantenible

---

## ✅ Checklist de Verificación

- [x] Código modificado y probado
- [x] Sin errores de compilación
- [x] Patrón consistente con otros controladores
- [x] Documentación creada
- [x] Versión actualizada a 15.0.9
- [x] Listo para despliegue

---

**Estado:** ✅ COMPLETADO  
**Prioridad:** 🔴 CRÍTICA  
**Impacto:** Alto - Funcionalidad bloqueada corregida
