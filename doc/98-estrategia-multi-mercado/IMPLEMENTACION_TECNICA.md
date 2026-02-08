# 🛠️ Implementación Técnica Multi-Región

## Fase 1: Backend - Configuración de Regiones

### 1.1 Crear archivo de configuración de precios por región

```bash
# Crear archivo
touch backend/src/tenants/pricing-regions.config.ts
```

### 1.2 Implementar servicio de detección geográfica

```bash
# Crear servicio
nest g service common/geo-detection
```

### 1.3 Actualizar entidad Tenant

Agregar campos:
- `region` (CO, US, DEFAULT)
- `currency` (COP, USD)
- `planPriceOriginal` (precio al momento de suscripción)
- `priceLocked` (bloquear cambios de precio)

### 1.4 Crear migración

```bash
npm run typeorm migration:generate -- -n AddRegionFieldsToTenant
npm run typeorm migration:run
```

## Fase 2: Frontend - Precios Dinámicos

### 2.1 Actualizar PricingSection

Cargar precios desde API según región detectada.

### 2.2 Mostrar moneda y región

Indicador visual de la región y moneda actual.

### 2.3 Selector manual de región (opcional)

Permitir al usuario cambiar manualmente la región.

## Fase 3: Integración de Pagos

### 3.1 Stripe para USA

- Crear cuenta Stripe
- Configurar webhooks
- Implementar lógica de pago en USD

### 3.2 Mantener Bold para Colombia

- Mantener integración actual
- Separar lógica por región

### 3.3 Gateway selector

Seleccionar automáticamente el gateway según la región del tenant.

## Fase 4: Testing

- Testing con VPN desde diferentes países
- Verificar precios correctos
- Testing de facturación en ambas monedas
- Testing de webhooks

---

Ver documento completo de estrategia para más detalles.
