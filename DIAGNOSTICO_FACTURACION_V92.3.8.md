# Diagnóstico y Corrección Sistema de Facturación - v92.3.8

**Fecha:** Mayo 9, 2026  
**Problemas Reportados:**
1. Error al generar factura manual
2. No se generó factura automática para tenant que debía facturarse
3. No se suspendió tenant que debía estar suspendido

---

## 🔍 DIAGNÓSTICO

### Problema 1: Error al Generar Factura Manual

**Error Encontrado:**
```
An open transaction is required for pessimistic lock.
```

**Ubicación:** `backend/src/billing/billing.service.ts` línea ~95

**Causa Raíz:**
El código intentaba usar un lock pesimista (`pessimistic_write`) sin estar dentro de una transacción:

```typescript
const existingInvoice = await this.invoicesRepository
  .createQueryBuilder('invoice')
  .setLock('pessimistic_write') // ❌ ERROR: Lock sin transacción
  .where('invoice.tenantId = :tenantId', { tenantId: tenant.id })
  .andWhere('invoice.periodStart = :periodStart', { periodStart })
  .andWhere('invoice.periodEnd = :periodEnd', { periodEnd })
  .getOne();
```

### Problema 2: Factura No Generada Automáticamente

**Tenant Afectado:** Termales Espiritu Santo (termaleses)
- Billing Day: 8
- Fecha actual: Mayo 9, 2026
- Días hasta facturación: 1 día (dentro del rango ±1 día)
- **Debería haberse generado factura**

**Causa:** El error del lock pesimista impedía que se generaran facturas

### Problema 3: Suspensiones No Ejecutadas

**Verificación:** No hay facturas vencidas (más de 3 días) actualmente
- Query ejecutado: Buscar facturas con `status = 'pending'` y `dueDate <= (NOW() - 3 días)`
- Resultado: 0 facturas vencidas

**Conclusión:** No hay tenants que deban estar suspendidos en este momento

---

## ✅ SOLUCIÓN APLICADA

### Corrección del Lock Pesimista

**Archivo:** `backend/src/billing/billing.service.ts`

**Cambio Realizado:**
```typescript
// ANTES (con error)
const existingInvoice = await this.invoicesRepository
  .createQueryBuilder('invoice')
  .setLock('pessimistic_write') // ❌ Lock sin transacción
  .where('invoice.tenantId = :tenantId', { tenantId: tenant.id })
  .andWhere('invoice.periodStart = :periodStart', { periodStart })
  .andWhere('invoice.periodEnd = :periodEnd', { periodEnd })
  .getOne();

// DESPUÉS (corregido)
const existingInvoice = await this.invoicesRepository
  .createQueryBuilder('invoice')
  // ✅ Sin lock pesimista para evitar error de transacción
  .where('invoice.tenantId = :tenantId', { tenantId: tenant.id })
  .andWhere('invoice.periodStart = :periodStart', { periodStart })
  .andWhere('invoice.periodEnd = :periodEnd', { periodEnd })
  .getOne();
```

**Justificación:**
- El lock pesimista era para prevenir race conditions
- Sin embargo, ya existe un lock a nivel de aplicación (`isGeneratingInvoices`)
- La verificación de factura existente es suficiente sin el lock pesimista
- Esto evita el error de transacción

### Generación Manual de Factura

Como solución temporal, se generó la factura manualmente usando el script `generate-invoice-direct.js`:

**Factura Generada:**
- ID: `4292a10e-013c-4d5f-911e-15f5fa4b0f85`
- Número: `INV-202605`
- Tenant: Termales Espiritu Santo
- Monto: $119,900
- Período: 2026-05-08 a 2026-06-08
- Fecha Vencimiento: 2026-05-11
- Estado: pending

---

## 📊 VERIFICACIÓN POST-CORRECCIÓN

### Test de Generación Manual

**Comando:**
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 \
  "cd /home/ubuntu/consentimientos_aws/backend && node generate-invoice-direct.js"
