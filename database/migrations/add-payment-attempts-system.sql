-- =====================================================
-- MIGRACIÓN: Sistema de Intentos de Pago Bold
-- Versión: v80.0.0
-- Fecha: 2026-03-29
-- Descripción: Agregar tracking de intentos de pago y
--              regeneración automática de links Bold
-- =====================================================

-- 1. Agregar campos a la tabla invoices para tracking de links
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS bold_payment_link_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS payment_attempts_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMP;

-- Comentarios para documentación
COMMENT ON COLUMN invoices.bold_payment_link_status IS 'Estado del link de pago Bold: active, expired, failed, succeeded';
COMMENT ON COLUMN invoices.payment_attempts_count IS 'Número de intentos de pago realizados (máximo 6)';
COMMENT ON COLUMN invoices.last_payment_attempt_at IS 'Fecha y hora del último intento de pago';

-- 2. Crear tabla de intentos de pago
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL,
  bold_payment_link VARCHAR(500),
  bold_payment_reference VARCHAR(255),
  bold_payment_link_id VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- 'pending', 'failed', 'succeeded', 'expired'
  failure_reason TEXT,
  bold_response JSONB,
  attempted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_payment_attempts_invoice
    FOREIGN KEY (invoice_id) 
    REFERENCES invoices(id) 
    ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_payment_attempts_invoice_id ON payment_attempts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_attempted_at ON payment_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_bold_link_status ON invoices(bold_payment_link_status);

-- Comentarios para documentación
COMMENT ON TABLE payment_attempts IS 'Registro de todos los intentos de pago realizados por los usuarios';
COMMENT ON COLUMN payment_attempts.status IS 'Estado del intento: pending (esperando), failed (rechazado), succeeded (exitoso), expired (expirado)';
COMMENT ON COLUMN payment_attempts.failure_reason IS 'Razón del fallo si el pago fue rechazado';
COMMENT ON COLUMN payment_attempts.bold_response IS 'Respuesta completa de Bold para debugging';

-- 3. Actualizar facturas existentes con valores por defecto
UPDATE invoices 
SET 
  bold_payment_link_status = 'active',
  payment_attempts_count = 0
WHERE bold_payment_link_status IS NULL;

-- 4. Crear función para limpiar intentos antiguos (opcional, para mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_payment_attempts()
RETURNS void AS $$
BEGIN
  -- Eliminar intentos de más de 90 días
  DELETE FROM payment_attempts
  WHERE attempted_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices' 
  AND column_name IN ('bold_payment_link_status', 'payment_attempts_count', 'last_payment_attempt_at')
ORDER BY column_name;

-- Verificar que la tabla se creó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_attempts'
ORDER BY ordinal_position;

-- Contar facturas actualizadas
SELECT 
  COUNT(*) as total_invoices,
  COUNT(CASE WHEN bold_payment_link_status = 'active' THEN 1 END) as active_links,
  COUNT(CASE WHEN payment_attempts_count = 0 THEN 1 END) as zero_attempts
FROM invoices;

SELECT '✅ Migración completada exitosamente' as status;
