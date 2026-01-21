# Ejemplos de Uso - Facturación Manual

## Ejemplo 1: Factura Mensual con IVA

### Escenario
Crear factura mensual para un tenant con plan Premium que debe pagar IVA.

### Datos de Entrada
- **Tenant:** Clínica ABC
- **Exenta:** No
- **Impuesto:** IVA 19% (Adicional)
- **Fecha Vencimiento:** 2026-02-20
- **Período:** 2026-01-20 a 2026-02-20

### Items
| Descripción | Cantidad | Precio Unit. | Total |
|------------|----------|--------------|-------|
| Plan Premium - Mensual | 1 | $100,000 | $100,000 |

### Cálculos
```
Subtotal: $100,000
IVA 19%:  $19,000 (100,000 * 0.19)
Total:    $119,000
```

### Resultado en Base de Datos
```json
{
  "tenantId": "uuid-tenant-abc",
  "taxConfigId": "uuid-iva-19",
  "taxExempt": false,
  "taxExemptReason": null,
  "amount": 100000,
  "tax": 19000,
  "total": 119000,
  "items": [
    {
      "description": "Plan Premium - Mensual",
      "quantity": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ]
}
```

---

## Ejemplo 2: Factura Exenta de Impuestos

### Escenario
Crear factura para una organización sin fines de lucro que está exenta de impuestos.

### Datos de Entrada
- **Tenant:** Fundación XYZ
- **Exenta:** Sí
- **Razón:** "Organización sin fines de lucro - Resolución DIAN 12345 del 15/01/2025"
- **Fecha Vencimiento:** 2026-02-20
- **Período:** 2026-01-20 a 2026-02-20

### Items
| Descripción | Cantidad | Precio Unit. | Total |
|------------|----------|--------------|-------|
| Plan Básico - Mensual | 1 | $50,000 | $50,000 |

### Cálculos
```
Subtotal: $50,000
Impuesto: EXENTA
Total:    $50,000
```

### Resultado en Base de Datos
```json
{
  "tenantId": "uuid-fundacion-xyz",
  "taxConfigId": null,
  "taxExempt": true,
  "taxExemptReason": "Organización sin fines de lucro - Resolución DIAN 12345 del 15/01/2025",
  "amount": 50000,
  "tax": 0,
  "total": 50000,
  "items": [
    {
      "description": "Plan Básico - Mensual",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000
    }
  ]
}
```

---

## Ejemplo 3: Factura con Múltiples Items

### Escenario
Crear factura compleja con varios conceptos para un hospital.

### Datos de Entrada
- **Tenant:** Hospital DEF
- **Exenta:** No
- **Impuesto:** IVA 19% (Adicional)
- **Fecha Vencimiento:** 2026-02-20
- **Período:** 2026-01-20 a 2026-02-20

### Items
| Descripción | Cantidad | Precio Unit. | Total |
|------------|----------|--------------|-------|
| Plan Premium - Mensual | 1 | $100,000 | $100,000 |
| Usuarios adicionales | 5 | $10,000 | $50,000 |
| Soporte técnico premium | 1 | $30,000 | $30,000 |

### Cálculos
```
Subtotal: $180,000 (100,000 + 50,000 + 30,000)
IVA 19%:  $34,200 (180,000 * 0.19)
Total:    $214,200
```

### Resultado en Base de Datos
```json
{
  "tenantId": "uuid-hospital-def",
  "taxConfigId": "uuid-iva-19",
  "taxExempt": false,
  "taxExemptReason": null,
  "amount": 180000,
  "tax": 34200,
  "total": 214200,
  "items": [
    {
      "description": "Plan Premium - Mensual",
      "quantity": 1,
      "unitPrice": 100000,
      "total": 100000
    },
    {
      "description": "Usuarios adicionales",
      "quantity": 5,
      "unitPrice": 10000,
      "total": 50000
    },
    {
      "description": "Soporte técnico premium",
      "quantity": 1,
      "unitPrice": 30000,
      "total": 30000
    }
  ]
}
```

---

## Ejemplo 4: Factura Anual con Descuento

### Escenario
Crear factura anual con descuento aplicado.

### Datos de Entrada
- **Tenant:** Empresa GHI
- **Exenta:** No
- **Impuesto:** IVA 19% (Adicional)
- **Fecha Vencimiento:** 2026-02-20
- **Período:** 2026-01-20 a 2027-01-20

### Items
| Descripción | Cantidad | Precio Unit. | Total |
|------------|----------|--------------|-------|
| Plan Premium - Anual | 1 | $1,000,000 | $1,000,000 |
| Descuento pago anual | 1 | -$200,000 | -$200,000 |

### Cálculos
```
Subtotal: $800,000 (1,000,000 - 200,000)
IVA 19%:  $152,000 (800,000 * 0.19)
Total:    $952,000
```

### Resultado en Base de Datos
```json
{
  "tenantId": "uuid-empresa-ghi",
  "taxConfigId": "uuid-iva-19",
  "taxExempt": false,
  "taxExemptReason": null,
  "amount": 800000,
  "tax": 152000,
  "total": 952000,
  "items": [
    {
      "description": "Plan Premium - Anual",
      "quantity": 1,
      "unitPrice": 1000000,
      "total": 1000000
    },
    {
      "description": "Descuento pago anual",
      "quantity": 1,
      "unitPrice": -200000,
      "total": -200000
    }
  ],
  "notes": "Descuento del 20% por pago anual anticipado"
}
```

