# Bold Configurado - Estado Actual

**Fecha**: 20 de Enero de 2026, 7:15 PM  
**Estado**: ✅ 80% COMPLETADO

---

## ✅ Lo que está Listo

### 1. Credenciales Configuradas
```env
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://sandbox-api.bold.co/v1
```

### 2. Base de Datos Migrada
✅ Columnas agregadas a `invoices`:
- `bold_payment_link`
- `bold_transaction_id`
- `bold_payment_reference`

✅ Columnas agregadas a `payments`:
- `bold_transaction_id`
- `bold_payment_method`
- `bold_payment_data`

### 3. Servicios Implementados
✅ `BoldService` - Completo
✅ `WebhooksController` - Completo
✅ `WebhooksModule` - Agregado al AppModule

### 4. Entidades Actualizadas
✅ `Invoice` entity
✅ `Payment` entity
✅ `CreatePaymentDto`

---

## 🚧 Lo que Falta (20%)

### 1. Configurar ngrok y Webhook

**Pasos**:
1. Instalar ngrok: `choco install ngrok`
2. Configurar authtoken
3. Ejecutar: `.\start-dev-with-ngrok.ps1`
4. Copiar URL de ngrok
5. Configurar webhook en Bold con esa URL
6. Actualizar `BOLD_WEBHOOK_SECRET` y `BOLD_WEBHOOK_URL` en `.env`

### 2. Métodos Faltantes en InvoicesService

Necesito agregar estos métodos:

```typescript
// Buscar factura por referencia de Bold
async findByReference(reference: string): Promise<Invoice> {
  return await this.invoicesRepository.findOne({
    where: { boldPaymentReference: reference },
    relations: ['tenant'],
  });
}

// Crear link de pago en Bold
async createPaymentLink(invoiceId: string): Promise<string> {
  const invoice = await this.findOne(invoiceId);
  
  const paymentLink = await this.boldService.createPaymentLink({
    amount: invoice.total,
    currency: 'COP',
    description: `Factura ${invoice.invoiceNumber}`,
    reference: invoice.id,
    customerEmail: invoice.tenant.contactEmail,
    customerName: invoice.tenant.name,
    expirationDate: invoice.dueDate,
  });
  
  invoice.boldPaymentLink = paymentLink.url;
  invoice.boldPaymentReference = paymentLink.reference;
  await this.invoicesRepository.save(invoice);
  
  return paymentLink.url;
}

// Activar tenant después de pago
async activateTenantAfterPayment(tenantId: string): Promise<void> {
  const tenant = await this.tenantsRepository.findOne({
    where: { id: tenantId },
  });
  
  if (tenant.status === 'suspended') {
    tenant.status = 'active';
    await this.tenantsRepository.save(tenant);
    
    this.logger.log(`✅ Tenant ${tenant.name} activado automáticamente`);
  }
}

// Enviar confirmación de pago
async sendPaymentConfirmation(invoiceId: string): Promise<void> {
  const invoice = await this.findOne(invoiceId);
  const payment = invoice.payments[invoice.payments.length - 1];
  
  await this.mailService.sendPaymentConfirmationEmail(
    invoice.tenant,
    payment,
    invoice,
  );
}
```

### 3. Endpoint para Crear Link de Pago

Agregar en `InvoicesController`:

```typescript
@Post(':id/create-payment-link')
@UseGuards(JwtAuthGuard)
async createPaymentLink(@Param('id') id: string): Promise<{ url: string }> {
  const url = await this.invoicesService.createPaymentLink(id);
  return { url };
}
```

### 4. Cron Job para Suspensión Automática

Crear un servicio que se ejecute diariamente:

```typescript
@Cron('0 0 * * *') // Todos los días a las 00:00
async suspendOverdueTenants() {
  const overdueInvoices = await this.invoicesRepository.find({
    where: {
      status: 'pending',
      dueDate: LessThan(new Date()),
    },
    relations: ['tenant'],
  });
  
  for (const invoice of overdueInvoices) {
    if (invoice.tenant.status === 'active') {
      invoice.tenant.status = 'suspended';
      await this.tenantsRepository.save(invoice.tenant);
      
      // Enviar email de notificación
      await this.mailService.sendTenantSuspendedEmail(
        invoice.tenant,
        invoice,
      );
    }
  }
}
```

---

## 📋 Próximos Pasos Inmediatos

### Paso 1: Configurar ngrok (5 minutos)

```powershell
# Instalar ngrok
choco install ngrok

# Configurar authtoken (obtener de https://dashboard.ngrok.com)
ngrok config add-authtoken TU_AUTHTOKEN

# Iniciar con el script automático
.\start-dev-with-ngrok.ps1
```

