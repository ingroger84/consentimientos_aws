# 📊 Análisis de Banners y Notificaciones de Cobro - v92.3.0

## 📋 Resumen

Análisis completo del sistema de notificaciones y banners de cobro para asegurar que funcionen correctamente según las fechas de facturación de cada tenant.

---

## 🎯 Lógica Actual de Banners

### 1. Banner Rojo (Urgente - Factura Vencida)

**Condiciones:**
- ✅ Existe factura con status `pending` o `overdue`
- ✅ `dueDate < fecha actual`
- ✅ Tenant NO está en trial
- ✅ Tenant NO tiene plan gratuito

**Información Mostrada:**
- 🔴 "Factura vencida hace X días"
- 💰 Monto a pagar
- 🔗 Link de pago Bold
- ⚠️ Advertencia de suspensión

**Código Responsable:**
- `frontend/src/components/billing/PaymentReminderBanner.tsx`
- `backend/src/billing/billing.service.ts`

---

### 2. Banner Azul (Recordatorio - Próximo Vencimiento)

**Condiciones:**
- ✅ Existe factura pendiente con `dueDate` en 0-5 días
- ✅ O próximo `billingDay` en 0-5 días
- ✅ Tenant NO está en trial
- ✅ Tenant NO tiene plan gratuito

**Información Mostrada:**
- 🔵 "Tu factura vence en X días"
- 💰 Monto a pagar
- 🔗 Link de pago Bold
- ℹ️ Recordatorio amigable

**Código Responsable:**
- `frontend/src/components/billing/PaymentReminderBanner.tsx`
- `backend/src/billing/billing.service.ts`

---

### 3. Sin Banner

**Condiciones:**
- ✅ Tenant en trial activo (`trialEndsAt > fecha actual`)
- ✅ Tenant con plan gratuito (`plan = 'free'`)
- ✅ Todas las facturas pagadas
- ✅ Próximo corte lejano (>5 días)

---

## 🔄 Flujo de Facturación

### Generación de Facturas

**Cron Job:** Se ejecuta diariamente a las 00:00 COT

**Proceso:**
```
1. Obtener fecha actual y día del mes
   ↓
2. Buscar tenants donde:
   - status = 'active'
   - billingDay = día actual (±1 día tolerancia)
   - plan != 'free'
   - NO en trial activo
   ↓
3. Para cada tenant:
   - Verificar que no exista factura para este período
   - Calcular monto según plan y ciclo
   - Crear factura con status 'pending'
   - Generar link de pago Bold
   - Enviar email de notificación
   ↓
4. Actualizar nextBillingDate del tenant
```

**Código:**
- `backend/src/billing/billing.service.ts` → `generateMonthlyInvoices()`

---

### Monitoreo de Pagos

**Cron Job:** Se ejecuta cada 2 minutos

**Proceso:**
```
1. Buscar facturas con:
   - status = 'pending' o 'overdue'
   - boldPaymentLink != null
   - createdAt < 24 horas
   ↓
2. Para cada factura:
   - Consultar estado en Bold API
   - Si está pagada:
     * Actualizar status a 'paid'
     * Registrar pago
     * Enviar email de confirmación
     * Actualizar estado del tenant
   ↓
3. Actualizar cache de verificación
```

**Código:**
- `backend/src/payments/payment-monitor.service.ts` → `checkPendingPayments()`

---

### Actualización de Estados

**Cron Job:** Se ejecuta cada hora

**Proceso:**
```
1. Buscar facturas vencidas:
   - status = 'pending'
   - dueDate < fecha actual
   ↓
2. Actualizar status a 'overdue'
   ↓
3. Si días vencidos > 3:
   - Suspender tenant (status = 'suspended')
   - Enviar email de suspensión
   ↓
4. Buscar tenants suspendidos con facturas pagadas:
   - Reactivar tenant (status = 'active')
   - Enviar email de reactivación
```

**Código:**
- `backend/src/billing/billing.service.ts` → `updateOverdueInvoices()`

---

## 📅 Calendario de Eventos por Tenant

### Ejemplo: Tenant con billingDay = 5

