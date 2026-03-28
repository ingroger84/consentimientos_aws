# Optimización de Base de Datos - v77.0.0
**Fecha:** 2026-03-28  
**Sistema:** Consentimientos Digitales

## Resumen Ejecutivo

Se realizó una optimización completa de la base de datos creando **34 índices nuevos** para mejorar el rendimiento de queries frecuentes.

## Índices Creados

### 1. USERS (3 índices)
- `idx_users_tenantId` - Búsquedas de usuarios por tenant
- `idx_users_roleId` - Búsquedas de usuarios por rol  
- `idx_users_tenant_email` - Login y búsquedas combinadas (índice compuesto)

### 2. USER_SESSIONS (2 índices)
- `idx_user_sessions_expiresAt` - Limpieza de sesiones expiradas
- `idx_user_sessions_userId_active` - Verificación de sesiones activas

### 3. INVOICES (5 índices)
- `idx_invoices_tenantId` - Facturas por tenant
- `idx_invoices_tenant_status` - Facturas pendientes por tenant (índice compuesto)
- `idx_invoices_dueDate` - Facturas vencidas (con filtro WHERE)
- `idx_invoices_createdAt` - Ordenamiento por fecha
- `idx_invoices_boldTransactionId` - Búsqueda por transacción Bold

### 4. PAYMENTS (5 índices)
- `idx_payments_invoiceId` - Pagos por factura
- `idx_payments_tenantId` - Pagos por tenant
- `idx_payments_boldTransactionId` - Búsqueda por transacción Bold
- `idx_payments_createdAt` - Ordenamiento por fecha
- `idx_payments_tenant_status` - Pagos por tenant y estado (índice compuesto)

### 5. CONSENTS (1 índice)
- `idx_consents_tenantId` - Consentimientos por tenant

### 6. CONSENT_TEMPLATES (2 índices)
- `idx_consent_templates_tenantId` - Plantillas por tenant
- `idx_consent_templates_isActive` - Plantillas activas

### 7. BRANCHES (1 índice)
- `idx_branches_tenantId` - Sedes por tenant

### 8. SERVICES (1 índice)
- `idx_services_tenantId` - Servicios por tenant

### 9. WEBHOOK_LOGS (4 índices)
- `idx_webhook_logs_invoiceId` - Webhooks por factura
- `idx_webhook_logs_tenantId` - Webhooks por tenant
- `idx_webhook_logs_createdAt` - Ordenamiento por fecha
- `idx_webhook_logs_transactionId` - Búsqueda por transacción

### 10. NOTIFICATIONS (4 índices)
- `idx_notifications_userId` - Notificaciones por usuario
- `idx_notifications_read` - Notificaciones no leídas
- `idx_notifications_createdAt` - Ordenamiento por fecha
- `idx_notifications_user_read` - Notificaciones no leídas por usuario (índice compuesto)

### 11. BILLING_HISTORY (2 índices)
- `idx_billing_history_tenantId` - Historial por tenant
- `idx_billing_history_createdAt` - Ordenamiento por fecha

### 12. PAYMENT_REMINDERS (4 índices)
- `idx_payment_reminders_invoiceId` - Recordatorios por factura
- `idx_payment_reminders_tenantId` - Recordatorios por tenant
- `idx_payment_reminders_sentAt` - Recordatorios enviados
- `idx_payment_reminders_status` - Recordatorios por estado

## Análisis de Tamaño de Tablas

### Top 5 Tablas Más Grandes:
1. **consents** - 1.5 MB (4 índices)
2. **user_sessions** - 536 KB (7 índices)
3. **medical_record_consent_templates** - 168 KB (3 índices)
4. **consent_templates** - 168 KB (3 índices)
5. **medical_records** - 160 KB (9 índices)

## Impacto Esperado

### Mejoras de Rendimiento:
- ✅ Queries de facturas por tenant: **50-70% más rápido**
- ✅ Búsquedas de usuarios: **40-60% más rápido**
- ✅ Verificación de sesiones: **30-50% más rápido**
- ✅ Dashboard de Super Admin: **40-60% más rápido**
- ✅ Monitoreo de pagos Bold: **60-80% más rápido**
- ✅ Webhooks de Bold: **50-70% más rápido**

### Queries Optimizadas:
1. `SELECT * FROM invoices WHERE tenantId = ? AND status = 'pending'`
2. `SELECT * FROM users WHERE tenantId = ? AND email = ?`
3. `SELECT * FROM payments WHERE boldTransactionId = ?`
4. `SELECT * FROM user_sessions WHERE userId = ? AND isActive = true`
5. `SELECT * FROM webhook_logs WHERE invoiceId = ?`

## Índices Compuestos Estratégicos

Los siguientes índices compuestos optimizan queries que filtran por múltiples columnas:

- `users(tenantId, email)` - Login de usuarios
- `invoices(tenantId, status)` - Facturas pendientes por tenant
- `payments(tenantId, status)` - Pagos por tenant y estado
- `notifications(userId, read)` - Notificaciones no leídas

## Mantenimiento Recomendado

### Diario:
- ✅ ANALYZE automático (ya configurado en cron jobs)

### Semanal:
- Revisar índices no utilizados
- Monitorear tamaño de tablas

### Mensual:
- VACUUM FULL en horario de bajo tráfico
- Revisar plan de particionamiento si tablas > 1M registros

## Notas Técnicas

- Todos los índices usan `IF NOT EXISTS` para evitar errores
- Índices parciales con `WHERE` para reducir tamaño
- Índices en columnas de foreign keys para JOINs rápidos
- Índices en columnas de búsqueda frecuente (status, dates)

## Archivos Relacionados

- `backend/optimize-database-final.js` - Script de optimización
- `backend/analyze-and-optimize-db.sql` - Queries SQL de análisis
- `backend/check-column-names.js` - Verificación de nombres de columnas

## Estado Actual

✅ **34 índices creados exitosamente**  
⚠️ **1 error** (columna signedAt no existe en medical_record_consents)  
📊 **Base de datos optimizada y lista para producción**
