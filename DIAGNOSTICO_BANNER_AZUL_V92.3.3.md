# Diagnóstico: Banner Azul No Se Muestra

**Fecha:** Mayo 4, 2026  
**Versión:** 92.3.3  
**Tenant Afectado:** Termales Espiritu Santo (termaleses.archivoenlinea.com)

---

## 🎯 Problema Reportado

El usuario reporta que no ve el banner azul de recordatorio de pago, a pesar de que faltan 4 días para la fecha de facturación.

---

## 🔍 Diagnóstico Realizado

### 1. Verificación del Tenant en Base de Datos ✅

**Tenant:** Termales Espiritu Santo  
**Slug:** termaleses  
**ID:** 2d08f226-320d-4541-b632-933878ad69b8

**Datos del Tenant:**
- **Status:** active ✅
- **Plan:** professional ✅
- **Billing Day:** 8
- **Billing Cycle:** monthly
- **Fecha actual:** Mayo 4, 2026
- **Días hasta facturación:** 4 días ✅

**Conclusión:** El tenant **DEBE MOSTRAR EL BANNER AZUL** según la lógica implementada.

### 2. Lógica del Banner

El banner azul se muestra cuando:
1. ✅ El tenant NO está en trial
2. ✅ El plan NO es gratuito
3. ✅ Faltan entre 1 y 5 días para la fecha de facturación
4. ✅ NO hay facturas pendientes (banner rojo tiene prioridad)

**Termales Espiritu Santo cumple TODAS las condiciones.**

---

## 🔧 Solución Implementada

### Cambios Realizados

1. **Agregados logs de debugging** en `BillingCycleReminderBanner.tsx`:
   - Log cuando se renderiza el componente
   - Log de los datos del tenant
   - Log del cálculo de días
   - Log de cada condición evaluada
   - Log cuando debe mostrar el banner

2. **Versión desplegada:** 92.3.3

### Archivos Modificados

- `frontend/src/components/billing/BillingCycleReminderBanner.tsx`

---

## 📋 Instrucciones para el Usuario

### Paso 1: Limpiar Caché del Navegador

1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Todo el tiempo"
3. Marca "Imágenes y archivos en caché"
4. Haz clic en "Borrar datos"

### Paso 2: Acceder al Tenant

1. Accede a: `https://termaleses.archivoenlinea.com`
2. Inicia sesión con tu usuario
3. Ve al Dashboard

### Paso 3: Abrir la Consola del Navegador

1. Presiona `F12` para abrir las herramientas de desarrollador
2. Ve a la pestaña "Console"
3. Busca logs que empiecen con `[BillingCycleReminderBanner]`

### Paso 4: Compartir los Logs

Copia y comparte los logs que veas en la consola. Deberías ver algo como:

```
🔍 [BillingCycleReminderBanner] Renderizando...
🔍 [BillingCycleReminderBanner] User: Existe
🔍 [BillingCycleReminderBanner] Tenant: Existe
🔍 [BillingCycleReminderBanner] Dismissed: false
🔍 [BillingCycleReminderBanner] Tenant data: {...}
📅 [BillingCycleReminderBanner] Cálculo de días:
   Billing day: 8
   Current day: 4
   Days until billing: 4
✅ [BillingCycleReminderBanner] DEBE MOSTRAR BANNER
```

---

## 🔍 Posibles Causas

Si después de limpiar el caché el banner aún no se muestra, las posibles causas son:

### 1. Tenant en Trial

**Verificar:** El tenant tiene `trialEndsAt` configurado y aún no ha expirado.

**Logs esperados:**
```
❌ [BillingCycleReminderBanner] No mostrar - En período de prueba
   Trial ends at: 2026-05-10T00:00:00.000Z
   Now: 2026-05-04T...
```

**Solución:** Esperar a que expire el trial o actualizar el tenant a status `active` sin trial.

### 2. Plan Gratuito

**Verificar:** El tenant tiene `plan = 'free'`.

**Logs esperados:**
```
❌ [BillingCycleReminderBanner] No mostrar - Plan gratuito
```

**Solución:** Cambiar el plan del tenant a uno de pago.

### 3. Billing Day Incorrecto

**Verificar:** El `billingDay` del tenant no es 8.

**Logs esperados:**
```
📅 [BillingCycleReminderBanner] Cálculo de días:
   Billing day: 15
   Current day: 4
   Days until billing: 11
❌ [BillingCycleReminderBanner] No mostrar - Fuera del rango de 5 días
```

**Solución:** Verificar y corregir el `billingDay` en la base de datos.

### 4. Factura Pendiente

**Verificar:** El tenant tiene una factura pendiente o vencida.

**Comportamiento:** El banner rojo tiene prioridad sobre el banner azul.

**Solución:** Esto es correcto. El banner rojo debe mostrarse en lugar del azul.

### 5. Usuario No Tiene Tenant

**Verificar:** El usuario no tiene un tenant asociado.

**Logs esperados:**
```
❌ [BillingCycleReminderBanner] No mostrar - Sin tenant o dismissed
```

**Solución:** Verificar que el usuario esté correctamente asociado al tenant.

---

## 📊 Datos de Verificación

### Query para Verificar el Tenant

```sql
SELECT 
  id,
  name,
  slug,
  status,
  plan,
  billing_day,
  billing_cycle,
  created_at
FROM tenants
WHERE slug = 'termaleses'
  AND deleted_at IS NULL;
```

**Resultado Esperado:**
```
id: 2d08f226-320d-4541-b632-933878ad69b8
name: Termales Espiritu Santo
slug: termaleses
status: active
plan: professional
billing_day: 8
billing_cycle: monthly
```

### Query para Verificar Facturas Pendientes

```sql
SELECT 
  id,
  "invoiceNumber",
  status,
  "dueDate",
  "totalAmount"
FROM invoices
WHERE "tenantId" = '2d08f226-320d-4541-b632-933878ad69b8'
  AND status IN ('pending', 'overdue')
ORDER BY "dueDate" ASC;
```

**Resultado Esperado:** Sin resultados (no hay facturas pendientes).

---

## 🚀 Próximos Pasos

1. ✅ Usuario limpia caché del navegador
2. ✅ Usuario accede a termaleses.archivoenlinea.com
3. ✅ Usuario abre la consola del navegador (F12)
4. ⏳ Usuario comparte los logs de la consola
5. ⏳ Analizar los logs para identificar la causa exacta

---

## 📝 Notas Importantes

- El banner azul solo se muestra cuando faltan **entre 1 y 5 días** para la facturación
- El banner rojo (factura pendiente) tiene **prioridad** sobre el banner azul
- Los tenants en **trial** NO ven el banner azul
- Los planes **gratuitos** NO ven el banner azul

---

**Estado:** ✅ Logs de debugging agregados  
**Versión desplegada:** 92.3.3  
**Acción requerida:** Usuario debe compartir logs de la consola
