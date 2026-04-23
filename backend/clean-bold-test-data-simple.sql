-- Script SQL simplificado para limpiar datos de prueba de Bold

\echo '🧹 Limpiando datos de prueba de Bold...'
\echo ''

-- 1. Eliminar todos los intentos de pago
\echo '1️⃣  Eliminando intentos de pago...'
DELETE FROM payment_attempts;

-- 2. Limpiar campos de Bold en facturas
\echo '2️⃣  Limpiando campos de Bold en facturas...'
UPDATE invoices 
SET 
  "boldPaymentLink" = NULL,
  "boldPaymentReference" = NULL,
  "boldPaymentLinkStatus" = NULL,
  "paymentAttemptsCount" = 0,
  "lastPaymentAttemptAt" = NULL
WHERE 
  "boldPaymentLink" IS NOT NULL 
  OR "boldPaymentReference" IS NOT NULL
  OR "boldPaymentLinkStatus" IS NOT NULL
  OR "paymentAttemptsCount" > 0;

\echo ''
\echo '✅ Verificando limpieza...'
\echo ''

SELECT 'payment_attempts: ' || COUNT(*) || ' registros' FROM payment_attempts;

SELECT 'invoices con datos Bold: ' || COUNT(*) || ' registros' 
FROM invoices 
WHERE "boldPaymentLink" IS NOT NULL 
   OR "boldPaymentReference" IS NOT NULL
   OR "paymentAttemptsCount" > 0;

\echo ''
\echo '🎉 Limpieza completada!'
\echo '✅ Datos de prueba de Bold eliminados'
\echo '📝 Listo para configurar credenciales de producción'
\echo ''