---

## Ejemplo 5: Factura con Impuesto Incluido

### Escenario
Crear factura donde el impuesto ya está incluido en el precio.

### Datos de Entrada
- **Tenant:** Clínica JKL
- **Exenta:** No
- **Impuesto:** IVA 19% (Incluido)
- **Fecha Vencimiento:** 2026-02-20
- **Período:** 2026-01-20 a 2026-02-20

### Items
| Descripción | Cantidad | Precio Unit. | Total |
|------------|----------|--------------|-------|
| Plan Premium - Mensual (IVA incluido) | 1 | $119,000 | $119,000 |

### Cálculos
```
Precio con IVA: $119,000
Base imponible: $100,000 (119,000 / 1.19)
IVA 19%:        $19,000 (119,000 - 100,000)
Total:          $119,000
```

### Resultado en Base de Datos
```json
{
  "tenantId": "uuid-clinica-jkl",
  "taxConfigId": "uuid-iva-19-incluido",
  "taxExempt": false,
  "taxExemptReason": null,
  "amount": 119000,
  "tax": 19000,
  "total": 119000,
  "items": [
    {
      "description": "Plan Premium - Mensual (IVA incluido)",
      "quantity": 1,
      "unitPrice": 119000,
      "total": 119000
    }
  ]
}
```

---

## Casos de Error Comunes

### Error 1: Factura Exenta sin Razón
```
❌ Error: Debe proporcionar una razón para la exención de impuestos

Solución: Marcar checkbox "Factura Exenta" y llenar el campo "Razón de Exención"
```

### Error 2: Factura sin Impuesto Seleccionado
```
❌ Error: Debe seleccionar un impuesto

Solución: Si no es exenta, seleccionar un impuesto del dropdown
```

### Error 3: Items sin Descripción
```
❌ Error: Todos los items deben tener descripción

Solución: Llenar el campo "Descripción" en todos los items
```

### Error 4: Tenant No Encontrado
```
❌ Error: Tenant no encontrado

Solución: Verificar que el tenant existe y está activo
```

---

## Flujo de Prueba Completo

### Paso 1: Preparación
1. Asegurarse de tener al menos un tenant activo
2. Configurar al menos un impuesto activo en `/tax-config`
3. Iniciar sesión como Super Administrador

### Paso 2: Crear Factura con IVA
1. Ir a `/billing`
2. Clic en "Crear Factura Manual"
3. Seleccionar un tenant
4. Dejar "Factura Exenta" desmarcado
5. Seleccionar "IVA 19% (Adicional)"
6. Agregar item: "Plan Premium - Mensual", 1, $100,000
7. Verificar cálculos: Subtotal $100,000, IVA $19,000, Total $119,000
8. Clic en "Crear Factura"
9. Verificar mensaje de éxito

### Paso 3: Crear Factura Exenta
1. Ir a `/billing`
2. Clic en "Crear Factura Manual"
3. Seleccionar un tenant
4. Marcar "Factura Exenta de Impuestos"
5. Ingresar razón: "Organización sin fines de lucro - Resolución DIAN 12345"
6. Agregar item: "Plan Básico - Mensual", 1, $50,000
7. Verificar cálculos: Subtotal $50,000, Impuesto EXENTA, Total $50,000
8. Clic en "Crear Factura"
9. Verificar mensaje de éxito

### Paso 4: Verificar Facturas Creadas
1. Ir a `/invoices`
2. Verificar que las facturas aparecen en la lista
3. Verificar badges:
   - Factura con IVA: debe mostrar el impuesto
   - Factura exenta: debe mostrar badge "EXENTA"
4. Descargar PDF y verificar contenido
5. Verificar que se enviaron los emails

---

## Notas de Implementación

### Cálculo de Impuestos

**Impuesto Adicional:**
```javascript
const tax = subtotal * (rate / 100);
const total = subtotal + tax;
```

**Impuesto Incluido:**
```javascript
const baseAmount = subtotal / (1 + rate / 100);
const tax = subtotal - baseAmount;
const total = subtotal; // Ya incluye el impuesto
```

### Validaciones Frontend
```javascript
// Validar factura exenta
if (formData.taxExempt && !formData.taxExemptReason.trim()) {
  showMessage('Error: Debe proporcionar una razón para la exención de impuestos');
  return;
}

// Validar impuesto seleccionado
if (!formData.taxExempt && !formData.taxConfigId) {
  showMessage('Error: Debe seleccionar un impuesto');
  return;
}

// Validar items
if (formData.items.some(item => !item.description.trim())) {
  showMessage('Error: Todos los items deben tener descripción');
  return;
}
```

### Validaciones Backend
```typescript
// Validar razón de exención
if (taxExempt && !taxExemptReason) {
  throw new BadRequestException('Debe proporcionar una razón para la exención de impuestos');
}

// Validar tenant
const tenant = await this.tenantsRepository.findOne({ where: { id: tenantId } });
if (!tenant) {
  throw new NotFoundException('Tenant no encontrado');
}
```
