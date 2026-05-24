# Explicación: Fecha de Vencimiento Termales Espiritu Santo - v92.3.12

**Fecha actual:** Mayo 10, 2026  
**Tenant:** Termales Espiritu Santo (termaleses)

---

## 🎯 TU PREGUNTA

> "Si es 10 de mayo y la fecha de vencimiento es 10 de mayo, ¿por qué sigue dejando usar el tenant? ¿No debería estar suspendido?"

---

## ✅ RESPUESTA

El tenant **NO está vencido** porque la fecha de vencimiento es **11 de mayo**, no 10 de mayo.

### 📊 Estado Actual

```
🕐 FECHA ACTUAL: 10 de mayo de 2026, 12:39 PM (Colombia)

🏢 TENANT: Termales Espiritu Santo
   Estado: active ✅
   Plan: professional
   Día de facturación: 8

💰 FACTURA ACTUAL: INV-202605
   Estado: pending (no pagada)
   Monto: $119,900
   Fecha de vencimiento: 11 de mayo de 2026 ✅
   Vencida: NO ✅
```

---

## 📅 CÓMO FUNCIONA EL SISTEMA DE FACTURACIÓN

### 1. Generación de Factura

**Día de facturación:** 8 de cada mes

- **8 de mayo:** Se genera la factura INV-202605
- **Monto:** $119,900 (Plan Emprendedor mensual)
- **Estado inicial:** pending

### 2. Fecha de Vencimiento

**Fórmula:** Día de facturación + 3 días

- **Día de facturación:** 8 de mayo
- **Días de gracia:** 3 días
- **Fecha de vencimiento:** 11 de mayo ✅

### 3. Línea de Tiempo

```
8 mayo          9 mayo          10 mayo         11 mayo         12 mayo
  │               │               │               │               │
  │               │               │               │               │
  ▼               │               │               │               │
Factura           │               │               │               │
generada          │               │               │               │
                  │               │               │               │
                  ▼               │               │               │
                Banner            │               │               │
                azul              │               │               │
                (5 días)          │               │               │
                                  │               │               │
                                  ▼               │               │
                                HOY               │               │
                                (10 mayo)         │               │
                                                  │               │
                                                  ▼               │
                                                VENCE             │
                                                (11 mayo)         │
                                                                  │
                                                                  ▼
                                                                SUSPENSIÓN
                                                                (12 mayo)
```

---

## 🔔 SISTEMA DE NOTIFICACIONES

### Banner Azul (Pre-aviso)

**Se muestra:** 5 días ANTES del vencimiento

- **Fecha de vencimiento:** 11 de mayo
- **5 días antes:** 6 de mayo
- **Banner azul desde:** 6 de mayo ✅
- **Mensaje:** "Tu factura vence el 11 de mayo"

### Banner Rojo (Vencido)

**Se muestra:** DESPUÉS del vencimiento

- **Fecha de vencimiento:** 11 de mayo
- **Banner rojo desde:** 12 de mayo (día siguiente)
- **Mensaje:** "Tu factura está vencida"

### Suspensión Automática

**Se ejecuta:** DESPUÉS del vencimiento

- **Fecha de vencimiento:** 11 de mayo 23:59:59
- **Suspensión:** 12 de mayo (cron job diario)
- **Estado:** active → suspended

---

## 📊 ESTADO ACTUAL vs ESPERADO

### HOY (10 de mayo)

| Componente | Estado Actual | ¿Es Correcto? |
|------------|---------------|---------------|
| Tenant | active | ✅ SÍ |
| Factura | pending | ✅ SÍ |
| Fecha vencimiento | 11 de mayo | ✅ SÍ |
| Banner azul | Visible | ✅ SÍ |
| Banner rojo | NO visible | ✅ SÍ |
| Suspendido | NO | ✅ SÍ |

**Conclusión:** Todo está funcionando correctamente. El tenant NO debe estar suspendido porque la factura vence mañana (11 de mayo).

---

## 🔮 QUÉ PASARÁ MAÑANA (11 de mayo)

### Escenario 1: Si NO se paga la factura

**11 de mayo 23:59:59:**
- Factura sigue en estado `pending`
- Fecha de vencimiento se cumple

**12 de mayo 00:00:00 (cron job):**
- Sistema detecta factura vencida
- Cambia estado del tenant: `active` → `suspended`
- Banner rojo se muestra
- Usuarios NO pueden acceder al sistema

### Escenario 2: Si se paga la factura

**Cuando se pague:**
- Estado de factura: `pending` → `paid`
- Tenant sigue `active`
- Banner azul desaparece
- Sistema funciona normalmente

