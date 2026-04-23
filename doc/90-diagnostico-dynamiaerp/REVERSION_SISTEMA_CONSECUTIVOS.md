# Reversión del Sistema de Consecutivos DynamiaERP

**Fecha:** 20 de abril de 2026  
**Versión:** v91  
**Estado:** ✅ Completado

## Contexto

El usuario solicitó revertir el sistema de consecutivos por tenant (formato 001-0001, 002-0001, etc.) y volver a usar el número de factura original del sistema (INV-202604-XXXX).

## Cambios Realizados

### 1. ✅ Servicio de Facturas (`backend/src/invoices/invoices.service.ts`)

**Cambio:** Revertido el uso del número original de la factura en lugar del sistema de consecutivos por tenant.

```typescript
// ANTES (Sistema de consecutivos por tenant)
numero: `${tenant.dynamiaerpBranchCode}-${String(tenant.dynamiaerpLastInvoiceNumber + 1).padStart(4, '0')}`,
sucursal: tenant.dynamiaerpBranchCode,

// DESPUÉS (Número original del sistema)
numero: invoice.invoiceNumber, // Usar número original de la factura
sucursal: '001', // Hardcodeado como indicó soporte
```

**Línea:** 840 en `sendToDynamiaErp()`

### 2. ✅ Script de Reenvío (`backend/resend-invoice-to-dynamiaerp.js`)

**Cambios realizados:**

1. Eliminada la lógica de obtención de código de sucursal y consecutivo del tenant
2. Usar directamente `invoice.invoiceNumber` como número de factura
3. Hardcodear sucursal a "001"
4. Eliminar actualización de consecutivo en la base de datos

```javascript
// ANTES
const tenant = tenants[0];
const nextInvoiceNumber = tenant.dynamiaerp_last_invoice_number + 1;
const formattedInvoiceNumber = `${tenant.dynamiaerp_branch_code}-${String(nextInvoiceNumber).padStart(4, '0')}`;

// DESPUÉS
const formattedInvoiceNumber = invoice.invoiceNumber;
```

### 3. ✅ Script de Prueba (`backend/test-invoice-format.js`)

**Creado:** Script para verificar el formato de la factura sin enviar realmente a DynamiaERP.

**Uso:**
```bash
node test-invoice-format.js INV-202604-3740
```

**Salida:**
```
✅ FORMATO CORRECTO - Usando número original del sistema

📋 Datos que se enviarían a DynamiaERP:
{
  "tipo": "REMISION",
  "numero": "INV-202604-3740",  ← Número original del sistema
  "sucursal": "001",             ← Hardcodeado
  "observaciones": "LINK DE PAGO",
  "detalles": [{
    "nombre": "LINK DE PAGO",    ← Nombre del producto
    ...
  }]
}
```

## Verificaciones Realizadas

### ✅ Compilación
```bash
# Sin errores de TypeScript
getDiagnostics: No diagnostics found
```

### ✅ Formato de Factura
- Número de factura: `INV-202604-3740` (número original del sistema)
- Sucursal: `001` (hardcodeado)
- Observaciones: `LINK DE PAGO`
- Nombre producto: `LINK DE PAGO`
- Formato de fechas: `"YYYY-MM-DD HH:mm:ss"`

## Campos de Base de Datos que Ya No Se Usan

Los siguientes campos fueron agregados en la migración pero ya no se utilizarán:

### Tabla `tenants`
- `dynamiaerp_branch_code` (VARCHAR(3))
- `dynamiaerp_last_invoice_number` (INTEGER DEFAULT 0)

**Nota:** Estos campos pueden eliminarse en una futura migración de limpieza, pero no afectan el funcionamiento actual del sistema.

## Próximos Pasos

1. ✅ Código revertido y compilando correctamente
2. ✅ Script de reenvío actualizado
3. ✅ Script de prueba creado y verificado
4. ⏳ Desplegar a producción
5. ⏳ Probar con una nueva factura en producción
6. ⏳ (Opcional) Crear migración para eliminar campos no utilizados

## Comandos Útiles

### Probar formato de factura (sin enviar)
```bash
cd backend
node test-invoice-format.js INV-202604-3740
```

### Reenviar factura a DynamiaERP
```bash
cd backend
node resend-invoice-to-dynamiaerp.js INV-202604-3740
```

### Compilar backend
```bash
cd backend
npm run build
```

## Resumen

✅ Sistema de consecutivos por tenant revertido exitosamente  
✅ Ahora se usa el número de factura original del sistema (INV-202604-XXXX)  
✅ Sucursal hardcodeada a "001" como indicó soporte de DynamiaERP  
✅ Código compilando sin errores  
✅ Scripts actualizados y probados  

El sistema está listo para desplegar a producción.
