# Sistema de Reintentos de Pago Bold - v80.0.0

**Fecha:** 2026-03-29  
**Versión:** v80.0.0  
**Estado:** ✅ Implementado

---

## 📋 RESUMEN

Implementación completa del sistema de reintentos de pago para Bold, permitiendo a los usuarios reintentar pagos fallidos hasta 6 veces con regeneración automática de links de pago.

---

## 🎯 PROBLEMA RESUELTO

### Situación Anterior:
- Cuando un pago era rechazado por Bold, el link quedaba inválido
- El usuario no podía reintentar el pago con el mismo link
- Bold mostraba error: "Algo salió mal! No podemos cargar este link de pago"
- No había tracking de intentos fallidos
- No se enviaban notificaciones de pagos fallidos

### Solución Implementada:
- ✅ Regeneración automática de links de pago cuando fallan
- ✅ Límite de 6 intentos por factura
- ✅ Tracking completo de todos los intentos
- ✅ Email automático cuando un pago falla
- ✅ Botón "Reintentar Pago" en frontend
- ✅ Historial de intentos visible en dashboard
- ✅ Validación de límite de intentos

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Nuevas Columnas en `invoices`:
```sql
ALTER TABLE invoices 
ADD COLUMN bold_payment_link_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN payment_attempts_count INT DEFAULT 0,
ADD COLUMN last_payment_attempt_at TIMESTAMP;
```

**Valores de `bold_payment_link_status`:**
- `active`: Link activo y válido
- `failed`: Pago rechazado
- `expired`: Link expirado
- `succeeded`: Pago exitoso

### Nueva Tabla `payment_attempts`:
```sql
CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL,
  bold_payment_link VARCHAR(500),
  bold_payment_reference VARCHAR(255),
  bold_payment_link_id VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- 'pending', 'failed', 'succeeded', 'expired'
  failure_reason TEXT,
  bold_response JSONB,
  attempted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### Índices Creados:
- `idx_payment_attempts_invoice_id` - Búsqueda por factura
- `idx_payment_attempts_status` - Filtrado por estado
- `idx_payment_attempts_attempted_at` - Ordenamiento por fecha
- `idx_invoices_bold_link_status` - Filtrado de facturas por estado de link

---

## 🔧 CAMBIOS EN BACKEND

### Nuevos Archivos:

#### 1. `backend/src/payments/entities/payment-attempt.entity.ts`
Entidad TypeORM para registrar intentos de pago.

#### 2. `backend/src/payments/payment-attempts.service.ts`
Servicio para gestionar intentos de pago:
- `createAttempt()` - Registrar nuevo intento
- `markAsFailed()` - Marcar intento como fallido
- `markAsSucceeded()` - Marcar intento como exitoso
- `findByInvoice()` - Obtener intentos de una factura
- `canRetryPayment()` - Verificar si se puede reintentar (máximo 6)
- `getAttemptStats()` - Estadísticas de intentos

#### 3. `database/migrations/add-payment-attempts-system.sql`
Migración SQL completa con:
- Nuevas columnas en `invoices`
- Tabla `payment_attempts`
- Índices optimizados
- Función de limpieza de intentos antiguos

#### 4. `backend/apply-payment-attempts-migration.js`
Script para aplicar la migración en producción.

### Archivos Modificados:

#### 1. `backend/src/invoices/entities/invoice.entity.ts`
```typescript
// Nuevos campos agregados
@Column({ name: 'bold_payment_link_status', nullable: true, default: 'active' })
boldPaymentLinkStatus: string;

@Column({ name: 'payment_attempts_count', default: 0 })
paymentAttemptsCount: number;

@Column({ name: 'last_payment_attempt_at', type: 'timestamp', nullable: true })
lastPaymentAttemptAt: Date;
```

#### 2. `backend/src/invoices/invoices.service.ts`
**Métodos modificados:**
- `createPaymentLink()` - Ahora valida intentos y regenera links fallidos
  - Verifica límite de 6 intentos
  - Valida formato de link Bold
  - Regenera automáticamente si el link falló
  - Registra cada intento en `payment_attempts`

**Nuevos métodos:**
- `getPaymentAttempts()` - Obtener historial de intentos
- `regeneratePaymentLink()` - Regenerar link (endpoint público)
- `markPaymentLinkAsFailed()` - Marcar link como fallido
- `markPaymentLinkAsSucceeded()` - Marcar link como exitoso

#### 3. `backend/src/webhooks/webhooks.controller.ts`
**Modificado `handlePaymentFailed()`:**
```typescript
// Marcar el link de pago como fallido
await this.invoicesService.markPaymentLinkAsFailed(invoice.id);

