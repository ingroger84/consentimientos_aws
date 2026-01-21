# 25. Sistema de Facturación Automatizada

Documentación del sistema completo de facturación automatizada con recordatorios y pagos.

## 📁 Archivos en esta carpeta

### Mejoras del Módulo
- **[MEJORA_MODULO_FACTURACION_20260120.md](./MEJORA_MODULO_FACTURACION_20260120.md)** - Mejoras generales del módulo de facturación
- **[OPTIMIZACION_DASHBOARD_FACTURACION_20260120.md](./OPTIMIZACION_DASHBOARD_FACTURACION_20260120.md)** - Optimización del dashboard

### Recordatorios de Pago
- **[RECORDATORIO_PAGO_MARQUESINA_20260120.md](./RECORDATORIO_PAGO_MARQUESINA_20260120.md)** - Implementación de marquesina de recordatorio
- **[VERIFICACION_MARQUESINA_PAGO_20260121.md](./VERIFICACION_MARQUESINA_PAGO_20260121.md)** - Verificación completa de la marquesina

### Cálculos y Fechas
- **[FECHAS_FACTURACION_TENANT_CARD_20260120.md](./FECHAS_FACTURACION_TENANT_CARD_20260120.md)** - Corrección de cálculo de fechas de facturación

### Sistema de Impuestos
- **[IMPLEMENTACION_IMPUESTOS_COMPLETADA.md](./IMPLEMENTACION_IMPUESTOS_COMPLETADA.md)** - Sistema completo de impuestos

### Documentación Adicional
Ver también:
- `doc/17-facturacion-manual/` - Facturación manual
- `doc/18-pago-facturas-tenant/` - Sistema de pagos
- `doc/14-impuestos/` - Configuración de impuestos

## 🎯 Resumen

Esta carpeta contiene la documentación del sistema completo de facturación automatizada, incluyendo:

- Generación automática de facturas mensuales
- Recordatorios de pago (5 días antes del vencimiento)
- Marquesina visual con botón "Pagar Ahora"
- Suspensión automática de tenants morosos
- Sistema de impuestos dinámico
- Dashboard optimizado de facturación

## ✨ Características Implementadas

### CRON Jobs Automatizados
- ✅ Generación de facturas mensuales (00:00 UTC)
- ✅ Envío de recordatorios (09:00 UTC)
- ✅ Actualización de facturas vencidas (01:00 UTC)
- ✅ Suspensión de morosos (23:00 UTC)
- ✅ Limpieza de recordatorios antiguos (Domingos 02:00 UTC)

### Marquesina de Recordatorio
- ✅ Alerta amarilla (5 días antes)
- ✅ Alerta roja (factura vencida)
- ✅ Botón "Pagar Ahora" integrado con Bold
- ✅ Animaciones y diseño atractivo

### Sistema de Impuestos
- ✅ IVA configurable por tenant
- ✅ Retención en la fuente
- ✅ Impuestos adicionales personalizables
- ✅ Exención de impuestos

---

**Última actualización:** 2026-01-21
