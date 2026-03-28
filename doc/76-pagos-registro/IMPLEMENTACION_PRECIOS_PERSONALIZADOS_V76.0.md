# Implementación de Precios Personalizados por Tenant - V76.0.0

## Fecha
27 de marzo de 2026

## Resumen
Se implementó la funcionalidad de precios personalizados por tenant, permitiendo que cada tenant pueda tener precios diferentes a los del plan base, sin afectar a otros tenants.

## Cambios Implementados

### 1. Base de Datos
**Archivo:** `backend/migrations/add-custom-plan-prices.sql`

Se agregaron tres nuevas columnas a la tabla `tenants`:
- `custom_price_monthly` (DECIMAL): Precio mensual personalizado
- `custom_price_annual` (DECIMAL): Precio anual personalizado
- `use_custom_price` (BOOLEAN): Indica si se deben usar los precios personalizados

```sql
ALTER TABLE tenants 
ADD COLUMN custom_price_monthly DECIMAL(10,2),
ADD COLUMN custom_price_annual DECIMAL(10,2),
ADD COLUMN use_custom_price BOOLEAN DEFAULT false;
```

### 2. Backend

#### Entidad Tenant
**Archivo:** `backend/src/tenants/entities/tenant.entity.ts`

Se agregaron los campos:
```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'custom_price_monthly' })
customPriceMonthly: number;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'custom_price_annual' })
customPriceAnnual: number;

@Column({ type: 'boolean', default: false, name: 'use_custom_price' })
useCustomPrice: boolean;
```

#### DTO de Creación/Actualización
**Archivo:** `backend/src/tenants/dto/create-tenant.dto.ts`

Se agregaron los campos opcionales:
```typescript
@IsNumber()
@IsOptional()
customPriceMonthly?: number;

@IsNumber()
@IsOptional()
customPriceAnnual?: number;

@IsBoolean()
@IsOptional()
useCustomPrice?: boolean;
```

#### Servicio de Facturación
**Archivo:** `backend/src/invoices/invoices.service.ts`

Se modificó el método `generateMonthlyInvoice` para usar precios personalizados cuando estén configurados:

```typescript
// Calcular precio según ciclo de facturación
// Si el tenant tiene precios personalizados, usarlos; de lo contrario, usar los del plan
let amount: number;
if (tenant.useCustomPrice) {
  if (tenant.billingCycle === 'annual' && tenant.customPriceAnnual) {
    amount = tenant.customPriceAnnual;
    this.logger.log(`✅ Usando precio anual personalizado para tenant ${tenant.name}: ${amount}`);
  } else if (tenant.billingCycle === 'monthly' && tenant.customPriceMonthly) {
    amount = tenant.customPriceMonthly;
    this.logger.log(`✅ Usando precio mensual personalizado para tenant ${tenant.name}: ${amount}`);
  } else {
    // Fallback al precio del plan si no hay precio personalizado configurado
    amount = calculatePrice(tenant.plan, tenant.billingCycle);
    this.logger.warn(`⚠️ Tenant ${tenant.name} tiene useCustomPrice=true pero no tiene precio personalizado configurado. Usando precio del plan.`);
  }
} else {
  amount = calculatePrice(tenant.plan, tenant.billingCycle);
}
```

### 3. Frontend

#### Tipos TypeScript
**Archivo:** `frontend/src/types/tenant.ts`

Se agregaron los campos al tipo `Tenant`:
```typescript
customPriceMonthly?: number;
customPriceAnnual?: number;
useCustomPrice?: boolean;
```

#### Formulario de Tenant
**Archivo:** `frontend/src/components/TenantFormModal.tsx`

Se agregó una nueva sección "Precio Personalizado" que permite:
- Activar/desactivar precios personalizados mediante un checkbox
- Ingresar precio mensual personalizado
- Ingresar precio anual personalizado
- Ver el precio base del plan para referencia
- Calcular automáticamente el ahorro anual

La sección solo se muestra para planes de pago (no para el plan gratuito).

## Funcionalidad

### Cómo Funciona

1. **Creación/Edición de Tenant:**
   - El Super Admin puede activar "Usar precio personalizado"
   - Puede ingresar precios personalizados para mensual y/o anual
   - Si deja los campos vacíos, se usarán los precios del plan base

2. **Generación de Facturas:**
   - El sistema verifica si `useCustomPrice` es `true`
   - Si es `true`, usa los precios personalizados según el ciclo de facturación
   - Si es `false` o no hay precios personalizados configurados, usa los precios del plan base

3. **Visualización:**
   - El formulario muestra los precios base del plan para referencia
   - Calcula y muestra el ahorro anual si se configuran ambos precios personalizados
   - Los campos están deshabilitados si no se activa el checkbox

### Casos de Uso

1. **Descuentos Especiales:**
   - Ofrecer precios reducidos a clientes específicos
   - Mantener precios antiguos para clientes existentes

2. **Precios Promocionales:**
   - Aplicar promociones temporales a tenants específicos
   - Ofrecer precios de lanzamiento

3. **Negociaciones Personalizadas:**
   - Establecer precios negociados individualmente
   - Adaptar precios según volumen o necesidades específicas

## Despliegue

### Pasos Realizados

1. ✅ Migración SQL ejecutada en Supabase
2. ✅ Backend compilado y desplegado
3. ✅ Frontend compilado y desplegado
4. ✅ Backend reiniciado con PM2
5. ✅ Nginx recargado

### Ubicaciones en Servidor

- **Backend:** `/home/ubuntu/consentimientos_aws/backend/dist/`
- **Frontend:** `/home/ubuntu/consentimientos_aws/frontend/dist/`
- **Proceso PM2:** `datagree`

## Pruebas Recomendadas

1. **Crear Tenant con Precio Personalizado:**
   - Ir a Tenants > Crear Nuevo Tenant
   - Seleccionar un plan de pago
   - Activar "Usar precio personalizado"
   - Ingresar precios personalizados
   - Guardar y verificar

2. **Editar Tenant Existente:**
   - Seleccionar un tenant
   - Activar precios personalizados
   - Modificar los precios
   - Guardar y verificar

3. **Generación de Facturas:**
   - Esperar a que se genere una factura automática
   - Verificar que use el precio personalizado
   - Revisar los logs del backend para confirmar

4. **Desactivar Precios Personalizados:**
   - Editar un tenant con precios personalizados
   - Desactivar el checkbox
   - Guardar y verificar que vuelva a usar precios del plan

## Notas Importantes

- Los precios personalizados solo afectan al tenant específico
- Los cambios no afectan a otros tenants con el mismo plan
- Si se desactiva `useCustomPrice`, el sistema vuelve a usar los precios del plan base
- Los precios personalizados se pueden dejar vacíos para usar los del plan base
- El sistema tiene fallback automático si no hay precios personalizados configurados

## Versión
76.0.0

## Estado
✅ Implementado y desplegado en producción
