# Fechas de Facturación en Tenant Card

**Fecha**: 20 de Enero de 2026, 7:30 PM  
**Estado**: ✅ IMPLEMENTADO

---

## Cambio Implementado

Se agregaron dos campos informativos en cada tarjeta de tenant (TenantCard):

1. **Fecha de Creación**: Muestra cuándo se creó la cuenta del tenant
2. **Próxima Factura**: Calcula y muestra la fecha de la próxima factura (un mes después de la creación)

---

## Características

### 1. Cálculo Automático
- La próxima factura se calcula automáticamente sumando 1 mes a la fecha de creación
- Se actualiza en tiempo real según la fecha actual

### 2. Indicador Visual de Días Restantes
El sistema muestra cuántos días faltan para la próxima factura con colores:

- 🔴 **Rojo**: Factura vencida (días negativos)
- 🟠 **Naranja**: Vence en 7 días o menos
- 🟡 **Amarillo**: Vence en 15 días o menos
- 🟢 **Verde**: Más de 15 días

### 3. Textos Descriptivos
- "Vencida hace X días" - Si ya pasó la fecha
- "Vence hoy" - Si vence hoy
- "Vence mañana" - Si vence mañana
- "Vence en X días" - Si vence en 7 días o menos
- "En X días" - Si vence en más de 7 días

---

## Archivos Modificados

### 1. `frontend/src/utils/billing-dates.ts` (NUEVO)

Utilidades para cálculo de fechas de facturación:

```typescript
// Funciones principales:
- getNextInvoiceDate(createdAt): Calcula la próxima fecha de factura
- getDaysUntilNextInvoice(createdAt): Calcula días restantes
- formatDate(date): Formatea fecha en español
- getInvoiceDaysColor(days): Obtiene color según días restantes
- getInvoiceDaysText(days): Obtiene texto descriptivo
```

### 2. `frontend/src/components/TenantCard.tsx` (MODIFICADO)

Se agregó una nueva sección "Billing Information" que muestra:
- Fecha de creación con ícono de calendario
- Próxima factura con ícono de reloj
- Días restantes con color dinámico

---

## Ejemplo Visual

```
┌─────────────────────────────────────┐
│  Tenant Card                        │
├─────────────────────────────────────┤
│  ...                                │
│  (Consumo de Recursos)              │
├─────────────────────────────────────┤
│  📅 Fecha de Creación               │
│     20 ene 2026                     │
│                                     │
│  🕐 Próxima Factura                 │
│     20 feb 2026                     │
│     En 31 días 🟢                   │
└─────────────────────────────────────┘
```

---

## Casos de Uso

### Caso 1: Tenant Recién Creado
```
Fecha de Creación: 20 ene 2026
Próxima Factura: 20 feb 2026
Estado: En 31 días (verde)
```

### Caso 2: Factura Próxima a Vencer
```
Fecha de Creación: 15 ene 2026
Próxima Factura: 15 feb 2026
Estado: Vence en 5 días (naranja)
```

### Caso 3: Factura Vencida
```
Fecha de Creación: 10 dic 2025
Próxima Factura: 10 ene 2026
Estado: Vencida hace 10 días (rojo)
```

---

## Lógica de Cálculo

### Próxima Fecha de Factura

```typescript
function getNextInvoiceDate(createdAt: Date): Date {
  const created = new Date(createdAt);
  const nextInvoice = new Date(created);
  
  // Agregar un mes
  nextInvoice.setMonth(nextInvoice.getMonth() + 1);
  
  return nextInvoice;
}
```

**Ejemplos:**
- Creado: 20 ene 2026 → Próxima: 20 feb 2026
- Creado: 31 ene 2026 → Próxima: 28/29 feb 2026 (ajuste automático)
- Creado: 15 mar 2026 → Próxima: 15 abr 2026

### Días Restantes

```typescript
function getDaysUntilNextInvoice(createdAt: Date): number {
  const nextInvoice = getNextInvoiceDate(createdAt);
  const today = new Date();
  
  const diffTime = nextInvoice.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
```

---

## Beneficios

### Para el Super Admin:
- ✅ Visibilidad inmediata de cuándo vence cada tenant
- ✅ Identificación rápida de facturas vencidas
- ✅ Mejor planificación de cobros
- ✅ Seguimiento del ciclo de facturación

### Para el Sistema:
- ✅ Base para suspensión automática
- ✅ Base para generación automática de facturas
- ✅ Base para envío de recordatorios
- ✅ Información centralizada

---

## Integración con Bold

Esta información es fundamental para:

1. **Generación Automática de Facturas**
   - El sistema puede generar facturas cuando llegue la fecha
   - Crear link de pago en Bold automáticamente

2. **Suspensión Automática**
   - Si la factura está vencida y no pagada
   - Suspender el tenant automáticamente

3. **Recordatorios de Pago**
   - Enviar email 7 días antes
   - Enviar email 3 días antes
   - Enviar email el día del vencimiento

---

## Próximos Pasos

Con esta información visible, ahora podemos implementar:

1. **Cron Job de Generación de Facturas**
   - Ejecutar diariamente
   - Buscar tenants cuya próxima factura sea hoy
   - Generar factura automáticamente
   - Crear link de pago en Bold
   - Enviar email con link de pago

2. **Cron Job de Suspensión**
   - Ejecutar diariamente
   - Buscar tenants con facturas vencidas
   - Suspender automáticamente
   - Enviar email de notificación

3. **Cron Job de Recordatorios**
   - Ejecutar diariamente
   - Enviar recordatorios según días restantes

---

## Testing

### Verificar Cálculos

```typescript
// Tenant creado el 20 de enero
const tenant = {
  createdAt: '2026-01-20T00:00:00Z'
};

// Hoy es 25 de enero
const nextInvoice = getNextInvoiceDate(tenant.createdAt);
// Resultado: 20 de febrero de 2026

const daysRemaining = getDaysUntilNextInvoice(tenant.createdAt);
// Resultado: 26 días

const color = getInvoiceDaysColor(daysRemaining);
// Resultado: 'text-green-600'

const text = getInvoiceDaysText(daysRemaining);
// Resultado: 'En 26 días'
```

---

## Notas Técnicas

### Manejo de Meses con Diferentes Días

JavaScript maneja automáticamente los casos especiales:

```typescript
// Creado el 31 de enero
new Date('2026-01-31').setMonth(1); // Mes 1 = febrero
// Resultado: 28 de febrero (o 29 en año bisiesto)

// Creado el 30 de enero
new Date('2026-01-30').setMonth(1);
// Resultado: 28 de febrero (o 29 en año bisiesto)
```

### Zona Horaria

Las fechas se manejan en la zona horaria local del navegador.

---

## Resumen

✅ **Implementado**: Fechas de creación y próxima factura visibles en TenantCard  
✅ **Cálculo automático**: Próxima factura = Fecha creación + 1 mes  
✅ **Indicadores visuales**: Colores según días restantes  
✅ **Textos descriptivos**: Mensajes claros y en español  
✅ **Utilidades reutilizables**: Funciones en `billing-dates.ts`  

**Próximo paso**: Implementar cron jobs para automatización de facturación y suspensión.
