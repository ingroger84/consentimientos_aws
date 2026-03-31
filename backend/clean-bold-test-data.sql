-- Script SQL para limpiar datos de prueba de Bold
-- Ejecutar con: psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f clean-bold-test-data.sql

-- Mostrar conteo antes de limpiar
\echo '📊 Contando registros de prueba...'
\echo ''

SELECT 'payment_attempts: ' || COUNT(*) || ' registros' FROM payment_attempts;

SELECT 'invoices con links Bold: ' || COUNT(*) || ' registros' 
FROM invoices 
WHERE bold_payment_link IS NOT NULL 
   OR bold_payment_link_id IS NOT NULL 
   OR bold_payment_reference IS NOT NULL;

SELECT 'payments de Bold: ' || COUNT(*) || ' registros' 
FROM payments 
WHERE payment_method = 'bold' 
   OR bold_order_id IS NOT NULL;

SELECT 'webhook_logs de Bold: ' || COUNT(*) || ' registros' 
FROM webhook_logs 
WHERE source = 'bold';

\echo ''
\echo '🧹 Iniciando limpieza de datos de prueba...'
\echo ''

-- 1. Eliminar intentos de pago
\echo '1️⃣  Eliminando intentos de pago (payment_attempts)...'
DELETE FROM payment_attempts;

-- 2. Limpiar campos de Bold en facturas
\echo '2️⃣  Limpiando campos de Bold en facturas...'
UPDATE invoices 
SET 
  bold_payment_link = NULL,
  bold_payment_link_id = NULL,
  bold_payment_reference = NULL,
  bold_payment_link_status = NULL,
  payment_attempts_count = 0,
  last_payment_attempt_at = NULL
WHERE 
  bold_payment_link IS NOT NULL 
  OR bold_payment_link_id IS NOT NULL 
  OR bold_payment_reference IS NOT NULL
  OR bold_payment_link_status IS NOT NULL
  OR payment_attempts_count > 0;

-- 3. Eliminar pagos de Bold
\echo '3️⃣  Eliminando pagos de Bold (payments)...'
DELETE FROM payments 
WHERE payment_method = 'bold' 
   OR bold_order_id IS NOT NULL;

-- 4. Eliminar logs de webhooks de Bold
\echo '4️⃣  Eliminando logs de webhooks de Bold...'
DELETE FROM webhook_logs 
WHERE source = 'bold';

\echo ''
\echo '✅ Verificando limpieza...'
\echo ''

-- Verificar limpieza
SELECT 'payment_attempts: ' || COUNT(*) || ' registros (debe ser 0)' FROM payment_attempts;

SELECT 'invoices con datos Bold: ' || COUNT(*) || ' registros (debe ser 0)' 
FROM invoices 
WHERE bold_payment_link IS NOT NULL 
   OR bold_payment_link_id IS NOT NULL 
   OR bold_payment_reference IS NOT NULL
   OR payment_attempts_count > 0;

SELECT 'payments de Bold: ' || COUNT(*) || ' registros (debe ser 0)' 
FROM payments 
WHERE payment_method = 'bold' 
   OR bold_order_id IS NOT NULL;

SELECT 'webhook_logs de Bold: ' || COUNT(*) || ' registros (debe ser 0)' 
FROM webhook_logs 
WHERE source = 'bold';

\echo ''
\echo '🎉 Limpieza completada exitosamente!'
\echo '✅ Todos los datos de prueba de Bold han sido eliminados'
\echo '📝 Ahora puedes configurar las credenciales de producción de Bold'
\echo ''
