# Diagnóstico: Problema con Webhook de Bold y Activación Automática

**Fecha**: 28 de marzo de 2026  
**Versión**: 76.1.0  
**Estado**: 🔴 PROBLEMA IDENTIFICADO - REQUIERE ACCIÓN

## Resumen del Problema

El usuario realizó un pago exitoso en Bold para reactivar su cuenta suspendida, pero:
- ❌ El tenant NO se activó automáticamente
- ❌ NO redirigió al link del tenant después del pago
- ❌ Bold muestra "Este link ya se pagó" (LNK_J0AAOFJABF)
- ❌ NO hay registro del pago en nuestra base de datos

## Información del Pago

### Factura
- **Número**: INV-202603-6331
- **ID**: a546a166-ca78-4071-a2ff-c9f90de234fc
- **Monto**: $89,900 COP
- **Estado**: overdue (NO PAGADA en nuestra BD)
- **Link de pago**: https://checkout.bold.co/payment/LNK_J0AAOFJABF
- **Referencia Bold**: INV-INV-202603-6331-1774665590743
- **Creada**: 26/03/2026 23:56:50 UTC

### Tenant
- **ID**: a5f187aa-c1d4-4421-b1d7-a264d0cd8098
- **Nombre**: Demo Medico
- **Estado**: suspended (NO SE REACTIVÓ)
- **Slug**: demo-medico

### Pago en Bold
- **Link ID**: LNK_J0AAOFJABF
- **Fecha del pago**: 28/03/2026 - 02:56:08 UTC
- **Estado en Bold**: PAGADO (Bold confirma que ya se pagó)
- **Estado en nuestra BD**: NO REGISTRADO

## Diagnóstico Técnico

### 1. Verificación de Logs del Servidor

```bash
# Logs revisados: últimas 1000 líneas
# Resultado: NO se encontró ningún webhook de Bold
```

**Logs encontrados**:
- ✅ Creación del link de pago: 27/03/2026 21:39:50 (9:39 PM)
- ✅ Link generado correctamente: LNK_J0AAOFJABF
- ❌ NO hay logs de webhook recibido
- ❌ NO hay logs de procesamiento de pago
- ❌ NO hay logs de activación de tenant

### 2. Verificación de Base de Datos

**Tabla `invoices`**:
```sql
SELECT * FROM invoices WHERE "invoiceNumber" = 'INV-202603-6331';
```
- Estado: `overdue`
- `paidAt`: NULL
- `boldPaymentLink`: https://checkout.bold.co/payment/LNK_J0AAOFJABF
- `boldPaymentReference`: INV-INV-202603-6331-1774665590743

**Tabla `payments`**:
```sql
SELECT * FROM payments WHERE "invoiceId" = 'a546a166-ca78-4071-a2ff-c9f90de234fc';
```
- **Resultado**: 0 registros encontrados
- **Conclusión**: El pago NO fue registrado en nuestra base de datos

**Tabla `billing_history`**:
- Última entrada: `payment_link_created` (28/03/2026 02:39:52)
- NO hay entrada de `payment_received`
- NO hay entrada de `tenant_activated`

### 3. Análisis del Flujo

```
1. Usuario hace clic en "Pagar Ahora" ✅
   ↓
2. Sistema genera link de Bold ✅
   ↓
3. Usuario es redirigido a Bold Checkout ✅
   ↓
4. Usuario completa el pago en Bold ✅
   ↓
5. Bold procesa el pago exitosamente ✅
   ↓
6. Bold DEBERÍA enviar webhook a nuestro servidor ❌ FALLÓ AQUÍ
   ↓
7. Nuestro servidor DEBERÍA recibir el webhook ❌ NO LLEGÓ
   ↓
8. Sistema DEBERÍA procesar el pago ❌ NO SE EJECUTÓ
   ↓
9. Factura DEBERÍA marcarse como pagada ❌ NO SE MARCÓ
   ↓
10. Tenant DEBERÍA reactivarse ❌ NO SE REACTIVÓ
```

## Causa Raíz Identificada

**El webhook de Bold NO está llegando a nuestro servidor.**

### Posibles Causas:

1. **Webhook URL no configurada en Bold** ⚠️ MÁS PROBABLE
   - La URL del webhook debe configurarse en el dashboard de Bold
   - URL esperada: `https://archivoenlinea.com/api/webhooks/bold`
   - Verificar en: Bold Dashboard → Configuración → Webhooks

