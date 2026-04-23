# Cambios v91.3 - Captura de Método de Pago Real

**Fecha:** 2026-04-21  
**Versión:** 91.3  
**Estado:** ✅ Listo para desplegar

---

## 📋 Resumen

Implementación de captura del método de pago real utilizado en Bold para enviarlo correctamente a DynamiaERP, en lugar de enviar siempre "Efectivo" (EF).

---

## 🎯 Problema Identificado

El sistema enviaba siempre `formasPagos: [{ codigo: 'EF', valor: total }]` (Efectivo) a DynamiaERP, sin importar el método de pago real utilizado por el cliente en Bold (PSE, Tarjeta, etc.).

---

## ✅ Solución Implementada

### 1. Captura del Payment Asociado

En `backend/src/invoices/invoices.service.ts`, método `sendToDynamiaErp`:

```typescript
// Obtener el payment asociado a la factura para capturar el método de pago real
const payment = invoice.payments && invoice.payments.length > 0 
  ? invoice.payments[invoice.payments.length - 1] 
  : null;
```

### 2. Mapeo de Métodos de Pago

```typescript
// Mapear método de pago de Bold a códigos DynamiaERP
let formaPagoCode = 'EF'; // Efectivo por defecto

if (payment) {
  const boldMethod = (payment.boldPaymentMethod || payment.paymentMethod || '').toLowerCase();
  
  if (boldMethod.includes('pse')) {
    formaPagoCode = 'PS'; // PSE
  } else if (boldMethod.includes('card') || boldMethod.includes('tarjeta') || 
             boldMethod.includes('credit') || boldMethod.includes('debit')) {
    formaPagoCode = 'TC'; // Tarjeta de crédito
  } else if (boldMethod.includes('transfer') || boldMethod.includes('transferencia')) {
    formaPagoCode = 'TR'; // Transferencia
  }
}
```

### 3. Uso del Código Mapeado

```typescript
formasPagos: [{
  codigo: formaPagoCode, // Ahora usa el código real
  valor: invoice.total,
}],
```

---

## 🗺️ Mapeo de Códigos

| Método de Pago Bold | Código DynamiaERP | Descripción |
|---------------------|-------------------|-------------|
| PSE | PS | Pago PSE |
| Card / Tarjeta / Credit / Debit | TC | Tarjeta de Crédito |
| Transfer / Transferencia | TR | Transferencia |
| Otros / No encontrado | EF | Efectivo (default) |

---

## 📁 Archivos Modificados

### 1. `backend/src/invoices/invoices.service.ts`
- Línea ~790: Captura del payment asociado
- Línea ~850: Mapeo de método de pago
- Línea ~920: Uso del código mapeado en formasPagos

### 2. `backend/resend-aquiub-invoice.js`
- Línea ~175: Actualizado mapeo de forma de pago
- Línea ~135: Mejorado logging de datos del pago

---

## 🔍 Logging Implementado

El sistema ahora registra en logs:

```
📤 Enviando factura INV-202604-XXXX a DynamiaERP...
   Método de pago: PSE (PSE - Banco Ejemplo)
```

O en caso de no encontrar payment:

```
   ⚠️ No se encontró payment asociado, usando Efectivo por defecto
```

---

## 🚀 Despliegue

### Compilar Backend
```bash
cd backend
npm run build
```

### Crear Tarball
```bash
tar -czf backend-v91.3-dist.tar.gz -C backend dist
```

### Desplegar
```powershell
.\scripts\deploy-v91.3-payment-method.ps1
```

---

## ✅ Verificación Post-Despliegue

1. **Verificar logs de PM2:**
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'
   ```

2. **Probar con script de prueba:**
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
   cd /home/ubuntu/consentimientos_aws/backend
   node resend-aquiub-invoice.js
   ```

3. **Verificar en próximo pago:**
   - Esperar a que un cliente pague con PSE o Tarjeta
   - Verificar en logs que se capture el método correcto
   - Verificar en DynamiaERP que la forma de pago sea correcta

---

## 📊 Datos de la Entidad Payment

La entidad `Payment` tiene los siguientes campos relevantes:

```typescript
@Column({
  type: 'enum',
  enum: PaymentMethod,
  default: PaymentMethod.TRANSFER,
})
paymentMethod: PaymentMethod; // Enum interno

@Column({ nullable: true })
boldPaymentMethod: string; // Método real de Bold (ej: "PSE - Banco de Bogotá")

@Column({ type: 'jsonb', nullable: true })
boldPaymentData: any; // Datos completos del webhook
```

El sistema prioriza `boldPaymentMethod` sobre `paymentMethod` para mayor precisión.

---

## 🔄 Flujo Completo

1. **Cliente paga en Bold** → Webhook recibido
2. **Webhook procesado** → Payment creado con `boldPaymentMethod`
3. **Factura marcada como pagada** → Trigger `sendToDynamiaErp`
4. **Captura del payment** → Obtiene método de pago real
5. **Mapeo a código DynamiaERP** → PS, TC, TR o EF
6. **Envío a DynamiaERP** → Factura con forma de pago correcta

---

## 📝 Notas Importantes

- **Ubicación:** DynamiaERP usa la ubicación del cliente si existe en su sistema, si no existe usa Medellín por defecto (ya configurado en v91.2)
- **Observaciones:** Texto fijo ya configurado en v91.2: "Servicios excluidos del impuesto a las ventas IVA (articulo 10 de la Ley de financiamiento 1943 de 2018)"
- **Formato de factura:** Ya configurado en v91.1: `001-202604-XXXX`
- **Datos del cliente:** Lógica condicional NIT vs Cédula ya configurada en v91.2

---

## 🎉 Resultado Esperado

Ahora cuando un cliente pague con:
- **PSE** → DynamiaERP recibirá `formasPagos: [{ codigo: 'PS', valor: 150000 }]`
- **Tarjeta** → DynamiaERP recibirá `formasPagos: [{ codigo: 'TC', valor: 150000 }]`
- **Transferencia** → DynamiaERP recibirá `formasPagos: [{ codigo: 'TR', valor: 150000 }]`

En lugar de siempre enviar `EF` (Efectivo).

---

**Versión:** 91.3  
**Autor:** Sistema de Consentimientos  
**Fecha:** 2026-04-21