### Paso 2: Configurar Webhook en Bold (3 minutos)

1. Ve al panel de Bold (sandbox)
2. Configuración > Webhooks > Crear Webhook
3. URL: `https://TU_URL_NGROK.ngrok-free.app/api/webhooks/bold`
4. Eventos: `payment.succeeded`, `payment.failed`, `payment.pending`
5. Copia el Webhook Secret
6. Actualiza en `backend/.env`:
   ```env
   BOLD_WEBHOOK_SECRET=el_secret_que_te_dio_bold
   BOLD_WEBHOOK_URL=https://TU_URL_NGROK.ngrok-free.app/api/webhooks/bold
   ```

### Paso 3: Completar Métodos Faltantes (15 minutos)

Necesito agregar los métodos en `InvoicesService` que mencioné arriba.

### Paso 4: Probar el Flujo Completo (10 minutos)

1. Crear una factura de prueba
2. Generar link de pago
3. Hacer un pago de prueba en Bold
4. Verificar que el webhook llega
5. Verificar que el pago se aplica
6. Verificar que el tenant se activa

---

## 🎯 Flujo Completo (Una vez terminado)

```
1. Sistema genera factura mensual
   ↓
2. Llama a Bold API para crear link de pago
   ↓
3. Guarda link en invoice.boldPaymentLink
   ↓
4. Envía email al tenant con link de pago
   ↓
5. Cliente hace clic y paga en Bold
   ↓
6. Bold envía webhook a nuestro servidor
   ↓
7. Webhook validado con HMAC-SHA256
   ↓
8. Busca factura por referencia
   ↓
9. Crea registro de pago
   ↓
10. Marca factura como pagada
   ↓
11. Activa tenant automáticamente ✅
   ↓
12. Envía email de confirmación
```

---

## 📊 Progreso

```
Implementación:     ████████████████░░░░ 80%
Configuración:      ████████░░░░░░░░░░░░ 40%
Testing:            ░░░░░░░░░░░░░░░░░░░░  0%
Documentación:      ████████████████████ 100%
```

---

## 🔧 Comandos Útiles

### Iniciar Desarrollo con ngrok
```powershell
.\start-dev-with-ngrok.ps1
```

### Ver Dashboard de ngrok
```
http://localhost:4040
```

### Aplicar Migración (si es necesario)
```powershell
cd backend
node apply-bold-migration.js
```

### Reiniciar Backend
```powershell
cd backend
npm run start:dev
```

---

## 📚 Documentación Disponible

1. **`PASOS_CONFIGURAR_BOLD_LOCALHOST.md`** - Guía paso a paso
2. **`doc/22-integracion-bold/CONFIGURACION_LOCALHOST.md`** - Configuración detallada
3. **`doc/22-integracion-bold/CONFIGURACION_BOLD.md`** - Guía de Bold
4. **`doc/22-integracion-bold/README.md`** - Documentación general
5. **`INTEGRACION_BOLD_20260120.md`** - Resumen ejecutivo

---

## ⚠️ Notas Importantes

### URL de ngrok Cambia
Si reinicias ngrok, la URL cambia. Debes:
1. Actualizar `BOLD_WEBHOOK_URL` en `.env`
2. Actualizar webhook en Bold
3. Reiniciar backend

**Solución**: Mantén ngrok corriendo mientras desarrollas.

### Ambiente de Pruebas
Estamos usando el ambiente de **SANDBOX** de Bold:
- API URL: `https://sandbox-api.bold.co/v1`
- Tarjetas de prueba disponibles
- No se cobran transacciones reales

### Pasar a Producción
Cuando estés listo:
1. Obtener credenciales de producción de Bold
2. Actualizar variables de entorno
3. Desplegar backend a servidor con dominio público
4. Actualizar webhook en Bold (producción)
5. Ya no necesitas ngrok

---

## ✅ Checklist de Configuración

- [x] Credenciales de Bold configuradas
- [x] Migración de BD aplicada
- [x] Servicios implementados
- [x] Módulos configurados
- [ ] ngrok instalado y configurado
- [ ] Webhook configurado en Bold
- [ ] Métodos faltantes implementados
- [ ] Pruebas realizadas

---

## 🚀 ¿Qué Sigue?

1. **Tú**: Instalar y configurar ngrok
2. **Tú**: Configurar webhook en Bold
3. **Yo**: Completar métodos faltantes
4. **Ambos**: Probar el flujo completo

---

**Estado**: Listo para configurar ngrok y probar. ¿Necesitas ayuda con algún paso?