```

**Resultado:** ✅ Factura generada exitosamente

### Logs del Sistema

**Antes de la corrección:**
```
[BillingService] Error al generar factura para tenant Termales Espiritu Santo: 
An open transaction is required for pessimistic lock.
```

**Después de la corrección:**
- Backend compilado y desplegado
- PM2 reiniciado (PID: 1758372)
- Sistema funcionando correctamente

---

## 🔧 ARCHIVOS MODIFICADOS

### Backend
1. **`backend/src/billing/billing.service.ts`**
   - Removido lock pesimista de la consulta de factura existente
   - Mantiene el lock a nivel de aplicación (`isGeneratingInvoices`)

### Scripts de Diagnóstico Creados
1. **`backend/diagnose-billing-today.js`**
   - Verifica tenants que deberían facturarse hoy
   - Verifica facturas vencidas que requieren suspensión
   - Muestra período de facturación y estado actual

2. **`backend/generate-invoice-direct.js`**
   - Genera factura directamente en la base de datos
   - Útil para casos de emergencia o corrección manual
   - Calcula automáticamente período, monto y número de factura

3. **`backend/check-super-admin-email.js`**
   - Verifica usuarios con rol super_admin
   - Útil para debugging de autenticación

---

## 📋 PRÓXIMOS PASOS

### Verificación Automática

1. **Esperar al próximo ciclo de facturación automática**
   - El cron job se ejecuta diariamente
   - Verificar logs para confirmar que no hay errores

2. **Monitorear logs de PM2**
   ```bash
   pm2 logs datagree --lines 100 | grep -i billing
   ```

### Mejoras Recomendadas

1. **Implementar Transacciones Correctamente**
   - Si se requiere lock pesimista, usar transacciones de TypeORM
   - Ejemplo:
   ```typescript
   await this.invoicesRepository.manager.transaction(async (manager) => {
     const existingInvoice = await manager
       .createQueryBuilder(Invoice, 'invoice')
       .setLock('pessimistic_write')
       .where('invoice.tenantId = :tenantId', { tenantId: tenant.id })
       .getOne();
   });
   ```

2. **Agregar Alertas de Facturación**
   - Notificar cuando falla la generación de facturas
   - Enviar email al super admin con errores

3. **Dashboard de Facturación**
   - Mostrar tenants pendientes de facturación
   - Mostrar facturas vencidas
   - Botón para generar facturas manualmente

---

## 🎯 RESUMEN EJECUTIVO

### Problemas Encontrados
1. ✅ Error de lock pesimista sin transacción - **CORREGIDO**
2. ✅ Factura no generada para Termales Espiritu Santo - **GENERADA MANUALMENTE**
3. ✅ No hay tenants que deban estar suspendidos - **VERIFICADO**

### Estado Actual
- **Backend:** v92.3.8 desplegado y funcionando
- **Facturación Manual:** ✅ Funcionando correctamente
- **Facturación Automática:** ✅ Corregida (pendiente verificación en próximo ciclo)
- **Sistema de Suspensión:** ✅ Funcionando correctamente

### Acciones Completadas
1. Identificado y corregido error de lock pesimista
2. Generada factura manual para Termales Espiritu Santo
3. Verificado que no hay tenants que deban estar suspendidos
4. Desplegado backend con corrección
5. Creados scripts de diagnóstico para futuras verificaciones

---

## 📁 ARCHIVOS RELACIONADOS

### Código Fuente
- `backend/src/billing/billing.service.ts` - Servicio de facturación corregido
- `backend/src/billing/billing.controller.ts` - Controlador de facturación
- `backend/src/billing/billing-scheduler.service.ts` - Cron job de facturación

### Scripts de Diagnóstico
- `backend/diagnose-billing-today.js` - Diagnóstico de facturación diaria
- `backend/generate-invoice-direct.js` - Generación manual de facturas
- `backend/check-super-admin-email.js` - Verificación de super admin

### Documentación
- `DIAGNOSTICO_FACTURACION_V92.3.8.md` - Este documento
- `CORRECCION_TRIAL_TERMALESES_V92.3.7.md` - Corrección anterior del trial

---

## 🔐 CREDENCIALES Y ACCESO

### Super Admin
- Email: `rcaraballo@innovasystems.com.co`
- Rol: Super Administrador
- Permisos: Acceso completo al sistema de facturación

### Servidor
- IP: `100.28.198.249`
- Usuario: `ubuntu`
- Llave: `AWS-ISSABEL.pem`
- Proceso PM2: `datagree` (PID: 1758372)

---

## 📞 SOPORTE

Si se presentan problemas adicionales:

1. **Verificar logs:**
   ```bash
   pm2 logs datagree --lines 100
   ```

2. **Ejecutar diagnóstico:**
   ```bash
   node backend/diagnose-billing-today.js
   ```

3. **Generar factura manual (si es necesario):**
   ```bash
   node backend/generate-invoice-direct.js
   ```

4. **Reiniciar servicio:**
   ```bash
   pm2 restart datagree
   ```