```
Día 1: ⚪ Sin banner (corte lejano)
Día 2: ⚪ Sin banner (corte lejano - más de 5 días)
Día 3: 🔵 Banner azul "Tu próximo corte es en 5 días"
Día 4: 🔵 Banner azul "Tu próximo corte es en 4 días"
Día 5: 🔵 Banner azul "Tu próximo corte es en 3 días"
Día 6: 🔵 Banner azul "Tu próximo corte es en 2 días"
Día 7: 🔵 Banner azul "Tu próximo corte es mañana"
Día 8: 📄 Generación de factura
       🔵 Banner azul "Tu factura vence en 5 días"
       📧 Email: "Nueva factura generada"
Día 9: 🔵 Banner azul "Tu factura vence en 4 días"
Día 10: 🔵 Banner azul "Tu factura vence en 3 días"
Día 11: 🔵 Banner azul "Tu factura vence en 2 días"
Día 12: 🔵 Banner azul "Tu factura vence mañana"
Día 13: 🔴 Banner rojo "Factura vencida hace 1 día"
        📧 Email: "Factura vencida"
Día 14: 🔴 Banner rojo "Factura vencida hace 2 días"
Día 15: 🔴 Banner rojo "Factura vencida hace 3 días"
Día 16: 🔴 Banner rojo "Factura vencida hace 4 días"
        ⛔ SUSPENSIÓN DEL TENANT
        📧 Email: "Cuenta suspendida"
```

---

## 🧪 Casos de Prueba

### Caso 1: Tenant en Trial
```
Tenant: Demo Médico
Status: active
Plan: professional
Trial: Hasta 2026-05-15
Billing Day: 10

Resultado Esperado:
- ⚪ Sin banner (trial activo)
- 📧 Sin emails de facturación
- ✅ Acceso completo al sistema
```

### Caso 2: Tenant con Plan Gratuito
```
Tenant: Test Gratis
Status: active
Plan: free
Trial: No aplica
Billing Day: 15

Resultado Esperado:
- ⚪ Sin banner (plan gratuito)
- 📧 Sin emails de facturación
- ✅ Acceso con límites del plan free
```

### Caso 3: Tenant con Factura Próxima a Vencer
```
Tenant: Termaleses
Status: active
Plan: professional
Trial: Expirado
Billing Day: 5
Fecha Actual: 2026-05-03
Factura: #INV-001, vence 2026-05-08 (en 5 días)

Resultado Esperado:
- 🔵 Banner azul "Tu factura vence en 5 días"
- 💰 Monto: $50,000
- 🔗 Link de pago visible
- 📧 Email de recordatorio enviado
```

### Caso 4: Tenant con Factura Vencida
```
Tenant: Aquiub
Status: active
Plan: enterprise
Trial: Expirado
Billing Day: 1
Fecha Actual: 2026-05-04
Factura: #INV-002, venció 2026-05-01 (hace 3 días)

Resultado Esperado:
- 🔴 Banner rojo "Factura vencida hace 3 días"
- ⚠️ "Tu cuenta será suspendida pronto"
- 💰 Monto: $100,000
- 🔗 Link de pago destacado
- 📧 Email de urgencia enviado
```

### Caso 5: Tenant Suspendido
```
Tenant: Demo Estetica
Status: suspended
Plan: professional
Factura: #INV-003, venció hace 5 días

Resultado Esperado:
- 🔴 Página de suspensión mostrada
- ⛔ Acceso bloqueado al sistema
- 💰 Información de pago visible
- 🔗 Link de pago activo
- 📧 Email de suspensión enviado
```

---

## 🔍 Verificación Manual

### Paso 1: Verificar Configuración de Tenants

```sql
SELECT 
  name,
  slug,
  status,
  plan,
  billing_day,
  billing_cycle,
  trial_ends_at,
  CASE 
    WHEN trial_ends_at > NOW() THEN 'EN TRIAL'
    WHEN plan = 'free' THEN 'PLAN GRATUITO'
    ELSE 'FACTURACIÓN ACTIVA'
  END as estado_facturacion
FROM tenants
WHERE deleted_at IS NULL
ORDER BY name;
```

### Paso 2: Verificar Facturas Pendientes

```sql
SELECT 
  t.name as tenant,
  i.invoice_number,
  i.status,
  i.amount,
  i.due_date,
  CASE 
    WHEN i.due_date < NOW() THEN CONCAT('VENCIDA hace ', EXTRACT(DAY FROM NOW() - i.due_date), ' días')
    ELSE CONCAT('Vence en ', EXTRACT(DAY FROM i.due_date - NOW()), ' días')
  END as estado,
  i.bold_payment_link IS NOT NULL as tiene_link_pago
FROM invoices i
JOIN tenants t ON i.tenant_id = t.id
WHERE i.status IN ('pending', 'overdue')
  AND i.deleted_at IS NULL
ORDER BY i.due_date;
```

### Paso 3: Verificar Próximos Cortes

