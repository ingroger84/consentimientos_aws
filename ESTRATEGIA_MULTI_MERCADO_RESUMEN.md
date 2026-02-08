# 🌎 Estrategia Multi-Mercado: Resumen Ejecutivo

**Fecha:** 2026-02-07  
**Versión:** 1.0

## 🎯 Pregunta Clave

¿Cómo vender el sistema en Colombia y Estados Unidos con precios diferentes?

## ✅ Respuesta Recomendada

**Una sola landing page con detección geográfica automática y precios dinámicos.**

---

## 💰 Precios Propuestos

### Colombia (Actual - COP)
- Gratuito: $0
- Básico: $89,900/mes
- Emprendedor: $119,900/mes ⭐ Popular
- Plus: $149,900/mes
- Empresarial: $189,900/mes

### Estados Unidos (Nuevo - USD)
- Free: $0
- Basic: $79/mes
- Professional: $119/mes ⭐ Popular
- Plus: $169/mes
- Enterprise: $249/mes

**Ratio:** 3.6x - 5.3x más en USA (ajustado al poder adquisitivo)

---

## 🏆 Por qué Landing Única

### Ventajas
✅ **Mantenimiento:** Un solo código base  
✅ **SEO:** Mejor posicionamiento global  
✅ **Escalabilidad:** Fácil agregar más países  
✅ **UX:** Experiencia fluida sin redirecciones  
✅ **Costo:** Menor inversión de desarrollo  

### Cómo Funciona
1. Usuario entra a la landing page
2. Sistema detecta su país (por IP o headers)
3. Muestra precios en su moneda local
4. Al registrarse, se asigna región y moneda
5. Facturación automática según región

---

## 🔄 ¿Qué pasa con los tenants actuales?

### ✅ NO SE AFECTAN

Los tenants existentes mantienen:
- Sus precios actuales en COP
- Sus límites de recursos
- Su ciclo de facturación
- Su plan asignado

**Solo los nuevos tenants** tendrán precios según su región.

---

## 🛠️ Implementación

### Fase 1: Backend (1-2 semanas)
- Configuración de precios por región
- Servicio de detección geográfica
- Actualizar modelo de Tenant
- Migración de base de datos

### Fase 2: Frontend (1 semana)
- Precios dinámicos en landing page
- Indicador de región y moneda
- Actualizar formulario de registro

### Fase 3: Pagos (2-3 semanas)
- Integrar Stripe para USA (USD)
- Mantener Bold para Colombia (COP)
- Lógica de selección automática

### Fase 4: Testing (1 semana)
- Testing con VPN
- Verificación de precios
- Testing de facturación

**Total:** 5-7 semanas

---

## 💡 Alternativa: Dos Landing Pages

### Opción B (No Recomendada)
- `archivoenlinea.com` → Colombia
- `archivoenlinea.com/us` → USA

**Desventajas:**
- ❌ Doble mantenimiento
- ❌ Contenido duplicado (SEO)
- ❌ Difícil escalar a más países
- ❌ Mayor costo

---

## 📊 Proyección de Ingresos

### Año 1 (Conservador)
- **Colombia:** 50 tenants → ~$18,000 USD/año
- **USA:** 20 tenants → ~$28,560 USD/año
- **Total:** ~$46,560 USD/año

### Año 2 (Optimista)
- **Colombia:** 150 tenants → ~$58,500 USD/año
- **USA:** 80 tenants → ~$144,000 USD/año
- **Total:** ~$202,500 USD/año

---

## 🎯 Recomendación Final

**Implementar landing única con detección geográfica.**

**Beneficios:**
1. Tenants actuales no se afectan
2. Precios competitivos en USA ($70-150 USD)
3. Fácil expansión a otros países
4. Menor costo de mantenimiento
5. Mejor experiencia de usuario

**Próximos Pasos:**
1. ✅ Aprobar estrategia de precios USA
2. ✅ Iniciar desarrollo (5-7 semanas)
3. ✅ Integrar Stripe
4. ✅ Testing con usuarios piloto USA
5. ✅ Lanzamiento gradual

---

**Documentación Completa:**
- `doc/98-estrategia-multi-mercado/ESTRATEGIA_PRECIOS_MULTI_MERCADO.md`
- `doc/98-estrategia-multi-mercado/IMPLEMENTACION_TECNICA.md`