---

## 🎯 REGLAS DEL SISTEMA

### 1. Generación de Factura

```
Día de facturación = billing_day (8 de cada mes)
```

### 2. Fecha de Vencimiento

```
Fecha de vencimiento = Día de facturación + 3 días
Ejemplo: 8 de mayo + 3 días = 11 de mayo
```

### 3. Banner Azul (Pre-aviso)

```
Se muestra cuando:
- Fecha actual >= (Fecha de vencimiento - 5 días)
- Fecha actual < Fecha de vencimiento
- Factura NO está pagada
- Tenant NO está en trial
- Plan NO es gratuito

Ejemplo:
- Vencimiento: 11 de mayo
- Banner desde: 6 de mayo (11 - 5)
- Banner hasta: 10 de mayo (día antes del vencimiento)
```

### 4. Banner Rojo (Vencido)

```
Se muestra cuando:
- Fecha actual > Fecha de vencimiento
- Factura NO está pagada
- Tenant NO está en trial
- Plan NO es gratuito

Ejemplo:
- Vencimiento: 11 de mayo 23:59:59
- Banner desde: 12 de mayo 00:00:00
```

### 5. Suspensión Automática

```
Se ejecuta cuando:
- Fecha actual > Fecha de vencimiento
- Factura NO está pagada
- Cron job diario se ejecuta (generalmente a las 00:00)

Ejemplo:
- Vencimiento: 11 de mayo 23:59:59
- Suspensión: 12 de mayo (cron job)
```

---

## 📝 VERIFICACIÓN DETALLADA

### Factura Actual (INV-202605)

```
Número: INV-202605
Estado: pending (no pagada)
Monto: $119,900
Generada: 8 de mayo de 2026
Vence: 11 de mayo de 2026
Días restantes: 1 día
```

### Factura Anterior (INV-202604-7294)

```
Número: INV-202604-7294
Estado: paid (pagada) ✅
Monto: $119,900
Generada: ~8 de abril de 2026
Vencía: 14 de abril de 2026
Pagada: 31 de marzo de 2026 (anticipada)
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué la factura vence el 11 y no el 10?

Porque el sistema da **3 días de gracia** después del día de facturación:
- Día de facturación: 8
- Días de gracia: 3
- Vencimiento: 8 + 3 = 11

### ¿Por qué veo el banner azul si no está vencida?

El banner azul es un **pre-aviso** que se muestra 5 días antes del vencimiento para recordar al usuario que debe pagar.

### ¿Cuándo se suspenderá el tenant?

Si la factura NO se paga, el tenant se suspenderá el **12 de mayo** cuando el cron job diario detecte que hay una factura vencida.

### ¿Puedo seguir usando el sistema hoy?

**SÍ**, puedes seguir usando el sistema normalmente hasta que la factura venza (11 de mayo 23:59:59).

### ¿Qué pasa si pago hoy?

Si pagas hoy (10 de mayo):
- La factura cambia a estado `paid`
- El banner azul desaparece
- El tenant sigue activo
- No habrá suspensión

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual (10 de mayo)

- ✅ Tenant: **ACTIVO** (correcto)
- ✅ Factura: **PENDIENTE** (correcto)
- ✅ Vencimiento: **11 de mayo** (mañana)
- ✅ Banner azul: **VISIBLE** (correcto)
- ✅ Banner rojo: **NO VISIBLE** (correcto)
- ✅ Suspensión: **NO** (correcto)

### Próximos Pasos

**Si NO se paga:**
- **11 de mayo 23:59:59:** Factura vence
- **12 de mayo 00:00:00:** Tenant se suspende automáticamente
- **12 de mayo:** Banner rojo se muestra
- **12 de mayo:** Usuarios NO pueden acceder

**Si se paga:**
- Factura cambia a `paid`
- Banner azul desaparece
- Tenant sigue activo
- Todo funciona normalmente

---

## 📞 RECOMENDACIÓN

**Para Termales Espiritu Santo:**

Tienes hasta el **11 de mayo a las 11:59 PM** para pagar la factura y evitar la suspensión del servicio.

**Opciones de pago:**
1. Hacer clic en "Pagar Ahora" en el banner azul
2. Ir a la sección de Facturas en el dashboard
3. Usar el link de pago que se envió por correo

**Monto a pagar:** $119,900 (Plan Emprendedor - Mensual)

---

**Fecha de análisis:** Mayo 10, 2026  
**Estado del sistema:** ✅ Funcionando correctamente  
**Próxima acción:** Pagar factura antes del 11 de mayo

