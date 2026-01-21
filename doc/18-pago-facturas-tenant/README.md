# Sistema de Pago de Facturas para Tenants

## Descripción General

Se implementó un sistema que permite a los Tenant Admins pagar sus propias facturas directamente desde la interfaz, diferenciándolo del sistema de "Pago Manual" que es exclusivo para Super Administradores.

## Cambios Implementados

### 1. Nuevo Componente: PayNowModal

**Ubicación:** `frontend/src/components/invoices/PayNowModal.tsx`

**Funcionalidad:**
- Modal específico para que Tenant Admins paguen sus facturas
- Selección de método de pago (PSE, Tarjeta, Transferencia)
- Campo obligatorio de referencia de pago
- Notas adicionales opcionales
- Información clara sobre el proceso de verificación

**Características:**
- ✅ Interfaz amigable con iconos visuales
- ✅ Validación de campos obligatorios
- ✅ Mensajes de éxito/error claros
- ✅ Información importante sobre tiempos de verificación
- ✅ Diseño responsive

### 2. Modificación: TenantInvoicesPage

**Ubicación:** `frontend/src/pages/TenantInvoicesPage.tsx`

**Cambios:**
- ❌ Removido: `RegisterPaymentModal` (exclusivo Super Admin)
- ❌ Removido: Verificación de permisos `hasPermission('pay_invoices')`
- ✅ Agregado: `PayNowModal` (para Tenant Admins)
- ✅ Cambiado: Botón "Pago Manual" → "Pagar Ahora"
- ✅ Cambiado: Color naranja → azul (más apropiado para acción de pago)

## Diferencias entre Sistemas

### Pago Manual (Super Admin)
**Ubicación:** `RegisterPaymentModal`
**Uso:** Super Administradores
**Propósito:** Registrar pagos recibidos por otros medios
**Características:**
- Puede registrar pagos de cualquier tenant
- Marca la factura como pagada inmediatamente
- Usado para pagos offline verificados

### Pagar Ahora (Tenant Admin)
**Ubicación:** `PayNowModal`
**Uso:** Tenant Administradores
**Propósito:** Realizar pago de sus propias facturas
**Características:**
- Solo puede pagar facturas de su propio tenant
- Registra el pago para verificación
- Requiere aprobación del Super Admin
- Métodos de pago: PSE, Tarjeta, Transferencia

## Flujo de Uso

### Para Tenant Admin

1. **Acceder a Mis Facturas**
   - Navegar a `/my-invoices`
   - Ver lista de facturas del tenant

2. **Seleccionar Factura Pendiente**
   - Solo facturas con estado "Pendiente" muestran el botón
   - Hacer clic en "Pagar Ahora" (botón azul)

3. **Completar Información de Pago**
   - Seleccionar método de pago (PSE, Tarjeta, Transferencia)
   - Ingresar referencia de pago (obligatorio)
   - Agregar notas adicionales (opcional)

4. **Confirmar Pago**
   - Hacer clic en "Confirmar Pago"
   - El sistema registra el pago
   - Muestra mensaje de éxito

5. **Esperar Verificación**
   - El pago queda registrado en el sistema
   - Super Admin verifica el pago
   - Marca la factura como pagada
   - Tenant recibe confirmación por email

### Para Super Admin

1. **Ver Pagos Pendientes**
   - Acceder al dashboard de facturación
   - Ver pagos registrados por tenants

2. **Verificar Pago**
   - Revisar referencia de pago
   - Confirmar con banco/pasarela
   - Marcar factura como pagada

3. **Notificar Tenant**
   - Sistema envía email automático
   - Tenant puede ver factura como "Pagada"

## Interfaz del Modal

### Secciones del Modal

#### 1. Header
```
Pagar Factura
Factura: INV-202601-1240
```

#### 2. Información de la Factura
```
┌─────────────────────────────────────┐
│ Tenant: Clínica Demo                │
│ Número de Factura: INV-202601-1240  │
│ Fecha de Vencimiento: 19/2/2026     │
│ Monto Total: $119,900               │
└─────────────────────────────────────┘
```

#### 3. Método de Pago
```
┌─────┐  ┌─────┐  ┌─────┐
│ PSE │  │ 💳  │  │  $  │
└─────┘  └─────┘  └─────┘
```

#### 4. Referencia de Pago
```
[Número de transacción, aprobación, etc.]
```

#### 5. Notas Adicionales
```
[Información adicional sobre el pago...]
```