// Buscar el intento de pago correspondiente
const attempt = await this.paymentAttemptsService.findByBoldReference(webhookData.reference);

if (attempt) {
  // Marcar el intento como fallido
  await this.paymentAttemptsService.markAsFailed(
    attempt.id,
    payload.transaction?.status || 'Payment rejected by Bold',
    payload,
  );
}

// Enviar email de notificación de pago fallido
await this.mailService.sendPaymentFailedEmail(invoice.tenant, invoice);
```

**Modificado `handlePaymentSucceeded()`:**
```typescript
// Marcar el link de pago como exitoso
await this.invoicesService.markPaymentLinkAsSucceeded(invoice.id);

// Marcar el intento como exitoso
const attempt = await this.paymentAttemptsService.findByBoldReference(webhookData.reference);
if (attempt) {
  await this.paymentAttemptsService.markAsSucceeded(attempt.id);
}
```

#### 4. `backend/src/mail/mail.service.ts`
**Nuevo método:**
- `sendPaymentFailedEmail()` - Email cuando un pago falla
  - Template HTML profesional
  - Información de la factura
  - Contador de intentos (X de 6)
  - Botón "Reintentar Pago Ahora"
  - Consejos para resolver el problema

#### 5. `backend/src/invoices/invoices.controller.ts`
**Nuevos endpoints públicos:**
```typescript
// Regenerar link de pago
@Public()
@Post('public/:id/regenerate-payment-link')
async regeneratePublicPaymentLink(@Param('id') id: string)

// Obtener historial de intentos
@Public()
@Get('public/:id/payment-attempts')
async getPublicPaymentAttempts(@Param('id') id: string)

// Info de factura con intentos
@Public()
@Get('public/:id/info')
async getPublicInvoiceInfo(@Param('id') id: string)
```

#### 6. Módulos actualizados:
- `backend/src/payments/payments.module.ts` - Exporta `PaymentAttemptsService`
- `backend/src/invoices/invoices.module.ts` - Importa `PaymentAttempt` entity
- `backend/src/webhooks/webhooks.module.ts` - Importa `MailModule`

---

## 🎨 CAMBIOS EN FRONTEND

### Archivos Modificados:

#### 1. `frontend/src/pages/PaymentSuccessPage.tsx`
**Nuevas funcionalidades:**
- Muestra contador de intentos cuando el pago falla
- Botón "Reintentar Pago con Otro Método"
- Llamada a endpoint de regeneración de link
- Redirección automática al nuevo checkout de Bold

**Código agregado:**
```typescript
const handleRetryPayment = async () => {
  const response = await axios.post(
    `${apiUrl}/api/invoices/public/${invoiceId}/regenerate-payment-link`
  );
  
  const { paymentLink, attemptNumber, maxAttempts } = response.data;
  
  // Redirigir al nuevo checkout de Bold
  window.location.href = paymentLink;
};
```

**UI mejorada:**
- Contador visual de intentos (X de 6)
- Mensaje de intentos restantes
- Botón prominente para reintentar
- Loading state durante regeneración

#### 2. `frontend/src/pages/PublicSuspendedPage.tsx`
**Nuevas funcionalidades:**
- Muestra intentos de pago por factura
- Deshabilita botón cuando se alcanza el límite (6 intentos)
- Mensaje "Límite Alcanzado - Contacta a soporte"
- Texto del botón cambia a "Reintentar Pago" si ya hay intentos

**UI mejorada:**
```typescript
{invoice.paymentAttemptsCount !== undefined && invoice.paymentAttemptsCount > 0 && (
  <p>
    <span className="font-medium">Intentos de pago:</span>{' '}
    <span className="text-orange-600 font-semibold">
      {invoice.paymentAttemptsCount} de {invoice.maxAttempts || 6}
    </span>
    {invoice.paymentAttemptsCount >= (invoice.maxAttempts || 6) && (
      <span className="ml-2 text-red-600 font-medium">
        (Límite alcanzado - Contacta a soporte)
      </span>
    )}
  </p>
)}
```

---

## 📧 EMAIL DE PAGO FALLIDO

### Template HTML Profesional:
- ✅ Header rojo con ícono de advertencia
- ✅ Información de la factura en tabla destacada
- ✅ Contador de intentos (X de 6)
- ✅ Lista de acciones recomendadas:
  - Verificar fondos suficientes
  - Validar datos de tarjeta
  - Intentar con otro método de pago
  - Contactar al banco
- ✅ Botón CTA "Reintentar Pago Ahora"
- ✅ Advertencia sobre límite de intentos
- ✅ Footer con información de contacto

### Asunto del Email:
```
Pago Rechazado - Factura INV-202603-1234
```

---

## 🔄 FLUJO COMPLETO

### 1. Usuario Intenta Pagar:
```
Usuario → Bold Checkout → Pago Rechazado
```

### 2. Webhook de Bold:
```
Bold → POST /webhooks/bold
  event: "payment.failed"
  → handlePaymentFailed()
    → markPaymentLinkAsFailed()
    → markAsFailed(attemptId)
    → sendPaymentFailedEmail()
