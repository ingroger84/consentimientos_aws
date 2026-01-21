# Ejemplos de Uso - Sistema de Impuestos

## Fecha: 2026-01-20
## Versión: 1.1.1

---

## 📚 Tabla de Contenidos

1. [Configuración de Impuestos](#configuración-de-impuestos)
2. [Creación de Facturas](#creación-de-facturas)
3. [Casos de Uso Comunes](#casos-de-uso-comunes)
4. [API Endpoints](#api-endpoints)

---

## Configuración de Impuestos

### Crear Impuesto IVA 19% (Adicional)

**Frontend:**
```typescript
import { taxConfigService, TaxApplicationType } from '@/services/tax-config.service';

const ivaConfig = await taxConfigService.create({
  name: 'IVA 19%',
  rate: 19,
  applicationType: TaxApplicationType.ADDITIONAL,
  isActive: true,
  isDefault: true,
  description: 'Impuesto al Valor Agregado estándar en Colombia'
});
```

**Resultado:**
- Monto: $100.000
- Impuesto: $19.000 (19% de $100.000)
- Total: $119.000

### Crear Impuesto IVA 5% (Incluido)

```typescript
const ivaReducido = await taxConfigService.create({
  name: 'IVA 5% Incluido',
  rate: 5,
  applicationType: TaxApplicationType.INCLUDED,
  isActive: true,
  isDefault: false,
  description: 'IVA reducido para productos básicos'
});
```

**Resultado:**
- Total: $100.000
- Impuesto: $4.762 (5% incluido en $100.000)
- Monto base: $95.238

### Establecer Impuesto por Defecto

```typescript
await taxConfigService.setDefault('tax-config-id');
```

---

## Creación de Facturas

### 1. Factura Normal (con impuesto por defecto)

```typescript
import { invoicesService } from '@/services/invoices.service';

const invoice = await invoicesService.create({
  tenantId: 'tenant-123',
  amount: 100000,
  total: 119000, // Se calculará automáticamente
  dueDate: '2026-02-20',
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  items: [
    {
      description: 'Plan Emprendedor - Mensual',
      quantity: 1,
      unitPrice: 100000,
      total: 100000
    }
  ],
  notes: 'Factura mensual'
});
```

**Backend calculará:**
- `tax`: 19.000 (usando impuesto por defecto)
- `total`: 119.000
- `taxConfigId`: ID del impuesto por defecto

### 2. Factura con Impuesto Específico

```typescript
const invoice = await invoicesService.create({
  tenantId: 'tenant-123',
  taxConfigId: 'tax-config-iva-5', // Impuesto específico
  amount: 100000,
  total: 105000,
  dueDate: '2026-02-20',
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  items: [
    {
      description: 'Servicio especial',
      quantity: 1,
      unitPrice: 100000,
      total: 100000
    }
  ]
});
```

**Backend calculará:**
- `tax`: 5.000 (usando IVA 5%)
- `total`: 105.000

### 3. Factura Exenta de Impuestos

```typescript
const invoice = await invoicesService.create({
  tenantId: 'tenant-123',
  taxExempt: true,
  taxExemptReason: 'Organización sin fines de lucro registrada',
  amount: 100000,
  total: 100000, // Sin impuesto
  dueDate: '2026-02-20',
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  items: [
    {
      description: 'Donación mensual',
      quantity: 1,
      unitPrice: 100000,
      total: 100000
    }
  ],
  notes: 'Factura exenta según artículo X'
});
```

**Backend establecerá:**
- `tax`: 0
- `total`: 100.000 (igual al amount)
- `taxConfigId`: null
- `taxExempt`: true
- `taxExemptReason`: "Organización sin fines de lucro registrada"

---

## Casos de Uso Comunes

### Caso 1: Empresa con IVA Estándar

**Configuración:**
```typescript
// Crear IVA 19% como predeterminado
await taxConfigService.create({
  name: 'IVA 19%',
  rate: 19,
  applicationType: TaxApplicationType.ADDITIONAL,
  isDefault: true,
  isActive: true
});
```

**Todas las facturas automáticamente tendrán IVA 19%**

### Caso 2: Empresa con Múltiples Impuestos

**Configuración:**
```typescript
// IVA estándar (por defecto)
const ivaStandard = await taxConfigService.create({
  name: 'IVA 19%',
  rate: 19,
  applicationType: TaxApplicationType.ADDITIONAL,
  isDefault: true,
  isActive: true
});

// IVA reducido para productos específicos
const ivaReducido = await taxConfigService.create({
  name: 'IVA 5%',
  rate: 5,
  applicationType: TaxApplicationType.ADDITIONAL,
  isDefault: false,
  isActive: true
});

// Sin impuesto para exportaciones
const sinImpuesto = await taxConfigService.create({
  name: 'Exportación 0%',
  rate: 0,
  applicationType: TaxApplicationType.ADDITIONAL,
  isDefault: false,
  isActive: true
});
```

**Uso:**
```typescript
// Factura normal (usa IVA 19% por defecto)
const facturaNormal = await invoicesService.create({
  tenantId: 'tenant-123',
  amount: 100000,
  // ... otros campos
});

// Factura con IVA reducido
const facturaReducida = await invoicesService.create({
  tenantId: 'tenant-123',
  taxConfigId: ivaReducido.id,
  amount: 100000,
  // ... otros campos
});

// Factura de exportación
const facturaExportacion = await invoicesService.create({
  tenantId: 'tenant-123',
  taxConfigId: sinImpuesto.id,
  amount: 100000,
  // ... otros campos
});
```

### Caso 3: ONG con Facturas Exentas

**Todas las facturas sin impuesto:**
```typescript
const invoice = await invoicesService.create({
  tenantId: 'ong-tenant-id',
  taxExempt: true,
  taxExemptReason: 'Entidad sin ánimo de lucro - Resolución DIAN 12345',
  amount: 50000,
  total: 50000,
  // ... otros campos
});
```

### Caso 4: Cambiar Impuesto por Defecto

```typescript
// Obtener todos los impuestos
const impuestos = await taxConfigService.getAll();

// Establecer nuevo impuesto por defecto
await taxConfigService.setDefault(impuestos[1].id);

// Ahora todas las nuevas facturas usarán este impuesto
```

---

## API Endpoints

### Tax Config Endpoints

#### GET /api/invoices/tax-configs
Obtener todas las configuraciones de impuestos

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "IVA 19%",
    "rate": 19,
    "applicationType": "additional",
    "isActive": true,
    "isDefault": true,
    "description": "Impuesto estándar",
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-01-20T10:00:00Z"
  }
]
```

#### GET /api/invoices/tax-configs/active
Obtener solo impuestos activos

#### GET /api/invoices/tax-configs/default
Obtener el impuesto por defecto

#### POST /api/invoices/tax-configs
Crear nueva configuración

**Request:**
```json
{
  "name": "IVA 19%",
  "rate": 19,
  "applicationType": "additional",
  "isActive": true,
  "isDefault": true,
  "description": "Impuesto estándar"
}
```

#### PATCH /api/invoices/tax-configs/:id
Actualizar configuración

#### PATCH /api/invoices/tax-configs/:id/set-default
Establecer como predeterminado

#### DELETE /api/invoices/tax-configs/:id
Eliminar configuración (no permite eliminar el predeterminado)

#### POST /api/invoices/tax-configs/:id/calculate
Calcular impuesto para un monto

**Request:**
```json
{
  "amount": 100000
}
```

**Response:**
```json
{
  "tax": 19000,
  "total": 119000
}
```

### Invoice Endpoints

#### POST /api/invoices
Crear factura

**Request (Normal):**
```json
{
  "tenantId": "uuid",
  "amount": 100000,
  "total": 119000,
  "dueDate": "2026-02-20",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "items": [
    {
      "description": "Plan Emprendedor",
      "quantity": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ]
}
```

**Request (Exenta):**
```json
{
  "tenantId": "uuid",
  "taxExempt": true,
  "taxExemptReason": "ONG registrada",
  "amount": 100000,
  "total": 100000,
  "dueDate": "2026-02-20",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "items": [
    {
      "description": "Donación",
      "quantity": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-202601-1234",
  "tenantId": "uuid",
  "taxConfigId": "uuid",
  "taxExempt": false,
  "taxExemptReason": null,
  "amount": 100000,
  "tax": 19000,
  "total": 119000,
  "status": "pending",
  "dueDate": "2026-02-20",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "items": [...],
  "createdAt": "2026-01-20T10:00:00Z"
}
```

---

## 🧪 Testing

### Test 1: Crear Impuesto y Usarlo

```typescript
// 1. Crear impuesto
const taxConfig = await taxConfigService.create({
  name: 'Test IVA',
  rate: 10,
  applicationType: TaxApplicationType.ADDITIONAL,
  isDefault: false,
  isActive: true
});

// 2. Crear factura con ese impuesto
const invoice = await invoicesService.create({
  tenantId: 'test-tenant',
  taxConfigId: taxConfig.id,
  amount: 100000,
  total: 110000,
  // ... otros campos
});

// 3. Verificar
console.assert(invoice.tax === 10000, 'Tax should be 10000');
console.assert(invoice.total === 110000, 'Total should be 110000');
```

### Test 2: Factura Exenta

```typescript
const invoice = await invoicesService.create({
  tenantId: 'test-tenant',
  taxExempt: true,
  taxExemptReason: 'Test exemption',
  amount: 100000,
  total: 100000,
  // ... otros campos
});

console.assert(invoice.tax === 0, 'Tax should be 0');
console.assert(invoice.taxExempt === true, 'Should be exempt');
console.assert(invoice.taxConfigId === null, 'Should not have taxConfigId');
```

---

## 💡 Tips y Mejores Prácticas

1. **Siempre tener un impuesto por defecto activo**
   - Evita errores en facturas automáticas
   - Facilita la creación de facturas

2. **Usar nombres descriptivos**
   - "IVA 19% - Estándar"
   - "IVA 5% - Productos Básicos"
   - "Exportación 0%"

3. **Documentar razones de exención**
   - Incluir número de resolución
   - Referencia legal
   - Tipo de entidad

4. **No eliminar impuestos con facturas asociadas**
   - Mejor desactivarlos (`isActive: false`)
   - Mantiene integridad histórica

5. **Validar antes de crear facturas exentas**
   - Verificar documentación legal
   - Confirmar elegibilidad
   - Guardar evidencia

---

## 🔍 Troubleshooting

### Problema: "Debe proporcionar una razón para la exención"
```typescript
// ❌ Incorrecto
const invoice = await invoicesService.create({
  taxExempt: true,
  // Falta taxExemptReason
});

// ✅ Correcto
const invoice = await invoicesService.create({
  taxExempt: true,
  taxExemptReason: 'Razón válida',
});
```

### Problema: Impuesto no se aplica
```typescript
// Verificar que el impuesto esté activo
const taxConfig = await taxConfigService.getById('tax-id');
console.log(taxConfig.isActive); // Debe ser true

// Verificar que haya un impuesto por defecto
const defaultTax = await taxConfigService.getDefault();
console.log(defaultTax); // No debe ser null
```

---

## 📞 Soporte

Para más información, consulta:
- `doc/14-impuestos/README.md`
- `doc/14-impuestos/MEJORAS_IMPLEMENTADAS.md`
