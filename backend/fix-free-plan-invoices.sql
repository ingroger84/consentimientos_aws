-- Script para verificar y eliminar facturas generadas incorrectamente para planes gratuitos
-- Fecha: 2026-01-23

-- 1. VERIFICAR facturas de tenants con plan gratuito
SELECT 
    i.id as invoice_id,
    i.invoice_number,
    i.created_at,
    i.due_date,
    i.total,
    i.status,
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug,
    t.plan,
    t.status as tenant_status,
    t.trial_ends_at
FROM invoices i
INNER JOIN tenants t ON i.tenant_id = t.id
WHERE t.plan = 'free'
ORDER BY i.created_at DESC;

-- 2. VERIFICAR facturas generadas hoy para planes gratuitos
SELECT 
    i.id as invoice_id,
    i.invoice_number,
    i.created_at,
    i.due_date,
    i.total,
    i.status,
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug,
    t.plan,
    t.status as tenant_status,
    t.trial_ends_at
FROM invoices i
INNER JOIN tenants t ON i.tenant_id = t.id
WHERE t.plan = 'free'
  AND DATE(i.created_at) = CURRENT_DATE
ORDER BY i.created_at DESC;

-- 3. ELIMINAR facturas de planes gratuitos generadas hoy (EJECUTAR SOLO SI ES NECESARIO)
-- DESCOMENTAR PARA EJECUTAR:
-- DELETE FROM invoices
-- WHERE id IN (
--     SELECT i.id
--     FROM invoices i
--     INNER JOIN tenants t ON i.tenant_id = t.id
--     WHERE t.plan = 'free'
--       AND DATE(i.created_at) = CURRENT_DATE
-- );

-- 4. VERIFICAR tenants con plan gratuito y su estado
SELECT 
    id,
    name,
    slug,
    plan,
    status,
    billing_day,
    trial_ends_at,
    created_at,
    CASE 
        WHEN trial_ends_at > NOW() THEN 'En período de prueba'
        WHEN trial_ends_at <= NOW() THEN 'Trial expirado'
        ELSE 'Sin trial'
    END as trial_status
FROM tenants
WHERE plan = 'free'
ORDER BY created_at DESC;

-- 5. CONTAR facturas por plan
SELECT 
    t.plan,
    COUNT(i.id) as total_invoices,
    COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_invoices,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_invoices,
    COUNT(CASE WHEN DATE(i.created_at) = CURRENT_DATE THEN 1 END) as invoices_today
FROM tenants t
LEFT JOIN invoices i ON t.id = i.tenant_id
GROUP BY t.plan
ORDER BY t.plan;