```

### 3. Usuario Recibe Email:
```
Email → "Pago Rechazado"
  → Botón "Reintentar Pago Ahora"
  → Redirige a página suspendida
```

### 4. Usuario Reintenta:
```
Página Suspendida → Botón "Reintentar Pago"
  → POST /invoices/public/:id/regenerate-payment-link
    → canRetryPayment() (verifica límite de 6)
    → createPaymentLink() (genera nuevo link)
    → createAttempt() (registra intento)
  → Redirige a nuevo Bold Checkout
```

### 5. Pago Exitoso:
```
Bold → POST /webhooks/bold
  event: "payment.succeeded"
  → handlePaymentSucceeded()
    → markPaymentLinkAsSucceeded()
    → markAsSucceeded(attemptId)
    → Activar tenant
    → Enviar email de confirmación
```

---

## 📊 LÍMITES Y VALIDACIONES

### Límite de Intentos:
- **Máximo:** 6 intentos por factura
- **Validación:** En `canRetryPayment()` antes de generar nuevo link
- **Mensaje:** "Se alcanzó el límite máximo de 6 intentos de pago"
- **UI:** Botón deshabilitado con mensaje "Límite Alcanzado"

### Validación de Links:
```typescript
const isValidBoldLink = (link: string): boolean => {
  if (!link) return false;
  if (link.includes('undefined')) return false;
  
  // Formato: https://checkout.bold.co/payment/LNK_XXXXXX
  const boldLinkPattern = /^https:\/\/checkout\.bold\.co\/payment\/LNK_[A-Z0-9]+$/i;
  return boldLinkPattern.test(link);
};
```

### Estados de Link:
- `active` - Link válido y activo
- `failed` - Pago rechazado, regenerar
- `expired` - Link expirado, regenerar
- `succeeded` - Pago completado

---

## 🧪 TESTING

### Casos de Prueba:

#### 1. Pago Rechazado Primera Vez:
```
✅ Link marcado como 'failed'
✅ Intento registrado en payment_attempts
✅ Email enviado al tenant
✅ Contador: 1 de 6
✅ Botón "Reintentar Pago" visible
```

#### 2. Reintentar Pago (Intento 2-5):
```
✅ Nuevo link generado
✅ Link anterior marcado como 'expired'
✅ Nuevo intento registrado
✅ Contador actualizado
✅ Redirección a Bold Checkout
```

#### 3. Intento 6 (Último):
```
✅ Nuevo link generado
✅ Contador: 6 de 6
✅ Mensaje de último intento
```

#### 4. Intento 7 (Límite Alcanzado):
```
✅ Error: "Se alcanzó el límite máximo de 6 intentos"
✅ Botón deshabilitado
✅ Mensaje: "Límite Alcanzado - Contacta a soporte"
```

#### 5. Pago Exitoso Después de Fallos:
```
✅ Link marcado como 'succeeded'
✅ Intento marcado como 'succeeded'
✅ Factura marcada como 'paid'
✅ Tenant activado
✅ Email de confirmación enviado
```

---

## 📈 MÉTRICAS Y MONITOREO

### Queries Útiles:

#### Facturas con Intentos Fallidos:
```sql
SELECT 
  i.invoice_number,
  i.payment_attempts_count,
  i.bold_payment_link_status,
  t.name as tenant_name,
  i.last_payment_attempt_at
