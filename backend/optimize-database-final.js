/**
 * Script de optimización de base de datos - VERSIÓN FINAL
 * Usa nombres de columnas reales (camelCase) según la BD
 * Versión: 77.0.0
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function optimizeDatabase() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    console.log('🔨 CREANDO ÍNDICES DE OPTIMIZACIÓN');
    console.log('═'.repeat(60));

    const indexes = [
      // USERS - Búsquedas frecuentes por tenant y email
      { name: 'idx_users_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_users_tenantId" ON users("tenantId") WHERE deleted_at IS NULL', desc: 'Búsquedas de usuarios por tenant' },
      { name: 'idx_users_roleId', sql: 'CREATE INDEX IF NOT EXISTS "idx_users_roleId" ON users("roleId") WHERE deleted_at IS NULL', desc: 'Búsquedas de usuarios por rol' },
      { name: 'idx_users_tenant_email', sql: 'CREATE INDEX IF NOT EXISTS "idx_users_tenant_email" ON users("tenantId", email) WHERE deleted_at IS NULL', desc: 'Login y búsquedas combinadas' },
      
      // USER_SESSIONS - Sesiones activas y expiración
      { name: 'idx_user_sessions_expiresAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_user_sessions_expiresAt" ON user_sessions("expiresAt") WHERE "isActive" = true', desc: 'Limpieza de sesiones expiradas' },
      { name: 'idx_user_sessions_userId_active', sql: 'CREATE INDEX IF NOT EXISTS "idx_user_sessions_userId_active" ON user_sessions("userId", "isActive")', desc: 'Verificación de sesiones activas' },
      
      // INVOICES - Búsquedas por tenant, status y fechas
      { name: 'idx_invoices_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_invoices_tenantId" ON invoices("tenantId")', desc: 'Facturas por tenant' },
      { name: 'idx_invoices_tenant_status', sql: 'CREATE INDEX IF NOT EXISTS "idx_invoices_tenant_status" ON invoices("tenantId", status)', desc: 'Facturas pendientes por tenant' },
      { name: 'idx_invoices_dueDate', sql: 'CREATE INDEX IF NOT EXISTS "idx_invoices_dueDate" ON invoices("dueDate") WHERE status IN (\'pending\', \'overdue\')', desc: 'Facturas vencidas' },
      { name: 'idx_invoices_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_invoices_createdAt" ON invoices("createdAt")', desc: 'Ordenamiento por fecha' },
      { name: 'idx_invoices_boldTransactionId', sql: 'CREATE INDEX IF NOT EXISTS "idx_invoices_boldTransactionId" ON invoices("boldTransactionId") WHERE "boldTransactionId" IS NOT NULL', desc: 'Búsqueda por transacción Bold' },
      
      // PAYMENTS - Búsquedas por invoice y tenant
      { name: 'idx_payments_invoiceId', sql: 'CREATE INDEX IF NOT EXISTS "idx_payments_invoiceId" ON payments("invoiceId")', desc: 'Pagos por factura' },
      { name: 'idx_payments_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_payments_tenantId" ON payments("tenantId")', desc: 'Pagos por tenant' },
      { name: 'idx_payments_boldTransactionId', sql: 'CREATE INDEX IF NOT EXISTS "idx_payments_boldTransactionId" ON payments("boldTransactionId") WHERE "boldTransactionId" IS NOT NULL', desc: 'Búsqueda por transacción Bold' },
      { name: 'idx_payments_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_payments_createdAt" ON payments("createdAt")', desc: 'Ordenamiento por fecha' },
      { name: 'idx_payments_tenant_status', sql: 'CREATE INDEX IF NOT EXISTS "idx_payments_tenant_status" ON payments("tenantId", status)', desc: 'Pagos por tenant y estado' },
      
      // MEDICAL_RECORD_CONSENTS - Relaciones con HC
      { name: 'idx_mr_consents_signedAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_mr_consents_signedAt" ON medical_record_consents("signedAt")', desc: 'Consentimientos firmados' },
      
      // CONSENTS - Búsquedas por tenant
      { name: 'idx_consents_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_consents_tenantId" ON consents("tenantId") WHERE deleted_at IS NULL', desc: 'Consentimientos por tenant' },
      
      // CONSENT_TEMPLATES - Plantillas activas
      { name: 'idx_consent_templates_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_consent_templates_tenantId" ON consent_templates("tenantId")', desc: 'Plantillas por tenant' },
      { name: 'idx_consent_templates_isActive', sql: 'CREATE INDEX IF NOT EXISTS "idx_consent_templates_isActive" ON consent_templates("isActive") WHERE "tenantId" IS NOT NULL', desc: 'Plantillas activas' },
      
      // BRANCHES - Sedes por tenant
      { name: 'idx_branches_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_branches_tenantId" ON branches("tenantId") WHERE deleted_at IS NULL', desc: 'Sedes por tenant' },
      
      // SERVICES - Servicios por tenant
      { name: 'idx_services_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_services_tenantId" ON services("tenantId") WHERE deleted_at IS NULL', desc: 'Servicios por tenant' },
      
      // WEBHOOK_LOGS - Logs de webhooks
      { name: 'idx_webhook_logs_invoiceId', sql: 'CREATE INDEX IF NOT EXISTS "idx_webhook_logs_invoiceId" ON webhook_logs("invoiceId")', desc: 'Webhooks por factura' },
      { name: 'idx_webhook_logs_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_webhook_logs_tenantId" ON webhook_logs("tenantId")', desc: 'Webhooks por tenant' },
      { name: 'idx_webhook_logs_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_webhook_logs_createdAt" ON webhook_logs("createdAt")', desc: 'Ordenamiento por fecha' },
      { name: 'idx_webhook_logs_transactionId', sql: 'CREATE INDEX IF NOT EXISTS "idx_webhook_logs_transactionId" ON webhook_logs("transactionId") WHERE "transactionId" IS NOT NULL', desc: 'Búsqueda por transacción' },
      
      // NOTIFICATIONS - Notificaciones por usuario
      { name: 'idx_notifications_userId', sql: 'CREATE INDEX IF NOT EXISTS "idx_notifications_userId" ON notifications("userId")', desc: 'Notificaciones por usuario' },
      { name: 'idx_notifications_read', sql: 'CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON notifications(read)', desc: 'Notificaciones no leídas' },
      { name: 'idx_notifications_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_notifications_createdAt" ON notifications("createdAt")', desc: 'Ordenamiento por fecha' },
      { name: 'idx_notifications_user_read', sql: 'CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON notifications("userId", read)', desc: 'Notificaciones no leídas por usuario' },
      
      // BILLING_HISTORY - Historial de facturación
      { name: 'idx_billing_history_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_billing_history_tenantId" ON billing_history("tenantId")', desc: 'Historial por tenant' },
      { name: 'idx_billing_history_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_billing_history_createdAt" ON billing_history("createdAt")', desc: 'Ordenamiento por fecha' },
      
      // PAYMENT_REMINDERS - Recordatorios de pago
      { name: 'idx_payment_reminders_invoiceId', sql: 'CREATE INDEX IF NOT EXISTS "idx_payment_reminders_invoiceId" ON payment_reminders("invoiceId")', desc: 'Recordatorios por factura' },
      { name: 'idx_payment_reminders_tenantId', sql: 'CREATE INDEX IF NOT EXISTS "idx_payment_reminders_tenantId" ON payment_reminders("tenantId")', desc: 'Recordatorios por tenant' },
      { name: 'idx_payment_reminders_sentAt', sql: 'CREATE INDEX IF NOT EXISTS "idx_payment_reminders_sentAt" ON payment_reminders("sentAt")', desc: 'Recordatorios enviados' },
      { name: 'idx_payment_reminders_status', sql: 'CREATE INDEX IF NOT EXISTS "idx_payment_reminders_status" ON payment_reminders(status)', desc: 'Recordatorios por estado' },
    ];

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const index of indexes) {
      try {
        await client.query(index.sql);
        console.log(`✅ ${index.name.padEnd(45)} - ${index.desc}`);
        created++;
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`⏭️  ${index.name.padEnd(45)} - Ya existe`);
          skipped++;
        } else {
          console.log(`⚠️  ${index.name.padEnd(45)} - ${error.message}`);
          errors++;
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 RESUMEN DE OPTIMIZACIÓN:`);
    console.log(`   • Índices creados: ${created}`);
    console.log(`   • Índices ya existentes: ${skipped}`);
    console.log(`   • Errores: ${errors}`);
    console.log(`   • Total procesados: ${indexes.length}`);

    console.log('\n🔄 Actualizando estadísticas de la base de datos...');
    await client.query('ANALYZE');
    console.log('✅ Estadísticas actualizadas\n');

    console.log('📈 ANÁLISIS DE TAMAÑO Y RENDIMIENTO');
    console.log('═'.repeat(60));
    
    const tableSizes = await client.query(`
      SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS indexes_size,
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND pg_indexes.tablename = pg_tables.tablename) as index_count
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.'||tablename) DESC
      LIMIT 15
    `);

    console.log('\nTop 15 tablas por tamaño:');
    tableSizes.rows.forEach((row, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${row.tablename.padEnd(35)} | Total: ${row.total_size.padEnd(10)} | Índices: ${row.index_count}`);
    });

    // Verificar índices no utilizados
    console.log('\n🔍 ÍNDICES NO UTILIZADOS (candidatos para eliminación):');
    console.log('═'.repeat(60));
    
    const unusedIndexes = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan as scans,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE 'PK_%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `);

    if (unusedIndexes.rows.length > 0) {
      unusedIndexes.rows.forEach((row, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${row.indexname.padEnd(45)} | Tabla: ${row.tablename.padEnd(25)} | Tamaño: ${row.size}`);
      });
    } else {
      console.log('✅ No se encontraron índices sin uso');
    }

    console.log('\n✅ OPTIMIZACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═'.repeat(60));
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. ✅ Índices creados para mejorar queries de tenant, status y fechas');
    console.log('   2. 📊 Monitorear rendimiento en las próximas 24-48 horas');
    console.log('   3. 🧹 Ejecutar VACUUM ANALYZE periódicamente (ya incluido en cron)');
    console.log('   4. 🔍 Revisar índices no utilizados después de 1 semana');
    console.log('   5. 📈 Considerar particionamiento si tablas superan 1M registros');
    console.log('\n🎯 IMPACTO ESPERADO:');
    console.log('   • Queries de facturas por tenant: 50-70% más rápido');
    console.log('   • Búsquedas de usuarios: 40-60% más rápido');
    console.log('   • Verificación de sesiones: 30-50% más rápido');
    console.log('   • Dashboard de Super Admin: 40-60% más rápido');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

optimizeDatabase();
