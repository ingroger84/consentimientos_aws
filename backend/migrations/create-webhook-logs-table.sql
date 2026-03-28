-- Crear tabla para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL DEFAULT 'bold',
  event VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL,
  headers JSONB,
  signature TEXT,
  "signatureValid" BOOLEAN DEFAULT FALSE,
  "invoiceId" UUID,
  "tenantId" UUID,
  "transactionId" VARCHAR(255),
  "errorMessage" TEXT,
  "processingResult" JSONB,
  "processingTimeMs" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_invoice_id ON webhook_logs("invoiceId");
CREATE INDEX IF NOT EXISTS idx_webhook_logs_tenant_id ON webhook_logs("tenantId");
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs("transactionId");
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs("createdAt");

-- Comentarios
COMMENT ON TABLE webhook_logs IS 'Registro completo de todos los webhooks recibidos para auditoría y debugging';
COMMENT ON COLUMN webhook_logs.provider IS 'Proveedor del webhook (bold, stripe, etc)';
COMMENT ON COLUMN webhook_logs.event IS 'Tipo de evento del webhook';
COMMENT ON COLUMN webhook_logs.status IS 'Estado del procesamiento (received, processed, failed, invalid_signature)';
COMMENT ON COLUMN webhook_logs.payload IS 'Payload completo del webhook en formato JSON';
COMMENT ON COLUMN webhook_logs.headers IS 'Headers HTTP del webhook';
COMMENT ON COLUMN webhook_logs.signature IS 'Firma del webhook para validación';
COMMENT ON COLUMN webhook_logs."signatureValid" IS 'Indica si la firma fue validada correctamente';
COMMENT ON COLUMN webhook_logs."processingTimeMs" IS 'Tiempo de procesamiento en milisegundos';
