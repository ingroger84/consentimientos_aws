-- Verificar que la base de datos está completamente limpia

-- 1. Facturas
SELECT 
  'FACTURAS' as tabla,
  COUNT(*) as total_registros
FROM invoices;

-- 2. Pagos
SELECT 
  'PAGOS' as tabla,
  COUNT(*) as total_registros
FROM payments;

-- 3. Intentos de pago
SELECT 
  'PAYMENT_ATTEMPTS' as tabla,
  COUNT(*) as total_registros
FROM payment_attempts;

-- 4. Recordatorios de pago
SELECT 
  'PAYMENT_REMINDERS' as tabla,
  COUNT(*) as total_registros
FROM payment_reminders;

-- 5. Resumen general
SELECT 
  'RESUMEN GENERAL' as info,
  (SELECT COUNT(*) FROM invoices) as facturas,
  (SELECT COUNT(*) FROM payments) as pagos,
  (SELECT COUNT(*) FROM payment_attempts) as intentos,
  (SELECT COUNT(*) FROM payment_reminders) as recordatorios;
