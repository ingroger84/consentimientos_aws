# Corrección de Facturación para Plan Gratuito - 2026-01-23

## ✅ PROBLEMA IDENTIFICADO Y CORREGIDO

### Descripción del Problema
El sistema de generación automática de facturas estaba creando facturas para tenants con plan gratuito, incluso durante su período de prueba de 7 días. Esto es incorrecto porque:

1. **Plan Gratuito**: No debe generar facturas automáticas
2. **Período de Prueba**: Los tenants en trial no deben ser facturados hasta que termine su período de prueba

### Causa Raíz
La función `generateMonthlyInvoices()` en `backend/src/billing/billing.service.ts` buscaba todos los tenants con estado `ACTIVE` sin verificar:
- Si el tenant tiene plan gratuito (`plan = 'free'`)
- Si el tenant está en período de prueba (`trialEndsAt > now`)

---

## Solución Implementada

### 1. Modificación en `billing.service.ts`

#### Cambio en la Query Principal
```typescript
// ANTES: Buscaba todos los tenants activos
const tenants = await this.tenantsRepository
  .createQueryBuilder('tenant')
  .where('tenant.status = :status', { status: TenantStatus.ACTIVE })
  .andWhere('tenant.billingDay BETWEEN :minDay AND :maxDay', {...})
  .getMany();

// DESPUÉS: Excluye planes gratuitos en la query
const tenants = await this.tenantsRepository
  .createQueryBuilder('tenant')
  .where('tenant.status = :status', { status: TenantStatus.ACTIVE })
  .andWhere('tenant.billingDay BETWEEN :minDay AND :maxDay', {...})
  .andWhere('tenant.plan != :freePlan', { freePlan: 'free' })  // ← NUEVO
  .getMany();
```

#### Validaciones Adicionales en el Loop
```typescript
for (const tenant of tenants) {
  try {
    // Verificación 1: No generar facturas para planes gratuitos
    if (tenant.plan === 'free') {
      console.log(`Tenant ${tenant.name} tiene plan gratuito - omitiendo facturación`);
      skipped++;
      continue;
    }

    // Verificación 2: No facturar si está en período de prueba
    if (tenant.trialEndsAt && tenant.trialEndsAt > now) {
      console.log(`Tenant ${tenant.name} está en período de prueba - omitiendo facturación`);
      skipped++;
      continue;
    }

    // ... resto de la lógica de facturación
  }
}
```

### 2. Mejoras en el Logging
- Contador de facturas omitidas (`skipped`)
- Logs detallados para cada caso de omisión
- Mensaje final con resumen completo

---

## Archivos Modificados

### Backend
- **`backend/src/billing/billing.service.ts`**
  - Agregada condición en query para excluir plan gratuito
  - Agregadas validaciones adicionales en el loop
  - Mejorado logging con contador de omitidos

### Scripts SQL
- **`backend/fix-free-plan-invoices.sql`**
  - Script para verificar facturas de planes gratuitos
  - Query para identificar facturas generadas incorrectamente hoy
  - Comando para eliminar facturas incorrectas (comentado por seguridad)
  - Queries de diagnóstico y estadísticas

---

## Verificación y Limpieza

### 1. Verificar Facturas Incorrectas
```sql
-- Ver facturas de tenants con plan gratuito generadas hoy
SELECT 
    i.id, i.invoice_number, i.created_at, i.total, i.status,
    t.name, t.slug, t.plan, t.trial_ends_at
FROM invoices i
INNER JOIN tenants t ON i.tenant_id = t.id
WHERE t.plan = 'free'
  AND DATE(i.created_at) = CURRENT_DATE;
```

### 2. Eliminar Facturas Incorrectas (Si es necesario)
```sql
-- EJECUTAR SOLO SI HAY FACTURAS INCORRECTAS
DELETE FROM invoices
WHERE id IN (
    SELECT i.id
    FROM invoices i
    INNER JOIN tenants t ON i.tenant_id = t.id
    WHERE t.plan = 'free'
      AND DATE(i.created_at) = CURRENT_DATE
);
```

### 3. Verificar Estado de Tenants Gratuitos
```sql
SELECT 
    id, name, slug, plan, status, billing_day, trial_ends_at,
    CASE 
        WHEN trial_ends_at > NOW() THEN 'En período de prueba'
        WHEN trial_ends_at <= NOW() THEN 'Trial expirado'
        ELSE 'Sin trial'
    END as trial_status
FROM tenants
WHERE plan = 'free'
ORDER BY created_at DESC;
```

---

## Lógica de Facturación Corregida

### Reglas de Facturación
1. **Plan Gratuito**: NUNCA generar facturas automáticas
2. **Período de Prueba Activo**: No facturar hasta que expire el trial
3. **Planes de Pago**: Facturar según `billingDay` y `billingCycle`