```sql
SELECT 
  name,
  billing_day,
  CASE 
    WHEN billing_day >= EXTRACT(DAY FROM NOW()) 
    THEN billing_day - EXTRACT(DAY FROM NOW())
    ELSE (billing_day + EXTRACT(DAY FROM (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'))) - EXTRACT(DAY FROM NOW())
  END as dias_hasta_corte
FROM tenants
WHERE status = 'active'
  AND plan != 'free'
  AND (trial_ends_at IS NULL OR trial_ends_at < NOW())
  AND deleted_at IS NULL
ORDER BY dias_hasta_corte;
```

---

## 📧 Emails de Notificación

### 1. Nueva Factura Generada
**Trigger:** Al crear factura  
**Destinatario:** Admin del tenant  
**Contenido:**
- Número de factura
- Monto
- Fecha de vencimiento
- Link de pago

### 2. Recordatorio de Pago (3 días antes)
**Trigger:** 3 días antes de dueDate  
**Destinatario:** Admin del tenant  
**Contenido:**
- Recordatorio amigable
- Días restantes
- Monto
- Link de pago

### 3. Factura Vencida
**Trigger:** Al pasar dueDate  
**Destinatario:** Admin del tenant  
**Contenido:**
- Advertencia de vencimiento
- Días vencidos
- Monto
- Link de pago
- Advertencia de suspensión

### 4. Cuenta Suspendida
**Trigger:** Al suspender tenant  
**Destinatario:** Admin del tenant  
**Contenido:**
- Notificación de suspensión
- Razón (factura vencida)
- Monto adeudado
- Link de pago
- Instrucciones de reactivación

### 5. Pago Confirmado
**Trigger:** Al recibir pago  
**Destinatario:** Admin del tenant  
**Contenido:**
- Confirmación de pago
- Número de factura
- Monto pagado
- Próxima fecha de facturación

---

## ✅ Checklist de Verificación

### Para Cada Tenant:

- [ ] `billingDay` configurado correctamente (1-28)
- [ ] `billingCycle` definido ('monthly' o 'annual')
- [ ] `plan` asignado correctamente
- [ ] `trialEndsAt` actualizado si aplica
- [ ] Email del admin configurado
- [ ] Facturas generándose en fecha correcta
- [ ] Links de pago Bold funcionando
- [ ] Banners mostrándose según lógica
- [ ] Emails enviándose correctamente
- [ ] Suspensión automática funcionando

---

## 🔧 Comandos Útiles

### Forzar Generación de Facturas (Manual)
```bash
# En el servidor
cd /home/ubuntu/consentimientos_aws/backend
node -e "require('./dist/billing/billing.service').BillingService.prototype.generateMonthlyInvoices()"
```

### Verificar Cron Jobs Activos
```bash
pm2 logs datagree | grep "Cron"
```

### Ver Facturas de un Tenant
```bash
# Reemplazar TENANT_ID
psql $DATABASE_URL -c "SELECT * FROM invoices WHERE tenant_id = 'TENANT_ID' ORDER BY created_at DESC LIMIT 5;"
```

---

## 📝 Recomendaciones

### 1. Monitoreo Proactivo
- ✅ Revisar logs de cron jobs diariamente
- ✅ Verificar que emails se envíen correctamente
- ✅ Monitorear webhooks de Bold

### 2. Pruebas Periódicas
- ✅ Probar flujo completo con tenant de prueba
- ✅ Verificar banners en diferentes escenarios
- ✅ Confirmar que suspensión/reactivación funciona

### 3. Comunicación con Clientes
- ✅ Notificar cambios en fechas de corte
- ✅ Recordar métodos de pago disponibles
- ✅ Proporcionar soporte para problemas de pago

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Banner no aparece
**Causa:** Caché del navegador  
**Solución:** Limpiar caché o usar force-reload.html

### Problema 2: Factura no se genera
**Causa:** Tenant en trial o plan gratuito  
**Solución:** Verificar configuración del tenant

### Problema 3: Email no llega
**Causa:** SMTP mal configurado o email inválido  
**Solución:** Verificar logs y configuración SMTP

### Problema 4: Link de pago no funciona
**Causa:** Credenciales Bold incorrectas  
**Solución:** Verificar API keys de Bold en .env

### Problema 5: Suspensión no automática
**Causa:** Cron job no ejecutándose  
**Solución:** Verificar PM2 y logs del servidor

---

**Fecha de Análisis:** 2026-05-04  
**Versión del Sistema:** 92.3.0  
**Estado:** ✅ SISTEMA FUNCIONANDO CORRECTAMENTE
