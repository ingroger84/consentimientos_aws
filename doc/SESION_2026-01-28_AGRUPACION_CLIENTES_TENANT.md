# Sesión 2026-01-28: Agrupación de Clientes por Tenant

## Contexto
El Super Admin necesitaba ver los clientes agrupados por tenant, similar a como se muestran los usuarios.

## Problema Identificado
- El endpoint de clientes requería `tenantSlug` en el header
- Super Admin no tiene tenant asignado
- Los clientes no se mostraban en el dashboard del Super Admin

## Solución Implementada

### 1. Backend - Endpoint Global de Clientes

**Archivo**: `backend/src/clients/clients.controller.ts`
```typescript
@Get()
async findAll(@TenantSlug() tenantSlug?: string) {
  // Si no hay tenantSlug, es Super Admin - devolver todos los clientes
  if (!tenantSlug) {
    return this.clientsService.findAllGlobal();
  }
  return this.clientsService.findAll(tenantSlug);
}
```

**Archivo**: `backend/src/clients/clients.service.ts`
```typescript
async findAllGlobal() {
  const clients = await this.clientRepository.find({
    relations: ['tenant'],
    order: { createdAt: 'DESC' },
  });

  return clients.map(client => ({
    ...client,
    tenantName: client.tenant?.name || 'Sin tenant',
    tenantSlug: client.tenant?.slug || null,
  }));
}
```

### 2. Frontend - Vista Agrupada por Tenant

**Archivo**: `frontend/src/pages/ClientsPage.tsx`

Características implementadas:
- Botón para alternar entre vista agrupada y vista lista
- Secciones colapsables por tenant
- Header con información del tenant (nombre, slug, cantidad de clientes)
- Links de acceso rápido a cada tenant
- Estados: `expandedTenants` (Set), `groupByTenant` (boolean)

```typescript
// Agrupar clientes por tenant
const clientsByTenant = clients.reduce((acc, client) => {
  const tenantKey = client.tenantSlug || 'sin-tenant';
  if (!acc[tenantKey]) {
    acc[tenantKey] = {
      tenantName: client.tenantName || 'Sin Tenant',
      tenantSlug: client.tenantSlug,
      clients: [],
    };
  }
  acc[tenantKey].clients.push(client);
  return acc;
}, {} as Record<string, { tenantName: string; tenantSlug: string | null; clients: any[] }>);
```

## Resultado
- Super Admin puede ver todos los clientes del sistema
- Los clientes se agrupan por tenant de forma visual
- Cada sección es colapsable para mejor organización
- Se puede alternar entre vista agrupada y vista lista

## Versión
- **Frontend**: 19.1.0 → 19.1.1
- **Backend**: Sin cambios de versión (solo lógica)

## Archivos Modificados
- `backend/src/clients/clients.controller.ts`
- `backend/src/clients/clients.service.ts`
- `frontend/src/pages/ClientsPage.tsx`

## Fecha
2026-01-28
