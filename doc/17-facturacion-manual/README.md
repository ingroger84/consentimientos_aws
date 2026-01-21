# Facturación Manual - Sistema de Creación de Facturas

## Descripción General

Sistema completo para que el Super Administrador pueda crear facturas manuales con soporte para:
- Selección de tenant
- Configuración de impuestos o exención
- Múltiples líneas de factura
- Cálculo automático de totales
- Validaciones completas

## Componentes Implementados

### 1. CreateManualInvoicePage
**Ubicación:** `frontend/src/pages/CreateManualInvoicePage.tsx`

Página de selección de tenant para crear factura manual.

**Características:**
- Lista todos los tenants activos
- Búsqueda por nombre o slug
- Tarjetas visuales con información del tenant
- Navegación desde el Dashboard de Facturación

**Ruta:** `/billing/create-invoice`

### 2. CreateInvoiceModal
**Ubicación:** `frontend/src/components/invoices/CreateInvoiceModal.tsx`

Modal completo para crear facturas con todas las opciones.

**Características:**
- Checkbox para marcar factura como exenta de impuestos
- Campo obligatorio de razón cuando es exenta
- Dropdown para seleccionar impuesto cuando NO es exenta
- Múltiples líneas de factura (items)
- Cálculo automático de subtotal, impuesto y total
- Campos de fecha (vencimiento, período inicio, período fin)
- Campo de notas opcional
- Validaciones completas

### 3. BillingDashboardPage (Actualizado)
**Ubicación:** `frontend/src/pages/BillingDashboardPage.tsx`

Se agregó botón "Crear Factura Manual" que navega a la página de selección de tenant.

## Flujo de Uso

### Paso 1: Acceder a Crear Factura Manual
1. Ir al Dashboard de Facturación (`/billing`)
2. Hacer clic en el botón verde "Crear Factura Manual"
3. Se abre la página de selección de tenant

### Paso 2: Seleccionar Tenant
1. Ver lista de todos los tenants activos
2. Usar búsqueda para filtrar por nombre o slug
3. Hacer clic en la tarjeta del tenant deseado
4. Se abre el modal de creación de factura

### Paso 3: Configurar Impuestos
**Opción A: Factura con Impuestos (por defecto)**
- Dejar el checkbox "Factura Exenta de Impuestos" desmarcado
- Seleccionar el impuesto a aplicar del dropdown
- El sistema calculará automáticamente el impuesto según la configuración

**Opción B: Factura Exenta de Impuestos**
- Marcar el checkbox "Factura Exenta de Impuestos"
- Aparece campo obligatorio "Razón de Exención"
- Ingresar motivo legal (ej: "Organización sin fines de lucro - Resolución DIAN 12345")
- El impuesto será $0

### Paso 4: Configurar Fechas
- **Fecha de Vencimiento:** Por defecto 30 días desde hoy
- **Período Inicio:** Por defecto fecha actual
- **Período Fin:** Por defecto 1 mes desde hoy
- Todas las fechas son editables

### Paso 5: Agregar Items
1. Cada item tiene:
   - Descripción (obligatorio)
   - Cantidad (mínimo 1)
   - Precio unitario
   - Total (calculado automáticamente)

2. Botones:
   - "Agregar Item" para añadir más líneas
   - Icono de basura para eliminar items (mínimo 1 item)

### Paso 6: Revisar Totales
El sistema muestra en tiempo real:
- **Subtotal:** Suma de todos los items
- **Impuesto:** Calculado según configuración o "EXENTA"
- **Total:** Subtotal + Impuesto (o solo Subtotal si es exenta)

### Paso 7: Agregar Notas (Opcional)
Campo de texto libre para notas adicionales sobre la factura.

### Paso 8: Crear Factura
1. Hacer clic en "Crear Factura"
2. El sistema valida:
   - Si es exenta, debe tener razón
   - Si no es exenta, debe tener impuesto seleccionado
   - Todos los items deben tener descripción
3. Si todo es válido, crea la factura y:
   - Muestra mensaje de éxito
   - Cierra el modal
   - Regresa al Dashboard de Facturación
   - Envía email automático al tenant

## Validaciones Implementadas

### Frontend
1. **Factura Exenta:**
   - Si está marcada como exenta, el campo "Razón de Exención" es obligatorio
   - No se puede enviar sin razón

2. **Factura con Impuestos:**
   - Si NO está marcada como exenta, debe seleccionar un impuesto
   - No se puede enviar sin impuesto seleccionado

3. **Items:**
   - Todos los items deben tener descripción
   - Cantidad mínima: 1
   - Debe haber al menos 1 item

4. **Fechas:**
   - Todos los campos de fecha son obligatorios

### Backend
1. **Validación de Tenant:**
   - Verifica que el tenant existe
   - Solo permite crear facturas para tenants válidos

2. **Validación de Exención:**
   - Si `taxExempt = true`, requiere `taxExemptReason`
   - Si no hay razón, retorna error 400