2. **Webhook URL incorrecta**
   - Verificar que la URL esté correctamente escrita
   - Verificar que apunte al dominio correcto

3. **Bold no envía webhooks en modo sandbox/testing**
   - Algunos proveedores de pago no envían webhooks en modo de prueba
   - Verificar si estamos usando credenciales de producción o sandbox

4. **Firma del webhook inválida**
   - Variable `BOLD_WEBHOOK_SECRET` incorrecta en `.env`
   - Bold rechaza el webhook si la firma no coincide

5. **Firewall bloqueando peticiones de Bold**
   - Nginx o firewall del servidor bloqueando las IPs de Bold
   - Verificar logs de Nginx: `/var/log/nginx/error.log`

6. **Endpoint del webhook no está expuesto correctamente**
   - Verificar que la ruta `/api/webhooks/bold` esté accesible públicamente
   - Probar con: `curl -X POST https://archivoenlinea.com/api/webhooks/bold`

## Soluciones Propuestas

### Solución Inmediata: Procesamiento Manual del Pago

Dado que Bold confirma que el pago fue exitoso, podemos procesar el pago manualmente:

#### Opción 1: Usar el endpoint de procesamiento manual (RECOMENDADO)

El sistema ya tiene un endpoint para procesar pagos manualmente cuando el webhook no llega:

```typescript
// POST /api/payments/process-bold-payment-manually
{
  "invoiceId": "a546a166-ca78-4071-a2ff-c9f90de234fc",
  "boldOrderId": "LNK_J0AAOFJABF",
  "boldTxStatus": "approved"
}
```

Este endpoint:
1. Verifica que el pago esté aprobado en Bold
2. Crea el registro de pago en la BD
3. Marca la factura como pagada
4. Reactiva el tenant automáticamente
5. Envía email de confirmación

#### Opción 2: Script SQL directo (ALTERNATIVA)

Si el endpoint no funciona, podemos ejecutar SQL directamente:

```sql
-- 1. Crear registro de pago
INSERT INTO payments (
  id,
  amount,
  "paymentMethod",
  "paymentDate",
  "invoiceId",
  "tenantId",
  notes,
  "boldTransactionId",
  "boldPaymentMethod",
  status,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  89900.00,
  'OTHER',
  '2026-03-28 02:56:08',
  'a546a166-ca78-4071-a2ff-c9f90de234fc',
  'a5f187aa-c1d4-4421-b1d7-a264d0cd8098',
  'Pago procesado manualmente - Bold Order ID: LNK_J0AAOFJABF - Webhook no recibido',
  'LNK_J0AAOFJABF',
  'Bold Checkout',
  'completed',
  NOW(),
  NOW()
);

-- 2. Marcar factura como pagada
UPDATE invoices 
SET 
  status = 'paid',
  "paidAt" = '2026-03-28 02:56:08',
  "updatedAt" = NOW()
WHERE id = 'a546a166-ca78-4071-a2ff-c9f90de234fc';

-- 3. Reactivar tenant
UPDATE tenants
SET 
  status = 'active',
  "suspendedAt" = NULL,
  "planExpiresAt" = (NOW() + INTERVAL '1 month'),
  "planStartedAt" = NOW(),
  "updatedAt" = NOW()
WHERE id = 'a5f187aa-c1d4-4421-b1d7-a264d0cd8098';

-- 4. Registrar en historial
INSERT INTO billing_history (
  id,
  "tenantId",
  action,
  description,
  metadata,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'a5f187aa-c1d4-4421-b1d7-a264d0cd8098',
  'payment_received',
  'Pago recibido por $ 89.900 - Factura INV-202603-6331 (procesado manualmente)',
  '{"invoiceId": "a546a166-ca78-4071-a2ff-c9f90de234fc", "invoiceNumber": "INV-202603-6331", "amount": 89900, "processedManually": true, "reason": "Webhook no recibido"}',
  NOW(),
  NOW()
);
```

### Solución Permanente: Configurar Webhooks de Bold

Para evitar que esto vuelva a suceder:

#### 1. Verificar Configuración de Bold

Acceder al dashboard de Bold y configurar:

**URL del Webhook**: `https://archivoenlinea.com/api/webhooks/bold`

**Eventos a suscribir**:
- `payment.succeeded` (pago exitoso)
- `payment.failed` (pago fallido)
- `payment.pending` (pago pendiente)

**Método HTTP**: POST

**Headers**:
- `Content-Type: application/json`
- `x-bold-signature: [firma generada por Bold]`

