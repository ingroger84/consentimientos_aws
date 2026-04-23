# Implementación Banner de Pre-Aviso de Fecha de Corte

## 📅 Fecha: 2026-04-01
## 🎯 Versión: v85.0.0

---

## 🎯 Objetivo

Implementar un banner que avise a los clientes **5 días antes de la fecha de corte** (billing_day) para que se preparen para el pago de su factura mensual.

---

## 💡 Motivación

### Problema Anterior:
- Los clientes solo veían recordatorios **después** de que la factura se generaba
- No tenían tiempo suficiente para prepararse financieramente
- Algunos clientes se sorprendían con la factura

### Solución:
- Banner de pre-aviso que aparece **5 días antes** de la fecha de corte
- Informa el monto exacto a pagar
- Indica la fecha de generación y vencimiento
- Ayuda al cliente a planificar su pago

---

## 📊 Flujo Completo de Recordatorios

### Ejemplo: Tenant con billing_day = 1 (factura el 1 de cada mes)

```
Día 26 del mes anterior (6 días antes):
❌ No se muestra ningún banner

Día 27 del mes anterior (5 días antes):
✅ BANNER AZUL - Pre-Aviso de Fecha de Corte
   "📅 Próxima Fecha de Corte - 5 días restantes"
   "Tu factura se generará el 1 de abril por $89,900"

Día 28 del mes anterior (4 días antes):
✅ BANNER AZUL - Pre-Aviso
   "📅 Próxima Fecha de Corte - 4 días restantes"

Día 29 del mes anterior (3 días antes):
✅ BANNER AZUL - Pre-Aviso
   "📅 Próxima Fecha de Corte - 3 días restantes"

Día 30 del mes anterior (2 días antes):
✅ BANNER AZUL - Pre-Aviso
   "📅 Próxima Fecha de Corte - 2 días restantes"

Día 31 del mes anterior (1 día antes):
✅ BANNER AZUL - Pre-Aviso
   "📅 Próxima Fecha de Corte - 1 día restante"

Día 1 (fecha de corte - 00:00 AM):
🔄 Se genera la factura automáticamente
✅ BANNER AMARILLO - Recordatorio de Pago
   "💳 Recordatorio de Pago - 15 días restantes"
   (Si la factura vence en 15 días, no se muestra hasta que falten 5 días)

Día 11 (5 días antes del vencimiento):
✅ BANNER AMARILLO - Recordatorio de Pago
   "💳 Recordatorio de Pago - 5 días restantes"
   "Tu factura INV-202604-1234 vence el 16 de abril"

Día 16 (fecha de vencimiento):
✅ BANNER AMARILLO - Recordatorio de Pago
   "💳 Recordatorio de Pago - Vence hoy"

Día 17 (1 día vencida):
✅ BANNER ROJO - Factura Vencida
   "⚠️ Factura Vencida - Acción Requerida"
   "La factura venció hace 1 día(s)"

Día 19 (3 días vencida - fin del período de gracia):
✅ BANNER ROJO - Último día
   "⚠️ Factura Vencida - Acción Requerida"

Día 20 (4 días vencida):
🚫 CUENTA SUSPENDIDA
   Email de suspensión enviado
```

---

## 🎨 Diseño del Banner de Pre-Aviso

### Características Visuales:

