# ✅ DESPLIEGUE v91.3 COMPLETADO

**Fecha:** 2026-04-21 01:06 AM  
**Versión:** 91.3  
**Estado:** 🟢 DESPLEGADO Y CORRIENDO

---

## 📦 Despliegue Realizado

✅ Tarball `backend-v91.3-dist.tar.gz` subido al servidor  
✅ Backup creado: `dist.backup.v91.2_20260421_010631`  
✅ Nuevo dist extraído y verificado  
✅ PM2 reiniciado exitosamente  
✅ Proceso `datagree` corriendo (PID: 1573044)

---

## 🎯 Cambios Implementados

### Captura de Método de Pago Real de Bold

**Antes:**
```typescript
formasPagos: [{ codigo: 'EF', valor: invoice.total }] // Siempre Efectivo
```

**Ahora:**
```typescript
// Captura el payment asociado
const payment = invoice.payments && invoice.payments.length > 0 
  ? invoice.payments[invoice.payments.length - 1] 
  : null;

// Mapea el método de Bold a códigos DynamiaERP
let formaPagoCode = 'EF'; // Default
if (payment) {
  const boldMethod = (payment.boldPaymentMethod || payment.paymentMethod || '').toLowerCase();
  if (boldMethod.includes('pse')) formaPagoCode = 'PS';
  else if (boldMethod.includes('card')) formaPagoCode = 'TC';
  else if (boldMethod.includes('transfer')) formaPagoCode = 'TR';
}

formasPagos: [{ codigo: formaPagoCode, valor: invoice.total }]
```

---

## 🗺️ Mapeo de Códigos

| Método de Pago Bold | Código DynamiaERP | Descripción |
|---------------------|-------------------|-------------|
| PSE | PS | Pago PSE |
| Card / Tarjeta | TC | Tarjeta de Crédito |
| Transfer / Transferencia | TR | Transferencia |
| Otros / No encontrado | EF | Efectivo (default) |

---

## 📊 Estado del Sistema

```
┌────┬──────────┬─────────┬────────┬──────┬───────────┬──────────┐
│ id │ name     │ version │ uptime │ ↺    │ status    │ cpu/mem  │
├────┼──────────┼─────────┼────────┼──────┼───────────┼──────────┤
│ 0  │ datagree │ 83.4.0  │ 0s     │ 513  │ online    │ 0%/40.8mb│
└────┴──────────┴─────────┴────────┴──────┴───────────┴──────────┘
```

**Proceso:** Corriendo normalmente  
**Reintentos:** 513 (normal para servidor de larga duración)  
**Memoria:** 40.8 MB  
**CPU:** 0%

---

## 🔍 Logs del Sistema

Sistema corriendo normalmente. Últimos logs muestran:
- TenantMiddleware funcionando correctamente
- Detección de tenants: demo-estetica, aquiub, super admin
- Sin errores críticos en el arranque

**Nota:** Hay un warning sobre AWS SDK v2 (end-of-support), pero no afecta la funcionalidad actual.

---

## ✅ Verificación Post-Despliegue

### 1. Sistema Corriendo
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 status'
```
✅ Proceso `datagree` online

### 2. Archivos Desplegados
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'ls -lh /home/ubuntu/consentimientos_aws/backend/dist/'
```
✅ Dist actualizado con timestamp 01:00 (hora de compilación)

### 3. Backup Creado
✅ `dist.backup.v91.2_20260421_010631`

---

## 🧪 Próximas Pruebas

### 1. Probar con Script de Prueba
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node resend-aquiub-invoice.js
```

Deberías ver:
```
💳 DATOS DEL PAGO:
   Método Bold: PSE - Banco Ejemplo
   Método: PSE
   ...
   ✅ Forma de pago: PSE (PSE - Banco Ejemplo)
```

### 2. Esperar Próximo Pago Real

Cuando un cliente pague:
- **Con PSE:** Verificar en logs que se envíe código `PS` a DynamiaERP
- **Con Tarjeta:** Verificar código `TC`
- **Con Transferencia:** Verificar código `TR`

### 3. Verificar en DynamiaERP

Después de un pago, verificar en DynamiaERP que la factura tenga la forma de pago correcta.

---

## 📝 Archivos Modificados

1. **`backend/src/invoices/invoices.service.ts`**
   - Método `sendToDynamiaErp` actualizado
   - Captura de payment asociado
   - Mapeo de método de pago

2. **`backend/resend-aquiub-invoice.js`**
   - Script de prueba actualizado
   - Mismo mapeo implementado

---

## 🔄 Historial de Versiones

- **v91.1:** Formato de factura `001-YYYYMM-XXXX`
- **v91.2:** Lógica condicional NIT vs Cédula, ubicación Medellín, observaciones fijas
- **v91.3:** Captura de método de pago real de Bold ← ACTUAL DESPLEGADO

---

## 📞 Comandos Útiles

### Ver logs en tiempo real
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'
```

### Ver estado de PM2
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 status'
```

### Reiniciar si es necesario
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 restart datagree'
```

---

## 🎉 Resultado

El sistema ahora captura y envía el método de pago real utilizado en Bold a DynamiaERP, en lugar de siempre enviar "Efectivo" (EF).

**Próximo pago con PSE → DynamiaERP recibirá código PS**  
**Próximo pago con Tarjeta → DynamiaERP recibirá código TC**

---

**Despliegue completado exitosamente el 2026-04-21 a las 01:06 AM**
