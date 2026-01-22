-- ============================================
-- OPTIMIZACION DE INDICES - BASE DE DATOS
-- Proyecto: DatAgree
-- Fecha: 2026-01-22
-- Version: 1.1.31
-- ============================================

-- Este script crea indices optimizados para mejorar el rendimiento
-- de las consultas mas frecuentes en el sistema

BEGIN;

-- ============================================
-- TABLA: users
-- ============================================
-- Indice para busquedas por email (login frecuente)
CREATE INDEX IF NOT EXISTS idx_users_email_active 
ON users(email) WHERE "deletedAt" IS NULL;

-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_users_tenant_active 
ON users("tenantId") WHERE "deletedAt" IS NULL;

-- Indice compuesto para busquedas por tenant y rol
CREATE INDEX IF NOT EXISTS idx_users_tenant_role 
ON users("tenantId", "roleId") WHERE "deletedAt" IS NULL;

-- Indice para ordenamiento por fecha de creacion
CREATE INDEX IF NOT EXISTS idx_users_created_desc 
ON users("createdAt" DESC);

-- ============================================
-- TABLA: tenants
-- ============================================
-- Indice para busquedas por slug (acceso por subdominio)
CREATE INDEX IF NOT EXISTS idx_tenants_slug_active 
ON tenants(slug) WHERE "deletedAt" IS NULL;

-- Indice para busquedas por estado
CREATE INDEX IF NOT EXISTS idx_tenants_status 
ON tenants(status) WHERE "deletedAt" IS NULL;

-- Indice para busquedas por plan
CREATE INDEX IF NOT EXISTS idx_tenants_plan 
ON tenants(plan) WHERE "deletedAt" IS NULL;

-- Indice para tenants en trial proximo a expirar
CREATE INDEX IF NOT EXISTS idx_tenants_trial_expiring 
ON tenants("trialEndsAt") 
WHERE status = 'trial' AND "deletedAt" IS NULL;

-- Indice compuesto para busquedas por plan y estado
CREATE INDEX IF NOT EXISTS idx_tenants_plan_status 
ON tenants(plan, status) WHERE "deletedAt" IS NULL;