#### 6. Información Importante
```
⚠️ Información Importante:
• El pago será verificado por nuestro equipo
• Recibirás una confirmación por correo electrónico
• La activación puede tardar hasta 24 horas hábiles
```

#### 7. Botones
```
[Cancelar]  [Confirmar Pago]
```

## Métodos de Pago Soportados

### 1. PSE (Pagos Seguros en Línea)
**Icono:** 🏦 Building2
**Descripción:** Pago directo desde cuenta bancaria
**Uso:** Más común en Colombia

### 2. Tarjeta de Crédito/Débito
**Icono:** 💳 CreditCard
**Descripción:** Pago con tarjeta
**Uso:** Tarjetas Visa, Mastercard, etc.

### 3. Transferencia Bancaria
**Icono:** 💵 DollarSign
**Descripción:** Transferencia manual
**Uso:** Transferencia entre cuentas

## Validaciones

### Frontend
1. ✅ Referencia de pago obligatoria
2. ✅ Método de pago debe estar seleccionado
3. ✅ Monto debe ser mayor a 0
4. ✅ Factura debe estar en estado "Pendiente"

### Backend
1. ✅ Tenant debe existir
2. ✅ Factura debe existir
3. ✅ Factura debe pertenecer al tenant
4. ✅ Factura debe estar pendiente
5. ✅ Monto debe coincidir con el total de la factura

## Estructura de Datos

### CreatePaymentDto
```typescript
{
  tenantId: string;           // ID del tenant
  invoiceId: string;          // ID de la factura
  amount: number;             // Monto del pago
  paymentMethod: 'pse' | 'card' | 'transfer';
  paymentReference: string;   // Referencia de pago
  paymentDate: string;        // Fecha del pago (ISO)
  notes?: string;             // Notas adicionales
}
```

### Payment (Respuesta)
```typescript
{
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'pse' | 'card' | 'transfer';
  paymentReference: string;
  paymentDate: string;
  notes: string;
  createdAt: string;
}
```

## Casos de Uso

### Caso 1: Pago con PSE

**Escenario:**
1. Tenant Admin ve factura pendiente de $119,900
2. Hace clic en "Pagar Ahora"
3. Selecciona método "PSE"
4. Ingresa referencia: "PSE-123456789"
5. Agrega nota: "Pago desde Bancolombia"
6. Confirma pago

**Resultado:**
```json
{
  "tenantId": "uuid-tenant",
  "invoiceId": "uuid-invoice",
  "amount": 119900,
  "paymentMethod": "pse",
  "paymentReference": "PSE-123456789",
  "notes": "Pago desde Bancolombia",
  "status": "pending"
}
```

### Caso 2: Pago con Tarjeta

**Escenario:**
1. Tenant Admin selecciona "Tarjeta"
2. Ingresa referencia: "VISA-****1234-APR789"
3. Confirma pago

**Resultado:**
- Pago registrado con método "card"
- Super Admin verifica con procesador de pagos
- Marca factura como pagada

### Caso 3: Transferencia Bancaria

**Escenario:**
1. Tenant Admin realiza transferencia bancaria
2. Selecciona "Transferencia"
3. Ingresa referencia: "TRF-20260120-001"
4. Agrega nota: "Transferencia desde cuenta empresarial"
5. Confirma pago

**Resultado:**
- Pago registrado
- Super Admin verifica en extracto bancario
- Marca factura como pagada

## Integración con Pasarelas de Pago

### Futuras Mejoras

El sistema actual registra el pago para verificación manual. Para integrar con pasarelas de pago reales:

#### 1. Integración con PSE
```typescript
// Ejemplo con PSE Colombia
const initiatePSEPayment = async (invoice: Invoice) => {
  const response = await pseService.createTransaction({
    amount: invoice.total,
    reference: invoice.invoiceNumber,
    returnUrl: `${window.location.origin}/payment/callback`,
  });
  
  // Redirigir a PSE
  window.location.href = response.paymentUrl;
};
```

#### 2. Integración con Stripe
```typescript
// Ejemplo con Stripe
const initiateCardPayment = async (invoice: Invoice) => {
  const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
  
  const response = await api.post('/payments/create-checkout-session', {
    invoiceId: invoice.id,
    amount: invoice.total,
  });
  
  await stripe.redirectToCheckout({
    sessionId: response.data.sessionId,
  });
};
```

