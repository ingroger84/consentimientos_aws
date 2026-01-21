# Impuestos Dinámicos en Facturas

## Descripción del Cambio

Se implementó un sistema dinámico que refleja el estado actual de los impuestos en las facturas, tanto en el PDF como en las vistas del frontend. Esto significa que si un impuesto se activa o desactiva, los cambios se reflejan inmediatamente en todas las facturas que lo usan.

## Comportamiento Implementado

### Escenarios Cubiertos

#### 1. Factura Exenta
**Condición:** `invoice.taxExempt = true`

**Visualización:**
- **PDF:** Muestra "EXENTA" en verde
- **Frontend:** Muestra "EXENTA" en verde
- **Razón:** Se muestra en un recuadro verde si existe

**Ejemplo:**
```
Subtotal: $100,000
Impuesto: EXENTA
Total: $100,000
```

#### 2. Factura con Impuesto Activo
**Condición:** `invoice.taxConfig` existe Y `invoice.taxConfig.isActive = true`

**Visualización:**
- **PDF:** Muestra nombre y tasa actual del impuesto
- **Frontend:** Muestra nombre y tasa actual del impuesto
- **Valor:** Muestra el valor del impuesto registrado

**Ejemplo:**
```
Subtotal: $100,000
IVA (19%): $19,000
Total: $119,000
```

#### 3. Factura con Impuesto Desactivado
**Condición:** `invoice.taxConfig` existe PERO `invoice.taxConfig.isActive = false` Y `invoice.tax > 0`

**Visualización:**
- **PDF:** Muestra "Impuesto: (Desactivado)" en gris
- **Frontend:** Muestra "Impuesto: (Desactivado)" en gris
- **Nota:** No muestra el valor del impuesto

**Ejemplo:**
```
Subtotal: $100,000
Impuesto: (Desactivado)
Total: $119,000
```

**Nota:** El total sigue siendo el mismo que se registró originalmente.

#### 4. Factura sin Impuesto
**Condición:** `invoice.taxConfigId = null` Y `invoice.tax = 0`

**Visualización:**
- **PDF:** Muestra "Impuesto: $0"
- **Frontend:** Muestra "Impuesto: $0"

**Ejemplo:**
```
Subtotal: $100,000
Impuesto: $0
Total: $100,000
```

## Implementación Técnica

### Backend - invoice-pdf.service.ts

#### Método `addTotals()` Modificado

```typescript
private addTotals(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number) {
  const labelX = 400;
  const valueX = 510;
  let currentY = startY;

  // Subtotal
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#6b7280')
    .text('Subtotal:', labelX, currentY, { width: 100, align: 'right' })
    .fillColor('#374151')
    .text(this.formatCurrency(invoice.amount), valueX, currentY, {
      width: 62,
      align: 'right',
    });

  currentY += 18;

  // Impuesto - Mostrar dinámicamente según configuración actual
  if (invoice.taxExempt) {
    // Factura exenta
    doc
      .fillColor('#6b7280')
      .text('Impuesto:', labelX, currentY, { width: 100, align: 'right' })
      .fillColor('#10b981')
      .font('Helvetica-Bold')
      .text('EXENTA', valueX, currentY, {
        width: 62,
        align: 'right',
      });
  } else if (invoice.taxConfig && invoice.taxConfig.isActive) {
    // Impuesto activo - mostrar con nombre y tasa actual
    const taxLabel = `${invoice.taxConfig.name} (${invoice.taxConfig.rate}%):`;
    doc
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(taxLabel, labelX, currentY, { width: 100, align: 'right' })
      .fillColor('#374151')
      .text(this.formatCurrency(invoice.tax), valueX, currentY, {
        width: 62,
        align: 'right',
      });
  } else if (invoice.tax > 0) {
    // Impuesto desactivado pero la factura tiene impuesto registrado
    doc
      .fillColor('#6b7280')
      .text('Impuesto:', labelX, currentY, { width: 100, align: 'right' })
      .fillColor('#9ca3af')
      .font('Helvetica')
      .fontSize(8)
      .text('(Desactivado)', valueX - 10, currentY, {
        width: 72,
        align: 'right',
      });
    currentY -= 10; // Ajustar para no dejar espacio extra
  } else {
    // Sin impuesto
    doc
      .fillColor('#6b7280')
      .text('Impuesto:', labelX, currentY, { width: 100, align: 'right' })
      .fillColor('#374151')
      .text(this.formatCurrency(0), valueX, currentY, {
        width: 62,
        align: 'right',
      });
  }

  currentY += 20;

  // Total (resto del código...)
}
```

