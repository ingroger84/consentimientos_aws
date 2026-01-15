# Corrección de Items Vacíos en PDF de Facturas

## Problema Identificado

El PDF de facturas mostraba una tabla de items vacía, aunque los items estaban correctamente guardados en la base de datos.

## Diagnóstico

### 1. Verificación en Base de Datos

Se creó un script de verificación (`backend/check-invoice-items.ts`) que confirmó que los items SÍ están guardados correctamente en el campo JSONB:

```json
[
  {
    "total": 89900,
    "quantity": 1,
    "unitPrice": 89900,
    "description": "Plan Básico - Mensual"
  }
]
```

### 2. Causa Raíz

El problema estaba en el método `findOne()` del servicio de facturas. Al usar `findOne()` con `relations`, TypeORM no siempre carga correctamente los campos JSONB.

**Código anterior (problemático):**
```typescript
async findOne(id: string): Promise<Invoice> {
  const invoice = await this.invoicesRepository.findOne({
    where: { id },
    relations: ['tenant', 'payments'],
  });

  if (!invoice) {
    throw new NotFoundException('Factura no encontrada');
  }

  return invoice;
}
```

## Solución Implementada

Se modificó el método `findOne()` para usar `createQueryBuilder()` con `leftJoinAndSelect()`, que garantiza la carga correcta de todos los campos, incluyendo JSONB:

**Código corregido:**
```typescript
async findOne(id: string): Promise<Invoice> {
  const invoice = await this.invoicesRepository
    .createQueryBuilder('invoice')
    .leftJoinAndSelect('invoice.tenant', 'tenant')
    .leftJoinAndSelect('invoice.payments', 'payments')
    .where('invoice.id = :id', { id })
    .getOne();

  if (!invoice) {
    throw new NotFoundException('Factura no encontrada');
  }

  // Asegurar que items sea un array
  if (!invoice.items) {
    invoice.items = [];
  }

  return invoice;
}
```

## Mejoras Adicionales

### 1. Fallback en Generación de PDF

Se agregó un fallback en el método `addItemsTable()` del servicio de PDF para manejar casos donde no hay items:

```typescript
// Verificar si hay items
const items = invoice.items && invoice.items.length > 0 ? invoice.items : [];

if (items.length === 0) {
  // Si no hay items, mostrar un mensaje
  doc
    .fillColor('#9ca3af')
    .text('No hay items registrados', 50, currentY, { width: 522, align: 'center' });
  currentY += 20;
} else {
  // Mostrar items normalmente
  items.forEach((item, index) => {
    // ... código de renderizado
  });
}
```

### 2. Logging para Debug

Se agregó logging en el controller para facilitar el diagnóstico:

```typescript
// Log para debug
console.log('Invoice items:', JSON.stringify(invoice.items, null, 2));
console.log('Invoice data:', {
  id: invoice.id,
  invoiceNumber: invoice.invoiceNumber,
  itemsCount: invoice.items?.length || 0,
});
```

## Archivos Modificados

1. **backend/src/invoices/invoices.service.ts**
   - Método `findOne()` modificado para usar `createQueryBuilder()`

2. **backend/src/invoices/invoice-pdf.service.ts**
   - Método `addItemsTable()` con fallback para items vacíos

3. **backend/src/invoices/invoices.controller.ts**
   - Logging agregado en endpoint `/preview`

## Script de Verificación

Se creó el script `backend/check-invoice-items.ts` para verificar directamente en la base de datos el contenido del campo items:

```bash
npx ts-node check-invoice-items.ts
```

Este script muestra:
- ID y número de factura
- Montos (subtotal, IVA, total)
- Tipo y contenido del campo items
- Cantidad de items
- Estructura JSON completa de los items

## Resultado

Ahora el PDF de facturas muestra correctamente la tabla de items con:
- Descripción del servicio
- Cantidad
- Precio unitario
- Total por item

El PDF se mantiene optimizado en 1 página con toda la información necesaria.

## Lecciones Aprendidas

1. **TypeORM y JSONB**: Al trabajar con campos JSONB en TypeORM, es preferible usar `createQueryBuilder()` en lugar de `findOne()` con `relations` para garantizar la carga correcta de todos los campos.

2. **Verificación Directa**: Cuando hay problemas con datos, verificar directamente en la base de datos ayuda a identificar si el problema es de almacenamiento o de carga.

3. **Fallbacks**: Siempre incluir fallbacks para casos edge (como arrays vacíos) mejora la robustez del sistema.

4. **Logging**: Agregar logging estratégico facilita el diagnóstico de problemas en producción.
