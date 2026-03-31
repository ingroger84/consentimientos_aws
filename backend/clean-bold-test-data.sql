-- Script SQL para limpiar datos de prueba de Bold
-- Ejecutar con: psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f clean-bold-test-data.sql

-- Mostrar conteo antes de limpiar
\echo '📊 Contando registros de prueba...'
\echo ''

SELECT 'payment_attempts: ' || COUNT(*) || ' registros' FROM payment_attempts;

SELECT 'invoices con links Bold: ' || COUNT(*) || ' registros' 
FROM invoices 
WHERE "boldPaymentLink" IS NOT NULL 
   OR "boldPaymentLinkId" IS NOT NULL 
   OR "boldPaymentReference" IS NOT NULL;

SELECT 'payments de Bold: ' || COUNT(*) || ' registros' 
FROM payments 
WHERE "paymentMethod" = 'bold' 
   OR "boldOrderId" IS NOT NULL;

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
  "boldPaymentLink" = NULL,
  "boldPaymentLinkId" = NULL,
  "boldPaymentReference" = NULL,
  "boldPaymentLinkStatus" = NULL,
  "paymentAttemptsCount" = 0,
  "lastPaymentAttemptAt" = NULL
WHERE 
  "boldPaymentLink" IS NOT NULL 
  OR "boldPaymentLinkId" IS NOT NULL 
  OR "boldPaymentReference" IS NOT NULL
  OR "boldPaymentLinkStatus" IS NOT NULL
  OR "paymentAttemptsCount" > 0;

-- 3. Eliminar pagos de Bold
\echo '3️⃣  Eliminando pagos de Bold (payments)...'
DELETE FROM payments 
WHERE "paymentMethod" = 'bold' 
   OR "boldOrderId" IS NOT NULL;

\echo ''
\echo '✅ Verificando limpieza...'
\echo ''

-- Verificar limpieza
SELECT 'payment_attempts: ' || COUNT(*) || ' registros (debe ser 0)' FROM payment_attempts;

SELECT 'invoices con datos Bold: ' || COUNT(*) || ' registros (debe ser 0)' 
FROM invoices 
WHERE "boldPaymentLink" IS NOT NULL 
   OR "boldPaymentLinkId" IS NOT NULL 
   OR "boldPaymentReference" IS NOT NULL
   OR "paymentAttemptsCount" > 0;

SELECT 'payments de Bold: ' || COUNT(*) || ' registros (debe ser 0)' 
FROM payments 
WHERE "paymentMethod" = 'bold' 
   OR "boldOrderId" IS NOT NULL;

\echo ''
\echo '🎉 Limpieza completada exitosamente!'
\echo '✅ Todos los datos de prueba de Bold han sido eliminados'
\echo '📝 Ahora puedes configurar las credenciales de producción de Bold'
\echo ''
