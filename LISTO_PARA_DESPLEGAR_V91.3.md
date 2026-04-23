# ✅ LISTO PARA DESPLEGAR - v91.3

**Fecha:** 2026-04-21  
**Versión:** 91.3  
**Estado:** 🟢 LISTO

---

## 🎯 Cambio Principal

**Captura del método de pago real de Bold** para enviarlo correctamente a DynamiaERP.

Antes: Siempre se enviaba "Efectivo" (EF)  
Ahora: Se envía el método real (PSE → PS, Tarjeta → TC, etc.)

---

## 📦 Archivos Listos

✅ `backend-v91.3-dist.tar.gz` - Tarball compilado  
✅ `scripts/deploy-v91.3-payment-method.ps1` - Script de despliegue  
✅ `CAMBIOS_V91.3_FORMA_PAGO.md` - Documentación completa

---

## 🚀 Comando de Despliegue

```powershell
.\scripts\deploy-v91.3-payment-method.ps1
```

---

## 🔍 Qué Hace el Despliegue

1. Sube `backend-v91.3-dist.tar.gz` al servidor
2. Crea backup del dist actual: `dist.backup.v91.2_TIMESTAMP`
3. Extrae el nuevo dist
4. Reinicia PM2 (proceso `datagree`)
5. Muestra logs para verificación

---

## ✅ Verificación Post-Despliegue

### 1. Ver logs en tiempo real
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'
```

### 2. Probar con script de prueba
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node resend-aquiub-invoice.js
```

Deberías ver en los logs:
```
💳 DATOS DEL PAGO:
   Método Bold: PSE - Banco Ejemplo
   Método: PSE
   ...
   ✅ Forma de pago: PSE (PSE - Banco Ejemplo)
```

---

## 🗺️ Mapeo Implementado

| Método Bold | Código DynamiaERP |
|-------------|-------------------|
| PSE | PS |
| Card/Tarjeta | TC |
| Transfer | TR |
| Otros | EF (default) |

---

## 📝 Cambios Técnicos

### `backend/src/invoices/invoices.service.ts`

1. **Captura del payment:**
```typescript
const payment = invoice.payments && invoice.payments.length > 0 
  ? invoice.payments[invoice.payments.length - 1] 
  : null;
```

2. **Mapeo del método:**
```typescript
let formaPagoCode = 'EF';
if (payment) {
  const boldMethod = (payment.boldPaymentMethod || payment.paymentMethod || '').toLowerCase();
  if (boldMethod.includes('pse')) formaPagoCode = 'PS';
  else if (boldMethod.includes('card')) formaPagoCode = 'TC';
  else if (boldMethod.includes('transfer')) formaPagoCode = 'TR';
}
```

3. **Uso en DynamiaERP:**
```typescript
formasPagos: [{ codigo: formaPagoCode, valor: invoice.total }]
```

---

## 🎉 Resultado Esperado

Cuando un cliente pague:
- Con **PSE** → DynamiaERP recibe forma de pago **PS**
- Con **Tarjeta** → DynamiaERP recibe forma de pago **TC**
- Con **Transferencia** → DynamiaERP recibe forma de pago **TR**

---

## ⚠️ Notas

- El cambio es **retrocompatible**: Si no se encuentra payment, usa EF por defecto
- Los logs muestran claramente qué método se detectó
- El script `resend-aquiub-invoice.js` también fue actualizado

---

## 📊 Historial de Versiones

- **v91.1:** Formato de factura `001-YYYYMM-XXXX`
- **v91.2:** Lógica condicional NIT vs Cédula, ubicación Medellín, observaciones fijas
- **v91.3:** Captura de método de pago real de Bold ← ACTUAL

---

**¿Listo para desplegar?**

```powershell
.\scripts\deploy-v91.3-payment-method.ps1
```

🚀 ¡Vamos!