**Características:**
- ✅ Verifica `invoice.taxExempt` primero
- ✅ Luego verifica si `taxConfig` existe y está activo
- ✅ Maneja el caso de impuesto desactivado
- ✅ Maneja el caso sin impuesto
- ✅ Usa colores diferentes para cada estado

### Frontend - InvoicesPage.tsx y TenantInvoicesPage.tsx

#### Visualización Dinámica

```tsx
{invoice.taxExempt ? (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Impuesto:</span>
    <span className="text-green-600 font-medium">EXENTA</span>
  </div>
) : invoice.taxConfig && invoice.taxConfig.isActive ? (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">
      {invoice.taxConfig.name} ({invoice.taxConfig.rate}%):
    </span>
    <span className="text-gray-900">
      {invoicesService.formatCurrency(invoice.tax)}
    </span>
  </div>
) : invoice.tax > 0 ? (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Impuesto:</span>
    <span className="text-gray-400 text-xs">(Desactivado)</span>
  </div>
) : (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Impuesto:</span>
    <span className="text-gray-900">
      {invoicesService.formatCurrency(0)}
    </span>
  </div>
)}
```

**Características:**
- ✅ Muestra "EXENTA" en verde para facturas exentas
- ✅ Muestra nombre y tasa del impuesto si está activo
- ✅ Muestra "(Desactivado)" en gris si el impuesto fue desactivado
- ✅ Muestra $0 si no hay impuesto

## Flujo de Decisión

```
Al generar PDF o mostrar factura:
├─ ¿Es taxExempt = true?
│  └─ SÍ → Mostrar "EXENTA" en verde
│
└─ NO → ¿Existe taxConfig?
    ├─ NO → ¿tax > 0?
    │   ├─ SÍ → Mostrar "Impuesto: (Desactivado)"
    │   └─ NO → Mostrar "Impuesto: $0"
    │
    └─ SÍ → ¿taxConfig.isActive = true?
        ├─ SÍ → Mostrar "{name} ({rate}%): ${tax}"
        └─ NO → ¿tax > 0?
            ├─ SÍ → Mostrar "Impuesto: (Desactivado)"
            └─ NO → Mostrar "Impuesto: $0"
```

## Casos de Uso

### Caso 1: Activar Impuesto Después de Crear Factura

**Escenario:**
1. Crear factura sin impuestos (todos desactivados)
2. Factura se crea con `tax = 0`, `taxConfigId = null`
3. Activar un impuesto en `/tax-config`
4. Ver la factura nuevamente

**Resultado:**
- ✅ La factura sigue mostrando `Impuesto: $0`
- ✅ El total no cambia
- ✅ Nuevas facturas usarán el impuesto activado

### Caso 2: Desactivar Impuesto de Factura Existente

**Escenario:**
1. Crear factura con IVA 19% activo
2. Factura se crea con `tax = 19000`, `taxConfigId = uuid-iva-19`
3. Desactivar el IVA en `/tax-config`
4. Ver la factura nuevamente

**Resultado:**
- ✅ PDF muestra "Impuesto: (Desactivado)"
- ✅ Frontend muestra "Impuesto: (Desactivado)"
- ✅ El total sigue siendo $119,000 (no cambia)
- ✅ No se muestra el valor del impuesto

### Caso 3: Cambiar Tasa de Impuesto

**Escenario:**
1. Crear factura con IVA 19%
2. Factura se crea con `tax = 19000` (calculado con 19%)
3. Cambiar tasa del IVA a 21% en `/tax-config`
4. Ver la factura nuevamente

**Resultado:**
- ✅ PDF muestra "IVA (21%): $19,000"
- ✅ Frontend muestra "IVA (21%): $19,000"
- ✅ Muestra la tasa ACTUAL (21%) pero el valor ORIGINAL ($19,000)
- ✅ El total no cambia

**Nota:** Esto puede causar confusión. Ver sección "Consideraciones" abajo.

### Caso 4: Cambiar Nombre de Impuesto

**Escenario:**
1. Crear factura con "IVA"
2. Cambiar nombre a "Impuesto al Valor Agregado"
3. Ver la factura nuevamente

**Resultado:**
- ✅ PDF muestra "Impuesto al Valor Agregado (19%): $19,000"
- ✅ Frontend muestra "Impuesto al Valor Agregado (19%): $19,000"
- ✅ Se refleja el nombre ACTUAL del impuesto

## Consideraciones Importantes

### 1. Inmutabilidad de Valores

**Importante:** Los valores monetarios de la factura NO cambian:
- `invoice.amount` (subtotal) → Inmutable
- `invoice.tax` (impuesto) → Inmutable
- `invoice.total` (total) → Inmutable