FROM invoices i
JOIN tenants t ON i.tenant_id = t.id
WHERE i.payment_attempts_count > 0
  AND i.status IN ('pending', 'overdue')
ORDER BY i.payment_attempts_count DESC;
```

#### Historial de Intentos por Factura:
```sql
SELECT 
  pa.attempted_at,
  pa.status,
  pa.failure_reason,
  pa.bold_payment_link_id
FROM payment_attempts pa
WHERE pa.invoice_id = 'INVOICE_ID'
ORDER BY pa.attempted_at DESC;
```

#### Estadísticas Generales:
```sql
SELECT 
  COUNT(*) as total_invoices,
  COUNT(CASE WHEN payment_attempts_count > 0 THEN 1 END) as with_attempts,
  COUNT(CASE WHEN payment_attempts_count >= 6 THEN 1 END) as limit_reached,
  AVG(payment_attempts_count) as avg_attempts
FROM invoices
WHERE status IN ('pending', 'overdue');
```

---

## 🚀 DESPLIEGUE

### Script de Despliegue:
```powershell
.\scripts\deploy-v80-payment-retries.ps1
```

### Pasos Manuales:

1. **Backup de Base de Datos:**
```bash
node backend/backup-database.js
```

2. **Aplicar Migración:**
```bash
node backend/apply-payment-attempts-migration.js
```

3. **Reiniciar Backend:**
```bash
pm2 restart datagree
```

4. **Verificar Logs:**
```bash
pm2 logs datagree --lines 50
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Backend:
- [x] Migración aplicada correctamente
- [x] Tabla `payment_attempts` creada
- [x] Columnas agregadas a `invoices`
- [x] Índices creados
- [x] Servicios compilados sin errores
- [x] PM2 reiniciado exitosamente

### Frontend:
- [x] Botón "Reintentar Pago" visible en pago rechazado
- [x] Contador de intentos mostrado
- [x] Límite de 6 intentos validado
- [x] Redirección a Bold funciona

### Emails:
- [x] Email de pago fallido se envía
- [x] Template HTML renderiza correctamente
- [x] Botón "Reintentar Pago" funciona
- [x] Información de intentos correcta

### Webhooks:
- [x] `payment.failed` marca link como fallido
- [x] `payment.succeeded` marca link como exitoso
- [x] Intentos se registran correctamente

---

## 📝 NOTAS IMPORTANTES

### Bold API:
- ✅ Bold NO cobra por cantidad de links generados
- ✅ Bold NO tiene límite de links por factura
- ✅ Links son de un solo uso por diseño de seguridad
- ✅ Regeneración es la única opción para reintentos

### Límite de 6 Intentos:
- Configurado en `MAX_PAYMENT_ATTEMPTS = 6`
- Previene abuso del sistema
- Después de 6 intentos, contactar soporte
- Puede ajustarse en `payment-attempts.service.ts`

### Limpieza de Datos:
- Función `cleanup_old_payment_attempts()` disponible
- Elimina intentos de más de 90 días
- Ejecutar manualmente o programar con cron

---

## 🔗 ARCHIVOS RELACIONADOS

### Backend:
- `backend/src/payments/entities/payment-attempt.entity.ts`
- `backend/src/payments/payment-attempts.service.ts`
- `backend/src/invoices/invoices.service.ts`
- `backend/src/webhooks/webhooks.controller.ts`
- `backend/src/mail/mail.service.ts`
- `database/migrations/add-payment-attempts-system.sql`
- `backend/apply-payment-attempts-migration.js`

### Frontend:
- `frontend/src/pages/PaymentSuccessPage.tsx`
- `frontend/src/pages/PublicSuspendedPage.tsx`

### Scripts:
- `scripts/deploy-v80-payment-retries.ps1`

### Documentación:
- `doc/80-sistema-reintentos-pago/IMPLEMENTACION_REINTENTOS_PAGO_BOLD.md`

---

## 👥 EQUIPO

**Desarrollador:** Kiro AI  
**Revisado por:** Usuario  
**Fecha:** 2026-03-29  
**Versión:** v80.0.0

---

## ✅ ESTADO FINAL

**Sistema de Reintentos de Pago Bold completamente implementado y listo para producción.**

🎉 **¡Implementación Exitosa!**
