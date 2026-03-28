/**
 * Script de optimización de base de datos (CORREGIDO)
 * Usa nombres de columnas en snake_case según la BD real
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
      // USERS (snake_case)
      { name: 'idx_users_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL" },
      { name: 'idx_users_role_id', sql: "CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id) WHERE deleted_at IS NULL" },
      { name: 'idx_users_tenant_email', sql: "CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email) WHERE deleted_at IS NULL" },
      
      // USER_SESSIONS (snake_case)
      { name: 'idx_user_sessions_expires_at', sql: "CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE is_active = true" },
      
      // INVOICES (snake_case)
      { name: 'idx_invoices_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id)" },
      { name: 'idx_invoices_tenant_status', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status)" },
      { name: 'idx_invoices_due_date', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'overdue')" },
      { name: 'idx_invoices_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at)" },
      { name: 'idx_invoices_bold_order_id', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_bold_order_id ON invoices(bold_order_id) WHERE bold_order_id IS NOT NULL" },
      
      // PAYMENTS (snake_case)
      { name: 'idx_payments_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)" },
      { name: 'idx_payments_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id)" },
      { name: 'idx_payments_bold_order_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_bold_order_id ON payments(bold_order_id) WHERE bold_order_id IS NOT NULL" },
      { name: 'idx_payments_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)" },
      
      // MEDICAL_RECORD_CONSENTS (snake_case)
      { name: 'idx_mr_consents_template_id', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consents_template_id ON medical_record_consents(template_id)" },
      { name: 'idx_mr_consents_signed_at', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consents_signed_at ON medical_record_consents(signed_at)" },
      
      // CONSENTS (snake_case)
      { name: 'idx_consents_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id) WHERE deleted_at IS NULL" },
      { name: 'idx_consents_template_id', sql: "CREATE INDEX IF NOT EXISTS idx_consents_template_id ON consents(template_id) WHERE deleted_at IS NULL" },
      
      // CONSENT_TEMPLATES (snake_case)
      { name: 'idx_consent_templates_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant_id ON consent_templates(tenant_id)" },
      { name: 'idx_consent_templates_is_active', sql: "CREATE INDEX IF NOT EXISTS idx_consent_templates_is_active ON consent_templates(is_active) WHERE tenant_id IS NOT NULL" },
      
      // BRANCHES (snake_case)
      { name: 'idx_branches_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id) WHERE deleted_at IS NULL" },
      
      // SERVICES (snake_case)
      { name: 'idx_services_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id) WHERE deleted_at IS NULL" },
      
      // WEBHOOK_LOGS (snake_case)
      { name: 'idx_webhook_logs_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_webhook_logs_invoice_id ON webhook_logs(invoice_id)" },
      { name: 'idx_webhook_logs_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at)" },
      
      // NOTIFICATIONS (snake_case)
      { name: 'idx_notifications_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id)" },
      { name: 'idx_notifications_is_read', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)" },
      { name: 'idx_notifications_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)" },
      
      // BILLING_HISTORY (snake_case)
      { name: 'idx_billing_history_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON billing_history(tenant_id)" },
      { name: 'idx_billing_history_billing_date', sql: "CREATE INDEX IF NOT EXISTS idx_billing_history_billing_date ON billing_history(billing_date)" },
      
      // PAYMENT_REMINDERS (snake_case)
      { name: 'idx_payment_reminders_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id)" },
      { name: 'idx_payment_reminders_sent_at', sql: "CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at ON payment_reminders(sent_at)" },
    ];

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const index of indexes) {
      try {
        await client.query(index.sql);
        console.log(`✅ ${index.name}`);
        created++;
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`⏭️  ${index.name} (ya existe)`);
          skipped++;
        } else {
          console.log(`⚠️  ${index.name}: ${error.message}`);
          errors++;
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 RESUMEN:`);
    console.log(`   • Índices creados: ${created}`);
    console.log(`   • Índices existentes: ${skipped}`);
    console.log(`   • Errores (columnas no existen): ${errors}`);
    console.log(`   • Total procesados: ${indexes.length}`);

    console.log('\n🔄 Actualizando estadísticas de la base de datos...');
    await client.query('ANALYZE');
    console.log('✅ Estadísticas actualizadas\n');

    console.log('📈 ANÁLISIS DE TAMAÑO DE TABLAS');
    console.log('═'.repeat(60));
    
    const tableSizes = await client.query(`
      SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS indexes_size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.'||tablename) DESC
      LIMIT 15
    `);

    console.log('\nTop 15 tablas por tamaño:');
    tableSizes.rows.forEach((row, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${row.tablename.padEnd(35)} | Total: ${row.total_size.padEnd(10)} | Tabla: ${row.table_size.padEnd(10)} | Índices: ${row.indexes_size}`);
    });

    console.log('\n✅ OPTIMIZACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

optimizeDatabase();
