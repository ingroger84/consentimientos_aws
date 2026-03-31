-- Limpiar TODOS los datos de prueba de Bold
-- Este script elimina todos los links de pago y reinicia el sistema

-- 1. Eliminar todos los payment_attempts
DELETE FROM payment_attempts;

-- 2. Limpiar campos Bold en TODAS las facturas
UPDATE invoices 
SET 
  "boldPaymentLink" = NULL,
  bold_payment_link_status = NULL,
  payment_attempts_count = 0,
  last_payment_attempt_at = NULL,
  "boldTransactionId" = NULL,
  "boldPaymentReference" = NULL
WHERE "boldPaymentLink" IS NOT NULL;

-- 3. Verificar resultados
SELECT 
  COUNT(*) as total_facturas_con_bold_link
FROM invoices 
WHERE "boldPaymentLink" IS NOT NULL;

SELECT 
  COUNT(*) as total_payment_attempts
FROM payment_attempts;

-- 4. Mostrar facturas actualizadas
SELECT 
  id,
  "invoiceNumber",
  total,
  status,
  "boldPaymentLink",
  payment_attempts_count
FROM invoices
ORDER BY "createdAt" DESC
LIMIT 10;
