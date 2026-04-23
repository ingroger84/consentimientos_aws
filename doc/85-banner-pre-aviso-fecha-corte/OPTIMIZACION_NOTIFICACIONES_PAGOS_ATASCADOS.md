# Optimización de Notificaciones de Pagos Atascados

## 📅 Fecha: 2026-04-01
## 🎯 Versión: v85.1.2

---

## 🐛 Problema Identificado

El sistema estaba enviando correos de alerta de pagos atascados cada 10 minutos, lo que resultaba en:

- ✉️ Múltiples correos repetitivos al Super Admin
- 📧 Bandeja de entrada saturada con alertas duplicadas
- 🔔 Fatiga de notificaciones (demasiadas alertas pierden efectividad)
- ⏰ Verificaciones muy frecuentes innecesarias

### Comportamiento Anterior:

```typescript
@Cron(CronExpression.EVERY_10_MINUTES)
async checkStuckPayments(): Promise<void> {
  // Se ejecutaba cada 10 minutos
  // Enviaba un correo cada vez que encontraba pagos atascados
}
```

**Resultado:** Si había 5 pagos atascados, el Super Admin recibía un correo cada 10 minutos durante todo el día (144 correos al día).

---

## ✅ Solución Implementada

### Cambios Realizados:

1. **Frecuencia Reducida:**
   - ❌ Antes: Cada 10 minutos (144 veces al día)
   - ✅ Ahora: 1 vez al día a las 9:00 AM (hora Colombia)

2. **Correo Consolidado:**
   - ❌ Antes: Un correo por cada verificación
   - ✅ Ahora: Un solo correo diario con resumen completo

3. **Agrupación por Tenant:**
   - ✅ Pagos organizados por tenant
   - ✅ Totales por tenant y general
   - ✅ Estadísticas visuales

4. **Mejor Formato:**
   - ✅ Diseño profesional con estadísticas
   - ✅ Información clara y organizada
   - ✅ Tiempo transcurrido en formato legible (horas y minutos)

---

## 🔧 Implementación Técnica

### 1. Servicio de Monitoreo (`payment-monitor.service.ts`)

```typescript
/**
 * Verificar pagos que llevan mucho tiempo sin procesarse
 * Se ejecuta 1 vez al día a las 9:00 AM (hora Colombia UTC-5)
 * Envía un solo correo consolidado con todos los pagos atascados
 */
@Cron('0 9 * * *', {
  timeZone: 'America/Bogota',
})
async checkStuckPayments(): Promise<void> {
  // Buscar facturas con link de pago creado hace más de 1 hora
  // Solo las creadas en las últimas 7 días
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stuckInvoices = await this.invoicesRepository
    .createQueryBuilder('invoice')
    .leftJoinAndSelect('invoice.tenant', 'tenant')
    .where('invoice.status IN (:...statuses)', { 
      statuses: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
    })
    .andWhere('invoice.boldPaymentLink IS NOT NULL')
    .andWhere('invoice.createdAt <= :oneHourAgo', { oneHourAgo })
    .andWhere('invoice.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
    .orderBy('invoice.tenant.name', 'ASC')
    .addOrderBy('invoice.createdAt', 'DESC')
    .getMany();

  if (stuckInvoices.length > 0) {
    // Agrupar por tenant
    const byTenant = new Map<string, Invoice[]>();
    for (const invoice of stuckInvoices) {
      const tenantName = invoice.tenant?.name || 'Desconocido';
      if (!byTenant.has(tenantName)) {
        byTenant.set(tenantName, []);
      }
      byTenant.get(tenantName).push(invoice);
    }

    // Enviar UN SOLO correo consolidado
    await this.sendStuckPaymentsAlert(stuckInvoices);
  }
}
```

### 2. Servicio de Correo (`mail.service.ts`)

```typescript
async sendStuckPaymentsAlert(pendingLinks: Array<{...}>): Promise<void> {
  // Agrupar por tenant
  const byTenant = new Map<string, typeof pendingLinks>();
  for (const link of pendingLinks) {
    if (!byTenant.has(link.tenantName)) {
      byTenant.set(link.tenantName, []);
    }
    byTenant.get(link.tenantName).push(link);
  }

  // Generar HTML agrupado por tenant con estadísticas
  // Formato profesional con resumen visual
  // ...
}
```

---

## 📊 Formato del Correo

### Asunto:
```
📊 Reporte Diario: X Pago(s) Pendiente(s) - Y Tenant(s)
```

### Contenido:

1. **Header:**
   - Título: "📊 Reporte Diario de Pagos"
   - Fecha y hora del reporte
   - Diseño profesional con gradiente naranja

2. **Resumen Ejecutivo:**
   ```
   📋 Resumen del Día:
   
   [5]          [3]          [$450,000]
   Facturas     Tenants      Total
   ```

3. **Detalle por Tenant:**
   ```
   🏢 Hotel Glamping La Polka (2 facturas - Total: $179,800)
   
   📄 INV-2026-001 - $89,900
   ⏱️ Tiempo: 2h 30m
   Ver link de pago →
   
   📄 INV-2026-002 - $89,900
   ⏱️ Tiempo: 1h 15m
   Ver link de pago →
   ```

4. **Acción Recomendada:**
   - Instrucciones claras sobre qué hacer
   - Nota sobre verificación automática cada 2 minutos