3. **Cálculo de Impuestos:**
   - Si NO es exenta y no hay `taxConfigId`, usa el impuesto por defecto
   - Si es exenta, establece `tax = 0` y `taxConfigId = null`
   - Calcula correctamente según tipo de aplicación (incluido/adicional)

4. **Registro de Actividad:**
   - Crea entrada en historial de facturación
   - Envía email automático al tenant

## Estructura de Datos

### CreateInvoiceDto
```typescript
{
  tenantId: string;           // ID del tenant (obligatorio)
  taxConfigId?: string;       // ID del impuesto (opcional si es exenta)
  taxExempt?: boolean;        // true si es exenta de impuestos
  taxExemptReason?: string;   // Razón de exención (obligatorio si taxExempt=true)
  amount: number;             // Subtotal
  tax?: number;               // Impuesto calculado
  total: number;              // Total final
  dueDate: string;            // Fecha de vencimiento (ISO)
  periodStart: string;        // Inicio del período (ISO)
  periodEnd: string;          // Fin del período (ISO)
  items: InvoiceItem[];       // Array de items
  notes?: string;             // Notas opcionales
}
```

### InvoiceItem
```typescript
{
  description: string;   // Descripción del item
  quantity: number;      // Cantidad
  unitPrice: number;     // Precio unitario
  total: number;         // Total del item (quantity * unitPrice)
}
```

## Ejemplos de Uso

### Ejemplo 1: Factura con IVA 19%
```
Tenant: Clínica ABC
Impuesto: IVA 19% (Adicional)
Items:
  - Plan Premium - Mensual: 1 x $100,000 = $100,000
Subtotal: $100,000
IVA 19%: $19,000
Total: $119,000
```

### Ejemplo 2: Factura Exenta
```
Tenant: Fundación XYZ
Exenta: Sí
Razón: Organización sin fines de lucro - Resolución DIAN 12345
Items:
  - Plan Básico - Mensual: 1 x $50,000 = $50,000
Subtotal: $50,000
Impuesto: EXENTA
Total: $50,000
```

### Ejemplo 3: Factura con Múltiples Items
```
Tenant: Hospital DEF
Impuesto: IVA 19% (Adicional)
Items:
  - Plan Premium - Mensual: 1 x $100,000 = $100,000
  - Usuarios adicionales: 5 x $10,000 = $50,000
  - Soporte técnico: 1 x $30,000 = $30,000
Subtotal: $180,000
IVA 19%: $34,200
Total: $214,200
```

## Integración con Sistema de Impuestos

El sistema se integra completamente con el módulo de configuración de impuestos:

1. **Carga Automática:** Al abrir el modal, carga todas las configuraciones de impuestos activas
2. **Impuesto por Defecto:** Preselecciona el impuesto marcado como por defecto
3. **Cálculo Dinámico:** Calcula en tiempo real según el tipo de aplicación:
   - **Adicional:** `total = subtotal + (subtotal * rate)`
   - **Incluido:** `tax = subtotal - (subtotal / (1 + rate))`

## Permisos y Seguridad

- **Acceso:** Solo Super Administradores
- **Endpoint:** `POST /invoices` requiere rol `SUPER_ADMIN`
- **Validación:** Backend valida todos los datos antes de crear
- **Auditoría:** Todas las facturas se registran en el historial de facturación

## Archivos Modificados/Creados

### Nuevos Archivos
1. `frontend/src/components/invoices/CreateInvoiceModal.tsx`
2. `frontend/src/pages/CreateManualInvoicePage.tsx`
3. `doc/17-facturacion-manual/README.md`
4. `doc/17-facturacion-manual/EJEMPLOS.md`

### Archivos Modificados
1. `frontend/src/pages/BillingDashboardPage.tsx` - Agregado botón y navegación
2. `frontend/src/App.tsx` - Agregada ruta `/billing/create-invoice`

### Archivos Backend (Ya existían)
1. `backend/src/invoices/invoices.service.ts` - Lógica de creación con tax-exempt
2. `backend/src/invoices/invoices.controller.ts` - Endpoint POST /invoices
3. `backend/src/invoices/dto/create-invoice.dto.ts` - DTO con campos tax-exempt

## Próximos Pasos Sugeridos

1. **Testing:** Probar en navegador el flujo completo
2. **Validación:** Verificar que las facturas se crean correctamente en la base de datos
3. **Email:** Confirmar que los emails se envían correctamente
4. **PDF:** Verificar que el PDF muestra correctamente las facturas exentas
5. **Historial:** Confirmar que se registra en el historial de facturación

## Notas Técnicas

- El modal usa estado local para manejar el formulario
- Los cálculos se realizan en tiempo real con `useEffect` implícito
- La navegación usa `useNavigate` de React Router
- Los servicios usan axios para las llamadas API
- El backend maneja automáticamente el envío de emails
