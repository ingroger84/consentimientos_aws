-- =====================================================
-- MIGRACIÓN: Índices de Performance para Dashboard
-- Versión: v93.0.0
-- Fecha: 23 Mayo 2026
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

-- Índices para tabla consents (usa "tenantId" en camelCase)
CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents("tenantId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_created_at ON consents(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_tenant_created ON consents("tenantId", created_at) WHERE deleted_at IS NULL;

-- Índices para tabla users (usa "tenantId" en camelCase)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users("tenantId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Índices para tabla branches (usa "tenantId" en camelCase)
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches("tenantId") WHERE deleted_at IS NULL;

-- Índices para tabla services (usa "tenantId" en camelCase)
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services("tenantId") WHERE deleted_at IS NULL;

-- Índices para tabla consent_templates (usa "isActive" en camelCase)
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates("isActive");
CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant_id ON consent_templates("tenantId");

-- Índices para tabla invoices (usa camelCase)
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices("createdAt");
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices("dueDate");
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, "createdAt");
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices("tenantId");

-- Analizar tablas para actualizar estadísticas del query planner
ANALYZE tenants;
ANALYZE medical_records;
ANALYZE clients;
ANALYZE consents;
ANALYZE users;
ANALYZE branches;
ANALYZE services;
ANALYZE consent_templates;
ANALYZE invoices;