5. **Nota Final:**
   - Frecuencia del reporte (1 vez al día)
   - Solo se envía si hay pagos pendientes

---

## 🎯 Beneficios

### Para el Super Admin:

1. ✅ **Menos Spam:**
   - De 144 correos al día → 1 correo al día
   - Reducción del 99.3% en volumen de correos

2. ✅ **Mejor Información:**
   - Vista consolidada de todos los pagos
   - Agrupación por tenant
   - Estadísticas visuales

3. ✅ **Más Eficiente:**
   - Revisión una vez al día
   - Información organizada y clara
   - Fácil de procesar

4. ✅ **Menos Fatiga:**
   - No más alertas constantes
   - Atención enfocada en el momento adecuado
   - Mejor toma de decisiones

### Para el Sistema:

1. ✅ **Menos Carga:**
   - Menos consultas a la base de datos
   - Menos envíos de correo
   - Mejor rendimiento

2. ✅ **Más Inteligente:**
   - Verifica pagos de los últimos 7 días
   - Solo alerta si llevan más de 1 hora
   - Agrupa información relevante

---

## ⏰ Horario de Ejecución

### Cron Job Configurado:

```typescript
@Cron('0 9 * * *', {
  timeZone: 'America/Bogota',
})
```

**Traducción:**
- `0` = Minuto 0
- `9` = Hora 9 (9:00 AM)
- `*` = Todos los días del mes
- `*` = Todos los meses
- `*` = Todos los días de la semana
- `timeZone: 'America/Bogota'` = Zona horaria Colombia (UTC-5)

**Resultado:** Se ejecuta todos los días a las 9:00 AM hora de Colombia.

---

## 🔍 Criterios de Detección

### Pagos Considerados "Atascados":

1. ✅ Estado: `PENDING` o `OVERDUE`
2. ✅ Tiene link de pago de Bold
3. ✅ Creado hace más de 1 hora
4. ✅ Creado en los últimos 7 días

### Pagos Excluidos:

- ❌ Pagos ya procesados (`PAID`)
- ❌ Facturas sin link de pago
- ❌ Facturas creadas hace menos de 1 hora (tiempo normal de procesamiento)
- ❌ Facturas creadas hace más de 7 días (ya no relevantes)

---

## 📋 Archivos Modificados

### 1. `backend/src/payments/payment-monitor.service.ts`
- Cambiado cron de `EVERY_10_MINUTES` a `'0 9 * * *'`
- Agregada zona horaria `America/Bogota`
- Cambiado criterio de 10 minutos a 1 hora
- Agregado rango de 7 días
- Agregada agrupación por tenant en logs

### 2. `backend/src/mail/mail.service.ts`
- Agregada agrupación por tenant en el correo
- Mejorado formato HTML con estadísticas visuales
- Agregado cálculo de totales por tenant
- Mejorado formato de tiempo (horas y minutos)
- Cambiado asunto del correo
- Agregada nota sobre frecuencia del reporte

---

## 🚀 Despliegue

### Pasos Realizados:

1. ✅ Modificar `payment-monitor.service.ts`
2. ✅ Modificar `mail.service.ts`
3. ✅ Compilar backend: `npm run build`
4. ✅ Subir archivos compilados al servidor
5. ✅ Reiniciar proceso PM2

### Comandos Ejecutados:

```bash
# Compilar backend
cd backend
npm run build

# Subir archivos
scp -i AWS-ISSABEL.pem backend/dist/payments/payment-monitor.service.js \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/payments/

scp -i AWS-ISSABEL.pem backend/dist/mail/mail.service.js \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/mail/

# Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 \
  "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree"
```

---

## 🔍 Verificación

### Verificar Cron Job:

```bash
# Ver logs del servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 50"

# Buscar mensaje de verificación diaria
# Debería aparecer: "🔍 Verificación diaria de pagos atascados (9:00 AM Colombia)..."
```

### Próxima Ejecución:

El próximo correo se enviará mañana a las 9:00 AM (hora Colombia), solo si hay pagos atascados.

---

## 📊 Comparación Antes vs Después

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Frecuencia** | Cada 10 minutos | 1 vez al día | 99.3% menos |
| **Correos/día** | 144 | 1 | 143 menos |
| **Formato** | Lista simple | Agrupado por tenant | Más claro |
| **Estadísticas** | No | Sí | Mejor visión |
| **Tiempo mínimo** | 10 minutos | 1 hora | Más realista |
| **Rango temporal** | 24 horas | 7 días | Más completo |
| **Zona horaria** | UTC | Colombia | Correcto |

---

## ✅ Conclusión

El sistema de notificaciones de pagos atascados ahora es:

1. ✅ **Menos intrusivo:** 1 correo al día en lugar de 144
2. ✅ **Más informativo:** Agrupación por tenant y estadísticas
3. ✅ **Más eficiente:** Mejor uso de recursos del servidor
4. ✅ **Más profesional:** Formato de correo mejorado
5. ✅ **Más inteligente:** Criterios de detección optimizados

**Estado:** ✅ COMPLETADO  
**Versión:** v85.1.2  
**Fecha:** 2026-04-01  
**Próxima Ejecución:** Mañana a las 9:00 AM

---

**Nota:** El sistema de verificación automática cada 2 minutos sigue activo para detectar pagos completados y procesarlos inmediatamente. Este cambio solo afecta las notificaciones al Super Admin.