-- ============================================
-- TABLA: consents
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_consents_tenant_active 
ON consents("tenantId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por cliente (email o ID)
CREATE INDEX IF NOT EXISTS idx_consents_client_email 
ON consents("clientEmail") WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_consents_client_id 
ON consents("clientId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por servicio
CREATE INDEX IF NOT EXISTS idx_consents_service 
ON consents("serviceId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por sede
CREATE INDEX IF NOT EXISTS idx_consents_branch 
ON consents("branchId") WHERE "deletedAt" IS NULL;

-- Indice para ordenamiento por fecha de firma
CREATE INDEX IF NOT EXISTS idx_consents_signed_desc 
ON consents("signedAt" DESC NULLS LAST);

-- Indice compuesto para dashboard (tenant + fecha)
CREATE INDEX IF NOT EXISTS idx_consents_tenant_created 
ON consents("tenantId", "createdAt" DESC) 
WHERE "deletedAt" IS NULL;

-- Indice para busquedas de texto completo en nombre de cliente
CREATE INDEX IF NOT EXISTS idx_consents_client_name_trgm 
ON consents USING gin("clientName" gin_trgm_ops);

-- ============================================
-- TABLA: invoices
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_invoices_tenant 
ON invoices("tenantId");

-- Indice para busquedas por estado
CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(status);

-- Indice para busquedas por numero de factura
CREATE INDEX IF NOT EXISTS idx_invoices_number 
ON invoices("invoiceNumber");

-- Indice para facturas vencidas
CREATE INDEX IF NOT EXISTS idx_invoices_overdue 
ON invoices("dueDate") 
WHERE status IN ('pending', 'overdue');

-- Indice compuesto para dashboard de facturacion
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status_date 
ON invoices("tenantId", status, "createdAt" DESC);

-- ============================================
-- TABLA: payments
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_payments_tenant 
ON payments("tenantId");

-- Indice para busquedas por factura
CREATE INDEX IF NOT EXISTS idx_payments_invoice 
ON payments("invoiceId");

-- Indice para busquedas por estado
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Indice para busquedas por referencia externa
CREATE INDEX IF NOT EXISTS idx_payments_external_ref 
ON payments("externalReference");

-- Indice compuesto para historial de pagos
CREATE INDEX IF NOT EXISTS idx_payments_tenant_date 
ON payments("tenantId", "createdAt" DESC);

-- ============================================
-- TABLA: notifications
-- ============================================
-- Indice para notificaciones no leidas del Super Admin
CREATE INDEX IF NOT EXISTS idx_notifications_superadmin_unread 
ON notifications("createdAt" DESC) 
WHERE "userId" IS NULL AND read = false;

-- Indice para notificaciones por usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications("userId", "createdAt" DESC) 
WHERE read = false;

-- Indice para busquedas por tipo
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(type);

-- ============================================
-- TABLA: services
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_services_tenant_active 
ON services("tenantId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por nombre
CREATE INDEX IF NOT EXISTS idx_services_name_trgm 
ON services USING gin(name gin_trgm_ops);

-- ============================================
-- TABLA: branches
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_branches_tenant_active 
ON branches("tenantId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por nombre
CREATE INDEX IF NOT EXISTS idx_branches_name_trgm 
ON branches USING gin(name gin_trgm_ops);

-- ============================================
-- TABLA: questions
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_questions_tenant_active 
ON questions("tenantId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por tipo
CREATE INDEX IF NOT EXISTS idx_questions_type 
ON questions(type) WHERE "deletedAt" IS NULL;

-- ============================================
-- TABLA: answers
-- ============================================
-- Indice para busquedas por consentimiento
CREATE INDEX IF NOT EXISTS idx_answers_consent 
ON answers("consentId") WHERE "deletedAt" IS NULL;

-- Indice para busquedas por pregunta
CREATE INDEX IF NOT EXISTS idx_answers_question 
ON answers("questionId") WHERE "deletedAt" IS NULL;

-- ============================================
-- TABLA: billing_history
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant 
ON billing_history("tenantId");

-- Indice para busquedas por tipo de evento
CREATE INDEX IF NOT EXISTS idx_billing_history_event 
ON billing_history("eventType");

-- Indice compuesto para historial
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_date 
ON billing_history("tenantId", "createdAt" DESC);

-- ============================================
-- TABLA: payment_reminders
-- ============================================
-- Indice para busquedas por factura
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice 
ON payment_reminders("invoiceId");

-- Indice para recordatorios pendientes
CREATE INDEX IF NOT EXISTS idx_payment_reminders_pending 
ON payment_reminders("scheduledFor") 
WHERE sent = false;

-- ============================================
-- TABLA: app_settings
-- ============================================
-- Indice para busquedas por tenant y clave
CREATE INDEX IF NOT EXISTS idx_app_settings_tenant_key 
ON app_settings("tenantId", key);

-- Indice para settings del Super Admin
CREATE INDEX IF NOT EXISTS idx_app_settings_superadmin 
ON app_settings(key) WHERE "tenantId" IS NULL;

-- ============================================
-- TABLA: tax_configs
-- ============================================
-- Indice para busquedas por tenant
CREATE INDEX IF NOT EXISTS idx_tax_configs_tenant 
ON tax_configs("tenantId");

-- Indice para configuracion activa
CREATE INDEX IF NOT EXISTS idx_tax_configs_active 
ON tax_configs("tenantId") WHERE "isActive" = true;

-- ============================================
-- HABILITAR EXTENSION pg_trgm (si no esta habilitada)
-- ============================================
-- Esta extension permite busquedas de texto mas eficientes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ESTADISTICAS Y VACUUM
-- ============================================
-- Actualizar estadisticas para el optimizador de consultas
ANALYZE users;
ANALYZE tenants;
ANALYZE consents;
ANALYZE invoices;
ANALYZE payments;
ANALYZE notifications;
ANALYZE services;
ANALYZE branches;
ANALYZE questions;
ANALYZE answers;
ANALYZE billing_history;
ANALYZE payment_reminders;
ANALYZE app_settings;
ANALYZE tax_configs;

COMMIT;

-- ============================================
-- VERIFICACION DE INDICES
-- ============================================
-- Ejecuta esta consulta para ver todos los indices creados:
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- ============================================
-- MANTENIMIENTO RECOMENDADO
-- ============================================
-- Ejecutar periodicamente (semanal o mensual):
-- VACUUM ANALYZE;
-- REINDEX DATABASE consentimientos;
