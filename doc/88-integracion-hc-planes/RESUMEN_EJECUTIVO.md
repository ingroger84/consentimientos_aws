# Resumen Ejecutivo - Planes Mejorados con HC

**Fecha:** 2026-01-27  
**Decisión requerida:** Aprobar nuevos límites de planes

---

## 🎯 PROPUESTA EN 1 MINUTO

**Problema:** Los planes actuales no incluyen límites para Historias Clínicas (HC), causando:
- ❌ Sin control de uso de HC
- ❌ Plan Gratuito y Básico iguales (50 CN)
- ❌ Almacenamiento insuficiente para HC con imágenes

**Solución:** Reestructurar planes con límites claros para HC + CN

---

## 📊 COMPARACIÓN RÁPIDA

### ANTES (Actual)

| Plan | Precio | CN | HC | Usuarios | Storage |
|------|--------|----|----|----------|---------|
| Gratuito | $0 | 50 | ❌ | 1 | 100 MB |
| Básico | $90K | 50 | ❌ | 1 | 100 MB |
| Emprendedor | $120K | 80 | ❌ | 3 | 200 MB |
| Plus | $150K | 100 | ❌ | 5 | 300 MB |
| Empresarial | $190K | 500 | ❌ | 11 | 600 MB |

### DESPUÉS (Propuesto)

| Plan | Precio | CN | HC | Usuarios | Storage |
|------|--------|----|----|----------|---------|
| Gratuito | $0 | 20 | ✅ 5 | 1 | 200 MB |
| Básico | $90K | 100 | ✅ 30 | 2 | 500 MB |
| Emprendedor ⭐ | $120K | 300 | ✅ 100 | 5 | 2 GB |
| Plus | $150K | 500 | ✅ 300 | 10 | 5 GB |
| Empresarial | $190K | ♾️ | ✅ ♾️ | ♾️ | 10 GB |

---

## 💡 CAMBIOS CLAVE

### 1. Plan Gratuito Mejorado
- **Antes:** 50 CN, sin HC
- **Después:** 20 CN + 5 HC
- **Impacto:** Permite probar HC realmente

### 2. Plan Básico Diferenciado
- **Antes:** Igual que Gratuito (50 CN)
- **Después:** 100 CN + 30 HC + 2 usuarios
- **Impacto:** Valor claro para pagar

### 3. Almacenamiento Realista
- **Antes:** 100-600 MB
- **Después:** 200 MB - 10 GB
- **Impacto:** HC con imágenes requieren más espacio

### 4. Límites de Plantillas
- **Antes:** Ilimitadas
- **Después:** 5-50 según plan
- **Impacto:** Control de uso y diferenciación

---

## 📈 IMPACTO FINANCIERO

### Escenario: 100 Clientes

**Distribución Esperada:**
```
20 clientes Gratuito    = $0
30 clientes Básico      = $2,697,000
35 clientes Emprendedor = $4,196,500
10 clientes Plus        = $1,499,000
5 clientes Empresarial  = $949,500
─────────────────────────────────────
Total MRR: $9,342,000
```

**Con Crecimiento (6 meses):**
- +40% conversión free → paid
- +30% nuevos registros
- **MRR Proyectado:** $15,000,000+

---

## ✅ VENTAJAS

### Comerciales
1. ✅ Plan gratuito atrae más usuarios
2. ✅ Diferenciación clara entre planes
3. ✅ Escalabilidad lógica
4. ✅ Mayor valor percibido (HC + CN)

### Técnicas
1. ✅ Límites claros por recurso
2. ✅ Validaciones en backend
3. ✅ Fácil de mantener
4. ✅ Actualización automática en landing

### UX
1. ✅ Transparencia en límites
2. ✅ Alertas de uso
3. ✅ Upgrade path claro
4. ✅ Dashboard con métricas

---

## 🔧 IMPLEMENTACIÓN

### Cambios Necesarios

**Backend:**
- Actualizar `plans.config.ts`
- Migración de BD (agregar columnas)
- Validaciones en servicios
- Testing

**Frontend:**
- Actualizar `PricingSection.tsx`
- Dashboard de uso de recursos
- Alertas de límites
- Testing

**Tiempo Estimado:** 1 semana

---

## 🚦 DECISIÓN REQUERIDA

### Opción A: Aprobar Propuesta ✅ RECOMENDADO
- Implementar nuevos límites
- Migrar clientes actuales
- Comunicar cambios

### Opción B: Ajustar y Aprobar
- Revisar límites específicos
- Ajustar precios
- Implementar versión ajustada

### Opción C: Mantener Actual
- No hacer cambios
- Perder oportunidad de diferenciación
- Sin control de uso de HC

---

## 📞 PRÓXIMO PASO

**Si apruebas:** Te preparo los archivos de implementación listos para aplicar en la tabla de planes del Super Admin.

**Si quieres ajustes:** Dime qué límites o precios quieres modificar y actualizo la propuesta.

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0  
**Decisión pendiente:** Usuario