### Flujo de Validación
```
┌─────────────────────────────────────┐
│ Tenant con billingDay = hoy (±1)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ¿Estado = ACTIVE?                   │
└──────────────┬──────────────────────┘
               │ Sí
               ▼
┌─────────────────────────────────────┐
│ ¿Plan = 'free'?                     │
└──────────────┬──────────────────────┘
               │ No
               ▼
┌─────────────────────────────────────┐
│ ¿trialEndsAt > now?                 │
└──────────────┬──────────────────────┘
               │ No
               ▼
┌─────────────────────────────────────┐
│ ¿Ya existe factura pendiente?      │
└──────────────┬──────────────────────┘
               │ No
               ▼
┌─────────────────────────────────────┐
│ ✅ GENERAR FACTURA                  │
└─────────────────────────────────────┘
```

---

## Proceso de Despliegue

### 1. Compilación
```bash
cd backend
npm run build
```

### 2. Despliegue al Servidor
```bash
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
```

### 3. Reinicio del Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree-backend"
```

### 4. Verificación
```bash
# Verificar versión
curl https://archivoenlinea.com/api/auth/version

# Verificar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status"
```

---

## Impacto de la Corrección

### Antes
- ❌ Facturas generadas para planes gratuitos
- ❌ Facturas generadas durante período de prueba
- ❌ Confusión en el dashboard de facturación
- ❌ Posibles intentos de cobro incorrectos

### Después
- ✅ Planes gratuitos excluidos de facturación automática
- ✅ Período de prueba respetado correctamente
- ✅ Dashboard de facturación limpio y preciso
- ✅ Solo se facturan planes de pago activos

---

## Monitoreo Post-Corrección

### Verificaciones Recomendadas

1. **Diarias (próximos 7 días)**
   - Revisar logs del cron job de facturación
   - Verificar que no se generen facturas para planes gratuitos
   - Confirmar que tenants en trial no sean facturados

2. **Semanales**
   - Ejecutar script de verificación SQL
   - Revisar estadísticas de facturación por plan
   - Validar que el contador de "omitidos" sea correcto

3. **Mensuales**
   - Auditoría completa de facturas generadas
   - Verificar que todos los planes de pago fueron facturados
   - Confirmar que ningún plan gratuito tiene facturas

---

## Casos de Uso Validados

### ✅ Caso 1: Tenant con Plan Gratuito
- **Estado**: ACTIVE
- **Plan**: free
- **Trial**: Activo (7 días)
- **Resultado**: No se genera factura ✓

### ✅ Caso 2: Tenant con Plan de Pago en Trial
- **Estado**: ACTIVE
- **Plan**: basic
- **Trial**: Activo (30 días)
- **Resultado**: No se genera factura hasta que expire el trial ✓

### ✅ Caso 3: Tenant con Plan de Pago sin Trial
- **Estado**: ACTIVE
- **Plan**: professional
- **Trial**: Expirado o sin trial
- **Resultado**: Se genera factura según billingDay ✓

### ✅ Caso 4: Tenant con Plan Gratuito Expirado
- **Estado**: SUSPENDED (por cron job de suspensión)
- **Plan**: free
- **Trial**: Expirado
- **Resultado**: No se genera factura (estado SUSPENDED) ✓

---

## Notas Técnicas

### Cron Jobs Relacionados
1. **Generar Facturas**: Diario a las 00:00
2. **Suspender Trials Expirados**: Diario a las 02:00
3. **Suspender Morosos**: Diario a las 23:00

### Orden de Ejecución
```
00:00 → Generar facturas (solo planes de pago activos)
01:00 → Actualizar estado de facturas vencidas
02:00 → Suspender cuentas gratuitas expiradas
23:00 → Suspender tenants morosos
```

### Consideraciones Importantes
- Los planes gratuitos se suspenden automáticamente después de 7 días
- Una vez suspendidos, no pueden generar facturas (estado != ACTIVE)
- Los tenants pueden actualizar su plan antes de que expire el trial
- Al actualizar de plan gratuito a pago, se establece nuevo billingDay

---

## Estado del Sistema

### Servidor de Producción
- **IP**: 100.28.198.249
- **Backend**: ✅ Online (PM2 - datagree-backend v8.0.0)
- **Corrección**: ✅ Desplegada y activa

### Próxima Ejecución del Cron
- **Fecha**: 2026-01-24 00:00:00
- **Acción**: Generación de facturas mensuales
- **Validación**: Verificar logs para confirmar omisiones correctas

---

**Corrección realizada por**: Sistema Automatizado  
**Fecha**: 2026-01-23  
**Hora**: Tarde  
**Estado**: ✅ COMPLETADO Y DESPLEGADO
