-- =====================================================
-- MIGRACIÓN: Índices de Performance para Dashboard
-- Versión: v91.3
-- Fecha: 2026-04-22
-- Descripción: Agregar índices para optimizar consultas
--              del dashboard del Super Admin
-- =====================================================

-- Índices para tabla tenants
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status_plan ON tenants(status, plan) WHERE deleted_at IS NULL;

-- Índices para tabla medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_status ON medical_records(tenant_id, status);

-- Índices para tabla clients
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_created ON clients(tenant_id, created_at);

-- Índices para tabla consents
CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_created_at ON consents(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_tenant_created ON consents(tenant_id, created_at) WHERE deleted_at IS NULL;

-- Índices para tabla users
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Índices para tabla branches
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id) WHERE deleted_at IS NULL;

-- Índices para tabla services
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id) WHERE deleted_at IS NULL;

-- Índices para tabla consent_templates
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates(is_active);

-- Índices para tabla mr_consent_templates
CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_active ON mr_consent_templates(is_active);

-- Índices para tabla invoices (para getDashboardStats)
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, created_at);

-- Analizar tablas para actualizar estadísticas del query planner
ANALYZE tenants;
ANALYZE medical_records;
ANALYZE clients;
ANALYZE consents;
ANALYZE users;
ANALYZE branches;
ANALYZE services;
ANALYZE consent_templates;
ANALYZE mr_consent_templates;
ANALYZE invoices;

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;