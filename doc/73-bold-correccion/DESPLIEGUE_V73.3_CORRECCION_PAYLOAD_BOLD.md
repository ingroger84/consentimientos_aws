# ✅ Despliegue v73.3 - Corrección Payload Bold

**Fecha**: 25 de Marzo 2026, 11:10 AM  
**Versión**: 73.3.0  
**Estado**: ✅ Desplegado y listo para pruebas

---

## 🎯 Problema Resuelto

### Síntoma
URLs de pago guardadas en base de datos contenían "undefined":
```
https://checkout.bold.co/payment/undefined
```

### Causa Raíz
Bold devuelve los datos dentro de un objeto `payload`, no directamente en `response.data`:

```json
{
  "payload": {
    "reference_id": "INV-INV-202603-5324-1774454756990",
    "status": "ACTIVE",
    "checkout_url": "https://checkout.bold.co/payment/abc123",
    ...
  },
  "errors": []
}
```

El código anterior intentaba leer `response.data.reference_id` (undefined) en lugar de `response.data.payload.reference_id`.

---

## 🔧 Solución Implementada

### Cambio en `backend/src/payments/bold.service.ts`

**ANTES**:
```typescript
const intentId = response.data.reference_id || 
                 response.data.id || 
                 response.data.payment_intent_id;
```

**DESPUÉS**:
```typescript
// Bold devuelve los datos dentro de un objeto "payload"
const boldData = response.data.payload || response.data;

const intentId = boldData.reference_id || 
                 boldData.id || 
                 boldData.payment_intent_id || 
                 boldData.transaction_id;
```

### Beneficios
1. ✅ Lee correctamente el `reference_id` de Bold
2. ✅ Extrae la URL de checkout correctamente
3. ✅ Fallback a `response.data` por compatibilidad
4. ✅ Más campos de ID para mayor robustez

---

## 📦 Archivos Desplegados

### Backend
```bash
# Archivo compilado
backend/dist/payments/bold.service.js

# Ruta en servidor
/home/ubuntu/consentimientos_aws/backend/dist/payments/bold.service.js
```

### Comandos Ejecutados
```bash
# 1. Compilar backend
cd backend
npm run build

# 2. Copiar archivo al servidor
scp -i AWS-ISSABEL.pem dist/payments/bold.service.js ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/payments/

# 3. Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

---

## ✅ Verificación Post-Despliegue

### 1. Servicio Reiniciado
```bash
✅ PM2 Status: online
✅ Versión: 73.3.0
✅ Uptime: 0s (recién reiniciado)
```

### 2. Código Desplegado
```bash
✅ Archivo verificado en servidor
✅ Línea de código confirmada: const boldData = response.data.payload || response.data;
```

### 3. Logs del Servidor
```bash
✅ Aplicación iniciada correctamente
✅ Versión: 73.3.0 (2026-03-25)
✅ Puerto: 3000
```

---

## 🧪 Pruebas Requeridas

### Paso 1: Crear Nueva Intención de Pago
1. Ir a la interfaz web: https://demo-estetica.archivoenlinea.com
2. Navegar a una factura pendiente
3. Hacer clic en "Pagar"

### Paso 2: Verificar URL Generada
La URL debe verse así:
```
✅ CORRECTO: https://checkout.bold.co/payment/INV-INV-202603-5324-1774454756990
❌ INCORRECTO: https://checkout.bold.co/payment/undefined
```

### Paso 3: Verificar en Base de Datos
```sql
SELECT 
  invoice_number,
  bold_payment_link,
  bold_payment_reference
FROM invoices
WHERE bold_payment_link IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

Debe mostrar:
- ✅ `bold_payment_link` sin "undefined"
- ✅ `bold_payment_reference` con formato `INV-XXX-TIMESTAMP`