#### 2. Verificar Variables de Entorno

En el servidor, verificar que estén configuradas:

```bash
BOLD_API_KEY=tu_api_key
BOLD_SECRET_KEY=tu_secret_key
BOLD_MERCHANT_ID=tu_merchant_id
BOLD_WEBHOOK_SECRET=tu_webhook_secret  # ⚠️ IMPORTANTE
BOLD_API_URL=https://integrations.api.bold.co
```

#### 3. Probar el Webhook Manualmente

Desde el dashboard de Bold, enviar un webhook de prueba para verificar que llega correctamente.

#### 4. Monitorear Logs

Después de configurar, monitorear los logs para confirmar que los webhooks llegan:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree --lines 100 | grep -i webhook'
```

### Solución Alternativa: Polling de Estado

Si Bold no soporta webhooks confiables, implementar un sistema de polling:

1. Cuando se genera un link de pago, guardar el `payment_link_id`
2. Cada 30 segundos, consultar el estado del link en Bold
3. Si el estado cambió a "paid", procesar el pago automáticamente
4. Detener el polling después de 1 hora o cuando se confirme el pago

## Código del Webhook Handler

El código actual del webhook está en:
- **Archivo**: `backend/src/webhooks/webhooks.controller.ts`
- **Endpoint**: `POST /api/webhooks/bold`
- **Método**: `handleBoldWebhook()`

El handler ya está implementado correctamente y debería funcionar si el webhook llega.

## Próximos Pasos

### Inmediato (HOY):
1. ✅ Diagnosticar el problema (COMPLETADO)
2. ⏳ Procesar el pago manualmente para reactivar al usuario
3. ⏳ Notificar al usuario que su cuenta ha sido reactivada

### Corto Plazo (ESTA SEMANA):
1. ⏳ Verificar configuración de webhooks en Bold
2. ⏳ Configurar correctamente la URL del webhook
3. ⏳ Probar con un pago de prueba
4. ⏳ Documentar el proceso de configuración

### Mediano Plazo (PRÓXIMAS 2 SEMANAS):
1. ⏳ Implementar sistema de polling como respaldo
2. ⏳ Agregar alertas cuando un pago no se procesa en 5 minutos
3. ⏳ Crear dashboard de monitoreo de pagos pendientes
4. ⏳ Implementar reconciliación automática con Bold

## Impacto en el Usuario

### Actual:
- ❌ Usuario pagó pero su cuenta sigue suspendida
- ❌ Usuario no puede acceder al sistema
- ❌ Experiencia de usuario muy negativa
- ❌ Pérdida de confianza en el sistema

### Después de la Solución:
- ✅ Usuario podrá acceder inmediatamente
- ✅ Cuenta reactivada correctamente
- ✅ Plan extendido por 1 mes
- ✅ Historial de facturación actualizado

## Lecciones Aprendidas

1. **Webhooks no son 100% confiables**: Siempre tener un plan B
2. **Monitoreo es crítico**: Necesitamos alertas cuando los pagos no se procesan
3. **Reconciliación manual**: Debe ser fácil y rápida para el Super Admin
4. **Comunicación con el usuario**: Informar proactivamente sobre el estado del pago

## Recomendaciones

### Para el Equipo de Desarrollo:
1. Implementar sistema de polling como respaldo
2. Agregar dashboard de pagos pendientes de confirmación
3. Crear alertas automáticas para pagos no procesados
4. Mejorar logging de webhooks (guardar payload completo)

### Para el Super Admin:
1. Verificar configuración de webhooks en Bold semanalmente
2. Revisar pagos pendientes diariamente
3. Tener acceso rápido al script de procesamiento manual
4. Mantener comunicación con Bold sobre problemas de webhooks

### Para el Usuario:
1. Enviar email de confirmación inmediata después del pago
2. Si no se activa en 5 minutos, mostrar mensaje de contacto
3. Proporcionar número de transacción para seguimiento
4. Ofrecer soporte prioritario para problemas de pago

## Contacto con Bold

Si el problema persiste, contactar a Bold con:
- **Merchant ID**: [tu_merchant_id]
- **Transaction ID**: LNK_J0AAOFJABF
- **Fecha del pago**: 28/03/2026 - 02:56:08 UTC
- **Problema**: Webhook no recibido después de pago exitoso

---

**Documentado por**: Kiro AI  
**Fecha**: 28 de marzo de 2026  
**Prioridad**: 🔴 ALTA - Afecta a usuarios que pagan