**Solo cambia la VISUALIZACIÓN:**
- Nombre del impuesto
- Tasa del impuesto
- Estado (activo/desactivado)

### 2. Posible Confusión con Cambio de Tasa

Si cambias la tasa de un impuesto después de crear facturas, verás:
```
IVA (21%): $19,000
```

Esto puede confundir porque:
- La tasa mostrada es 21% (actual)
- Pero el valor es $19,000 (calculado con 19%)

**Solución sugerida:** Agregar nota en el PDF cuando la tasa cambió.

### 3. Auditoría

Para auditoría, los valores originales están en la base de datos:
```sql
SELECT 
  invoice_number,
  amount,
  tax,
  total,
  tax_config_id,
  created_at
FROM invoices;
```

Los valores nunca cambian, solo la visualización del nombre/tasa.

## Ventajas del Sistema Dinámico

### ✅ Ventajas

1. **Flexibilidad:** Puedes activar/desactivar impuestos sin afectar facturas
2. **Claridad:** Se ve claramente cuando un impuesto está desactivado
3. **Actualización automática:** Cambios de nombre se reflejan automáticamente
4. **Consistencia:** Mismo comportamiento en PDF y frontend

### ⚠️ Desventajas

1. **Confusión con cambio de tasa:** Muestra tasa actual pero valor original
2. **Dependencia de relación:** Requiere que `taxConfig` esté cargado
3. **Complejidad:** Más lógica condicional en la visualización

## Alternativa: Sistema Inmutable

Si prefieres un sistema completamente inmutable:

### Opción A: Guardar Snapshot del Impuesto

```typescript
// En la factura, guardar:
{
  taxConfigId: 'uuid',
  taxSnapshot: {
    name: 'IVA',
    rate: 19,
    isActive: true  // Estado al momento de crear
  },
  tax: 19000,
  total: 119000
}
```

**Ventajas:**
- Factura muestra exactamente lo que era al momento de crearla
- No hay confusión con cambios posteriores

**Desventajas:**
- Más datos duplicados
- No refleja cambios de nombre/estado

### Opción B: Sistema Híbrido

Mostrar ambos:
```
IVA (19% → 21%): $19,000
Nota: Tasa actual 21%, factura calculada con 19%
```

## Pruebas Recomendadas

### Prueba 1: Factura con Impuesto Activo
1. Crear factura con IVA 19% activo
2. Verificar PDF muestra "IVA (19%): $19,000"
3. Verificar frontend muestra lo mismo

### Prueba 2: Desactivar Impuesto
1. Usar factura de Prueba 1
2. Desactivar IVA en `/tax-config`
3. Regenerar PDF
4. Verificar muestra "Impuesto: (Desactivado)"
5. Verificar frontend muestra lo mismo

### Prueba 3: Reactivar Impuesto
1. Usar factura de Prueba 2
2. Reactivar IVA
3. Regenerar PDF
4. Verificar muestra "IVA (19%): $19,000" nuevamente

### Prueba 4: Cambiar Nombre
1. Crear factura con "IVA"
2. Cambiar nombre a "Impuesto al Valor Agregado"
3. Regenerar PDF
4. Verificar muestra nuevo nombre

### Prueba 5: Cambiar Tasa
1. Crear factura con IVA 19%
2. Cambiar tasa a 21%
3. Regenerar PDF
4. Verificar muestra "IVA (21%): $19,000"
5. Verificar que el total NO cambió

### Prueba 6: Factura Exenta
1. Crear factura exenta
2. Verificar muestra "EXENTA" en verde
3. Activar/desactivar impuestos
4. Verificar que sigue mostrando "EXENTA"

## Archivos Modificados

1. ✅ `backend/src/invoices/invoice-pdf.service.ts`
   - Método `addTotals()` con lógica dinámica

2. ✅ `frontend/src/pages/InvoicesPage.tsx`
   - Visualización dinámica de impuestos

3. ✅ `frontend/src/pages/TenantInvoicesPage.tsx`
   - Visualización dinámica de impuestos

## Conclusión

El sistema ahora refleja dinámicamente el estado actual de los impuestos en todas las facturas, tanto en PDF como en el frontend. Los valores monetarios permanecen inmutables, pero la visualización se adapta al estado actual de la configuración de impuestos.

**Comportamiento clave:**
- ✅ Facturas exentas siempre muestran "EXENTA"
- ✅ Impuestos activos muestran nombre y tasa actual
- ✅ Impuestos desactivados muestran "(Desactivado)"
- ✅ Sin impuestos muestra "$0"
- ✅ Los valores monetarios NUNCA cambian
