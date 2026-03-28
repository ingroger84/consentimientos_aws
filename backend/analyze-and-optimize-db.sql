-- ============================================
-- ANÁLISIS Y OPTIMIZACIÓN DE BASE DE DATOS
-- Sistema de Consentimientos Digitales
-- Versión: 77.0.0
-- Fecha: 2026-03-28
-- ============================================

-- ============================================
-- PARTE 1: ANÁLISIS DE ÍNDICES EXISTENTES
-- ============================================

-- Ver todos los índices actuales
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- PARTE 2: ANÁLISIS DE TABLAS SIN ÍNDICES
-- ============================================

-- Tablas sin índices en columnas de búsqueda frecuente
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename)::regclass)) as size
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(quote_ident(t.tablename)::regclass) DESC;

-- ============================================
-- PARTE 3: CREAR ÍNDICES FALTANTES
-- ============================================

-- TENANTS: Búsquedas por slug y status
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at ON tenants(trial_ends_at) WHERE status = 'TRIAL';
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_ends_at ON tenants(subscription_ends_at) WHERE status = 'ACTIVE';

-- USERS: Búsquedas por email y tenant
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id) WHERE deleted_at IS NULL;

-- USER_SESSIONS: Búsquedas por token y usuario activo
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE is_active = true;

-- INVOICES: Búsquedas por tenant, status y fechas
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'overdue');
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_bold_order_id ON invoices(bold_order_id) WHERE bold_order_id IS NOT NULL;

-- PAYMENTS: Búsquedas por invoice, tenant y status
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_bold_order_id ON payments(bold_order_id) WHERE bold_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- MEDICAL_RECORDS: Búsquedas por tenant, client, status
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_client_id ON medical_records(client_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_status ON medical_records(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_medical_records_record_number ON medical_records(record_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);

-- MEDICAL_RECORD_CONSENTS: Búsquedas por medical_record
CREATE INDEX IF NOT EXISTS idx_mr_consents_medical_record_id ON medical_record_consents(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_mr_consents_template_id ON medical_record_consents(template_id);
CREATE INDEX IF NOT EXISTS idx_mr_consents_signed_at ON medical_record_consents(signed_at);

-- CONSENTS: Búsquedas por tenant, client, template
CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_client_id ON consents(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_template_id ON consents(template_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_created_at ON consents(created_at) WHERE deleted_at IS NULL;

-- CONSENT_TEMPLATES: Búsquedas por tenant y activos
CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant_id ON consent_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_templates_is_active ON consent_templates(is_active) WHERE tenant_id IS NOT NULL;

-- MR_CONSENT_TEMPLATES: Búsquedas por tenant y activos
CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_tenant_id ON medical_record_consent_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_is_active ON medical_record_consent_templates(is_active);

-- BRANCHES: Búsquedas por tenant
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id) WHERE deleted_at IS NULL;

-- SERVICES: Búsquedas por tenant
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id) WHERE deleted_at IS NULL;

-- ADMISSIONS: Búsquedas por medical_record y status
CREATE INDEX IF NOT EXISTS idx_admissions_medical_record_id ON admissions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_admission_date ON admissions(admission_date);

-- WEBHOOK_LOGS: Búsquedas por invoice y status
CREATE INDEX IF NOT EXISTS idx_webhook_logs_invoice_id ON webhook_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- NOTIFICATIONS: Búsquedas por tenant y leídas
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- BILLING_HISTORY: Búsquedas por tenant y fecha
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON billing_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_billing_date ON billing_history(billing_date);

-- PAYMENT_REMINDERS: Búsquedas por invoice y enviados
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at ON payment_reminders(sent_at);

-- ============================================
-- PARTE 4: OPTIMIZACIONES ADICIONALES
-- ============================================

-- Índices compuestos para queries comunes
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_tenant_document ON clients(tenant_id, document_type, document_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_client ON medical_records(tenant_id, client_id);

-- ============================================
-- PARTE 5: ANÁLISIS DE RENDIMIENTO
-- ============================================

-- Ver tamaño de tablas e índices
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Ver índices no utilizados (ejecutar después de un tiempo en producción)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- PARTE 6: VACUUM Y ANALYZE
-- ============================================

-- Actualizar estadísticas de todas las tablas
ANALYZE;

-- Vacuum completo (ejecutar en horario de bajo tráfico)
-- VACUUM FULL ANALYZE;

-- ============================================
-- PARTE 7: VERIFICACIÓN FINAL
-- ============================================

-- Contar índices creados
SELECT 
    COUNT(*) as total_indexes,
    COUNT(DISTINCT tablename) as tables_with_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- Ver índices por tabla
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY index_count DESC;