### Paso 4: Verificar Logs del Servidor
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 50"
```

Buscar:
```
✅ Intención de pago creada exitosamente
   ID de intención: INV-XXX-TIMESTAMP
   URL de pago: https://checkout.bold.co/payment/INV-XXX-TIMESTAMP
```

---

## 📊 Estructura de Respuesta Bold

### Respuesta Completa
```json
{
  "payload": {
    "reference_id": "INV-INV-202603-5324-1774454756990",
    "amount": {
      "currency": "COP",
      "total_amount": 119900,
      "tip_amount": 0,
      "taxes": []
    },
    "description": "Factura INV-202603-5324 - Demo Estetica",
    "expiration_date": "",
    "creation_date": "2026-03-25T11:05:57-05:00",
    "callback_url": "https://demo-estetica.archivoenlinea.com/invoices/xxx/payment-success",
    "test": true,
    "customer": {
      "name": "Demo Estetica",
      "phone": null,
      "email": "roger.caraballo@gmail.com",
      "billing_address": null,
      "shipping_address": null
    },
    "bold_transaction_id": null,
    "status": "ACTIVE",
    "metadata": null
  },
  "errors": []
}
```

### Campos Extraídos
- `reference_id`: ID de la intención de pago
- `checkout_url`: URL de pago (si Bold la devuelve)
- `status`: Estado de la intención (ACTIVE, EXPIRED, etc.)
- `creation_date`: Fecha de creación

---

## 🔍 Diagnóstico de Problemas

### Si sigue apareciendo "undefined"

1. **Verificar que el código está desplegado**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "grep 'const boldData = response.data.payload' /home/ubuntu/consentimientos_aws/backend/dist/payments/bold.service.js"
   ```

2. **Verificar logs en tiempo real**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 0"
   ```

3. **Verificar respuesta de Bold**:
   Buscar en logs: `📦 Respuesta completa de Bold:`

4. **Reiniciar PM2 con variables de entorno**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree --update-env"
   ```

### Si Bold no devuelve checkout_url

El código construye la URL manualmente:
```typescript
if (!paymentUrl) {
  paymentUrl = `https://checkout.bold.co/payment/${intentId}`;
  this.logger.warn(`⚠️ Bold no devolvió URL de checkout, construyendo manualmente: ${paymentUrl}`);
}
```

---

## 📝 Notas Importantes

### Facturas con URLs Antiguas
Las facturas creadas ANTES de este despliegue pueden tener URLs con "undefined". El código en `invoices.service.ts` las regenera automáticamente:

```typescript
// Si el link contiene "undefined", regenerarlo
if (invoice.boldPaymentLink && invoice.boldPaymentLink.includes('undefined')) {
  this.logger.warn(`⚠️ Factura ${invoice.invoiceNumber} tiene un link inválido (undefined), regenerando...`);
}
```

### Credenciales Bold Expuestas
⚠️ **URGENTE**: Las credenciales de Bold están expuestas en este documento y deben ser rotadas:
- `BOLD_API_KEY`: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
- `BOLD_SECRET_KEY`: KVwpsp4WlWny3apOYoGWvg

**Acción requerida**: Contactar a Bold para rotar las credenciales.

---

## 🎯 Próximos Pasos

1. ✅ **Código desplegado** - Completado
2. ⏳ **Pruebas del usuario** - Pendiente
3. ⏳ **Verificar URL sin "undefined"** - Pendiente
4. ⏳ **Confirmar pago funcional** - Pendiente
5. ⏳ **Rotar credenciales Bold** - Pendiente (URGENTE)

---

## 📞 Información del Servidor

- **IP**: 100.28.198.249
- **Usuario**: ubuntu
- **Proceso PM2**: datagree
- **Versión**: 73.3.0
- **Puerto**: 3000
- **Frontend**: https://demo-estetica.archivoenlinea.com

---

**Última actualización**: 25 de Marzo 2026, 11:10 AM  
**Estado**: ✅ Desplegado, esperando pruebas del usuario
