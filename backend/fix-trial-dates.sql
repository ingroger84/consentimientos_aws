-- Corregir fechas de vencimiento para tenants con plan gratuito creados hoy
-- Plan gratuito debe tener 7 días de prueba, no 1 mes

-- Ver tenants afectados
SELECT 
    slug, 
    name, 
    plan, 
    status,
    created_at::date as created,
    plan_expires_at::date as expires_old,
    (created_at::date + interval '7 days')::date as expires_new,
    (plan_expires_at::date - created_at::date) as days_current
FROM tenants 
WHERE plan = 'free' 
  AND created_at::date >= CURRENT_DATE - interval '1 day'
ORDER BY created_at DESC;

-- Actualizar fechas de vencimiento
UPDATE tenants
SET plan_expires_at = created_at + interval '7 days',
    "trialEndsAt" = created_at + interval '7 days'
WHERE plan = 'free'
  AND created_at::date >= CURRENT_DATE - interval '1 day'
  AND (plan_expires_at::date - created_at::date) != 7;

-- Verificar cambios
SELECT 
    slug, 
    name, 
    plan, 
    status,
    created_at::date as created,
    plan_expires_at::date as expires,
    "trialEndsAt"::date as trial_ends,
    (plan_expires_at::date - created_at::date) as days_trial
FROM tenants 
WHERE plan = 'free' 
  AND created_at::date >= CURRENT_DATE - interval '1 day'
ORDER BY created_at DESC;