**Color:** Azul (diferente al amarillo de recordatorio de pago)
- Fondo: Degradado de azul claro a índigo
- Borde izquierdo: Azul (#3B82F6)
- Texto: Azul oscuro

**Iconos:**
- 📅 Calendario (principal)
- ℹ️ Información (mensaje de preparación)

**Elementos:**
1. Título: "📅 Próxima Fecha de Corte"
2. Badge: Días restantes (ej: "3 días restantes")
3. Mensaje principal: Fecha de generación y monto
4. Mensaje secundario: Fecha de vencimiento
5. Caja informativa: Mensaje de preparación
6. Botón cerrar (X)

### Ejemplo Visual:

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Próxima Fecha de Corte          [3 días restantes]  [X] │
│                                                             │
│ Tu factura se generará el 1 de abril de 2026 por un monto │
│ de $89,900. Tendrás hasta el 16 de abril para realizar el │
│ pago.                                                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Prepárate para el pago: Asegúrate de tener fondos   │ │
│ │   disponibles para evitar la suspensión de tu cuenta.  │ │
│ │   Una vez generada la factura, recibirás un correo con │ │
│ │   el link de pago.                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### 1. Nuevo Componente: BillingCycleReminderBanner

**Archivo:** `frontend/src/components/billing/BillingCycleReminderBanner.tsx`

**Lógica:**
```typescript
// Obtener billing_day del tenant
const billingDay = tenant.billingDay || 1;
const now = new Date();
const currentDay = now.getDate();

// Calcular días hasta la fecha de corte
let daysUntilBilling = billingDay - currentDay;

// Si ya pasó el día de facturación este mes, calcular para el próximo mes
if (daysUntilBilling < 0) {
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  const diffTime = nextMonth.getTime() - now.getTime();
  daysUntilBilling = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Solo mostrar si faltan 5 días o menos
if (daysUntilBilling > 5 || daysUntilBilling < 0) {
  return null;
}
```

**Condiciones para mostrar:**
- ✅ Tenant tiene plan de pago (no free)
- ✅ Tenant NO está en período de prueba
- ✅ Faltan 5 días o menos para el billing_day
- ✅ NO hay facturas pendientes (si hay factura, se muestra el otro banner)

### 2. Componente Actualizado: PaymentReminderBanner

**Archivo:** `frontend/src/components/billing/PaymentReminderBanner.tsx`

**Cambios:**
```typescript
// Importar nuevo componente
import BillingCycleReminderBanner from './BillingCycleReminderBanner';

// Si no hay facturas pendientes, mostrar banner de pre-aviso
if (loading || !user?.tenant || dismissed) {
  return <BillingCycleReminderBanner />;
}

// Si no hay facturas pendientes, mostrar banner de pre-aviso
return <BillingCycleReminderBanner />;
```

**Prioridad de Banners:**
1. 🔴 Banner Rojo (Factura Vencida) - Máxima prioridad
2. 🟡 Banner Amarillo (Recordatorio de Pago) - Alta prioridad
3. 🔵 Banner Azul (Pre-Aviso de Fecha de Corte) - Prioridad normal

---

## 📋 Casos de Uso

### Caso 1: Tenant con billing_day = 1

**Fecha actual:** 27 de marzo
**Días hasta fecha de corte:** 5 días (1 de abril)

**Banner mostrado:**
```
📅 Próxima Fecha de Corte - 5 días restantes

Tu factura se generará el 1 de abril de 2026 por un monto de $89,900.
Tendrás hasta el 16 de abril para realizar el pago.

ℹ️ Prepárate para el pago: Asegúrate de tener fondos disponibles...
```

### Caso 2: Tenant con billing_day = 15

**Fecha actual:** 10 de abril
**Días hasta fecha de corte:** 5 días (15 de abril)

**Banner mostrado:**
```
📅 Próxima Fecha de Corte - 5 días restantes

Tu factura se generará el 15 de abril de 2026 por un monto de $119,900.
Tendrás hasta el 30 de abril para realizar el pago.

ℹ️ Prepárate para el pago: Asegúrate de tener fondos disponibles...
```

### Caso 3: Tenant con billing_day = 28 (fin de mes)

**Fecha actual:** 23 de marzo
**Días hasta fecha de corte:** 5 días (28 de marzo)

**Banner mostrado:**
```
📅 Próxima Fecha de Corte - 5 días restantes

Tu factura se generará el 28 de marzo de 2026 por un monto de $89,900.
Tendrás hasta el 12 de abril para realizar el pago.

ℹ️ Prepárate para el pago: Asegúrate de tener fondos disponibles...
```

---

## 🎯 Beneficios

### Para el Cliente:
1. ✅ **Anticipación:** Sabe con 5 días de anticipación cuándo se generará su factura
2. ✅ **Planificación:** Puede preparar los fondos necesarios
3. ✅ **Transparencia:** Conoce el monto exacto antes de la facturación
4. ✅ **Evita sorpresas:** No se sorprende con la factura
5. ✅ **Reduce estrés:** Tiene tiempo para organizar su pago

### Para el Negocio:
1. ✅ **Menos suspensiones:** Clientes preparados pagan a tiempo
2. ✅ **Mejor experiencia:** Clientes más satisfechos
3. ✅ **Menos soporte:** Menos consultas sobre fechas de pago
4. ✅ **Mayor retención:** Clientes valoran la transparencia
5. ✅ **Flujo de caja:** Pagos más puntuales

---

## 📊 Comparación: Antes vs Después

### Antes (sin pre-aviso):

```
Día 1: 🔄 Factura generada
       ❌ Cliente sorprendido
       ❌ No tiene fondos preparados
       
Día 11: ✅ Banner amarillo (5 días para vencer)
        ⚠️ Cliente apurado para conseguir fondos
        
Día 16: ⏰ Factura vence
        ❌ Cliente no pudo pagar a tiempo
        
Día 20: 🚫 Cuenta suspendida
        😞 Cliente frustrado
```

### Después (con pre-aviso):

```
Día -5: ✅ Banner azul (pre-aviso)
        ✅ Cliente informado
        ✅ Comienza a preparar fondos
        
Día 1:  🔄 Factura generada
        ✅ Cliente preparado
        ✅ Tiene fondos disponibles
        
Día 11: ✅ Banner amarillo (5 días para vencer)
        ✅ Cliente tranquilo, ya tiene fondos
        
Día 14: 💳 Cliente paga
        ✅ Pago exitoso
        😊 Cliente satisfecho
```

---

## 🔍 Verificación

### Pasos para Verificar:

1. **Acceder al sistema:**
   - URL: https://[tenant].archivoenlinea.com
   - Usuario: Usuario del tenant

2. **Verificar condiciones:**
   - Tenant tiene plan de pago (basic, professional, enterprise)
   - Tenant NO está en período de prueba
   - Faltan 5 días o menos para el billing_day

3. **Verificar banner:**
   - Banner azul aparece en el dashboard
   - Muestra días restantes correctos
   - Muestra fecha de generación correcta
   - Muestra monto correcto
   - Muestra fecha de vencimiento correcta
   - Mensaje de preparación visible

4. **Verificar comportamiento:**
   - Banner se puede cerrar (X)
   - Banner desaparece si se cierra
   - Banner NO aparece si faltan más de 5 días
   - Banner NO aparece si hay factura pendiente

---

## 📝 Configuración

### Variables de Entorno:

No se requieren nuevas variables de entorno. El sistema usa:
- `tenant.billingDay`: Día de facturación del tenant (1-28)
- `tenant.plan`: Plan del tenant (basic, professional, enterprise)
- `tenant.trialEndsAt`: Fecha de fin del período de prueba

### Precios por Plan:

```typescript
const prices: { [key: string]: number } = {
  basic: 89900,
  professional: 119900,
  enterprise: 179900,
};
```

---

## 🚀 Despliegue

### Comando:

```powershell
.\scripts\deploy-v85-billing-cycle-reminder.ps1
```

### Pasos del Despliegue:

1. ✅ Compilar frontend
2. ✅ Subir archivos al servidor
3. ✅ Limpiar caché de Nginx
4. ✅ Recargar Nginx

### Verificación Post-Despliegue:

```bash
# Verificar versión
curl https://admin.archivoenlinea.com/version

# Verificar que el componente existe
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 \
  "ls -la /home/ubuntu/consentimientos_aws/frontend/src/components/billing/BillingCycleReminderBanner.tsx"
```

---

## 📊 Métricas a Monitorear

### KPIs:

1. **Tasa de pago a tiempo:**
   - Antes: X%
   - Después: Y% (esperado: +10-15%)

2. **Tasa de suspensión:**
   - Antes: X%
   - Después: Y% (esperado: -20-30%)

3. **Tiempo promedio de pago:**
   - Antes: X días después de generada
   - Después: Y días (esperado: -3-5 días)

4. **Consultas de soporte sobre pagos:**
   - Antes: X consultas/mes
   - Después: Y consultas/mes (esperado: -30-40%)

---

## ✅ Conclusión

El banner de pre-aviso de fecha de corte es una mejora significativa en la experiencia del usuario que:

1. ✅ Informa con anticipación sobre la próxima facturación
2. ✅ Ayuda a los clientes a prepararse financieramente
3. ✅ Reduce suspensiones por falta de pago
4. ✅ Mejora la satisfacción del cliente
5. ✅ Reduce la carga de soporte

**Estado:** ✅ IMPLEMENTADO Y DESPLEGADO  
**Versión:** v85.0.0  
**Fecha:** 2026-04-01

