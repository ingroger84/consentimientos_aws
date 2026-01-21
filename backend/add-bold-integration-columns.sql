-- Migración: Agregar columnas para integración con Bold
-- Fecha: 20 de Enero de 2026

-- Agregar columnas a la tabla invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_payment_link VARCHAR(500);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_transaction_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bold_payment_reference VARCHAR(100);

-- Agregar columnas a la tabla payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bold_payment_data JSONB;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_bold_reference ON invoices(bold_payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_bold_transaction ON payments(bold_transaction_id);

-- Comentarios
COMMENT ON COLUMN invoices.bold_payment_link IS 'URL del link de pago generado en Bold';
COMMENT ON COLUMN invoices.bold_transaction_id IS 'ID de la transacción en Bold';
COMMENT ON COLUMN invoices.bold_payment_reference IS 'Referencia única del pago en Bold';
COMMENT ON COLUMN payments.bold_transaction_id IS 'ID de la transacción en Bold';
COMMENT ON COLUMN payments.bold_payment_method IS 'Método de pago usado en Bold (card, pse, nequi, etc)';
COMMENT ON COLUMN payments.bold_payment_data IS 'Datos completos del webhook de Bold';

SELECT 'Migración completada exitosamente' AS status;