#### 3. Webhook para Confirmación Automática
```typescript
// Backend - Webhook de pasarela
@Post('webhooks/payment-confirmation')
async handlePaymentWebhook(@Body() data: any) {
  const payment = await this.paymentsService.findByReference(data.reference);
  
  if (data.status === 'approved') {
    await this.invoicesService.markAsPaid(payment.invoiceId);
    await this.mailService.sendPaymentConfirmation(payment);
  }
}
```

## Permisos y Seguridad

### Tenant Admin
- ✅ Puede ver sus propias facturas
- ✅ Puede pagar sus propias facturas
- ❌ NO puede ver facturas de otros tenants
- ❌ NO puede marcar facturas como pagadas directamente

### Super Admin
- ✅ Puede ver todas las facturas
- ✅ Puede registrar pagos manuales
- ✅ Puede marcar facturas como pagadas
- ✅ Puede verificar pagos de tenants

## Notificaciones

### Email al Registrar Pago
```
Asunto: Pago Registrado - Factura INV-202601-1240

Hola [Tenant Name],

Hemos recibido tu pago para la factura INV-202601-1240 por un monto de $119,900.

Método de pago: PSE
Referencia: PSE-123456789

Tu pago está siendo verificado por nuestro equipo. Recibirás una confirmación 
en las próximas 24 horas hábiles.

Gracias por tu pago.
```

### Email al Confirmar Pago
```
Asunto: Pago Confirmado - Factura INV-202601-1240

Hola [Tenant Name],

Tu pago ha sido confirmado exitosamente.

Factura: INV-202601-1240
Monto: $119,900
Estado: PAGADA

Tu cuenta está activa y puedes continuar usando nuestros servicios.

Gracias por tu confianza.
```

## Archivos Creados/Modificados

### Nuevos Archivos
1. ✅ `frontend/src/components/invoices/PayNowModal.tsx` (320 líneas)
2. ✅ `doc/18-pago-facturas-tenant/README.md`

### Archivos Modificados
1. ✅ `frontend/src/pages/TenantInvoicesPage.tsx`
   - Removido `RegisterPaymentModal`
   - Agregado `PayNowModal`
   - Cambiado botón "Pago Manual" → "Pagar Ahora"
   - Removida verificación de permisos innecesaria

## Pruebas Recomendadas

### Prueba 1: Pagar Factura con PSE
1. Iniciar sesión como Tenant Admin
2. Ir a "Mis Facturas"
3. Hacer clic en "Pagar Ahora" en factura pendiente
4. Seleccionar "PSE"
5. Ingresar referencia: "PSE-TEST-123"
6. Confirmar pago
7. Verificar mensaje de éxito
8. Verificar que el pago se registró en la base de datos

### Prueba 2: Validación de Referencia
1. Abrir modal de pago
2. Dejar referencia vacía
3. Intentar confirmar
4. Verificar mensaje de error

### Prueba 3: Verificación como Super Admin
1. Tenant registra pago
2. Super Admin ve el pago en dashboard
3. Super Admin marca factura como pagada
4. Tenant ve factura como "Pagada"

### Prueba 4: Botón Solo en Pendientes
1. Ver factura pagada
2. Verificar que NO muestra botón "Pagar Ahora"
3. Ver factura anulada
4. Verificar que NO muestra botón "Pagar Ahora"

## Mejores Prácticas Implementadas

### 1. Separación de Responsabilidades
- ✅ Tenant Admin: Paga sus facturas
- ✅ Super Admin: Verifica y aprueba pagos

### 2. Validación en Múltiples Capas
- ✅ Frontend: Validación de UI
- ✅ Backend: Validación de negocio
- ✅ Base de datos: Constraints

### 3. Experiencia de Usuario
- ✅ Interfaz clara y simple
- ✅ Iconos visuales para métodos de pago
- ✅ Mensajes informativos
- ✅ Feedback inmediato

### 4. Seguridad
- ✅ Solo puede pagar sus propias facturas
- ✅ Validación de pertenencia de factura
- ✅ Registro de auditoría

### 5. Escalabilidad
- ✅ Preparado para integración con pasarelas
- ✅ Estructura de datos flexible
- ✅ Fácil agregar nuevos métodos de pago

## Conclusión

El sistema ahora diferencia claramente entre:
- **"Pagar Ahora"** (Tenant Admin) - Botón azul para realizar pagos
- **"Pago Manual"** (Super Admin) - Botón naranja para registrar pagos verificados

Esto mejora la experiencia del usuario y sigue las mejores prácticas de separación de responsabilidades y permisos.
