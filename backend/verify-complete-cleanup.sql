-- Verificación completa de limpieza del sistema de facturación

-- Resumen general
SELECT 
  'RESUMEN COMPLETO' as info,
  (SELECT COUNT(*) FROM invoices) as facturas,
  (SELECT COUNT(*) FROM payments) as pagos,
  (SELECT COUNT(*) FROM payment_attempts) as intentos_pago,
  (SELECT COUNT(*) FROM payment_reminders) as recordatorios,
  (SELECT COUNT(*) FROM billing_history) as historial_actividad;

-- Verificar cada tabla individualmente
SELECT 'FACTURAS' as tabla, COUNT(*) as registros FROM invoices
UNION ALL
SELECT 'PAGOS' as tabla, COUNT(*) as registros FROM payments
UNION ALL
SELECT 'INTENTOS DE PAGO' as tabla, COUNT(*) as registros FROM payment_attempts
UNION ALL
SELECT 'RECORDATORIOS' as tabla, COUNT(*) as registros FROM payment_reminders
UNION ALL
SELECT 'HISTORIAL ACTIVIDAD' as tabla, COUNT(*) as registros FROM billing_history;
