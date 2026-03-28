/**
 * Script de optimización de base de datos
 * Crea índices faltantes para mejorar el rendimiento
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

    console.log('📊 ANÁLISIS DE ÍNDICES EXISTENTES');
    console.log('═'.repeat(60));
    
    const existingIndexes = await client.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log(`Total de índices existentes: ${existingIndexes.rows.length}\n`);

    console.log('🔨 CREANDO ÍNDICES DE OPTIMIZACIÓN');
    console.log('═'.repeat(60));

    const indexes = [
      // TENANTS
      { name: 'idx_tenants_slug', sql: "CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL" },
      { name: 'idx_tenants_status', sql: "CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL" },
      { name: 'idx_tenants_plan', sql: "CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan) WHERE deleted_at IS NULL" },
      { name: 'idx_tenants_trial_ends_at', sql: "CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at ON tenants(trial_ends_at) WHERE status = 'TRIAL'" },
      
      // USERS
      { name: 'idx_users_email', sql: "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL" },
      { name: 'idx_users_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL" },
      { name: 'idx_users_role_id', sql: "CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id) WHERE deleted_at IS NULL" },
      { name: 'idx_users_tenant_email', sql: "CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email) WHERE deleted_at IS NULL" },
      
      // USER_SESSIONS
      { name: 'idx_user_sessions_expires_at', sql: "CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE is_active = true" },
      
      // INVOICES
      { name: 'idx_invoices_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id)" },
      { name: 'idx_invoices_status', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)" },
      { name: 'idx_invoices_tenant_status', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status)" },
      { name: 'idx_invoices_due_date', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'overdue')" },
      { name: 'idx_invoices_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at)" },
      { name: 'idx_invoices_bold_order_id', sql: "CREATE INDEX IF NOT EXISTS idx_invoices_bold_order_id ON invoices(bold_order_id) WHERE bold_order_id IS NOT NULL" },
      
      // PAYMENTS
      { name: 'idx_payments_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)" },
      { name: 'idx_payments_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id)" },
      { name: 'idx_payments_status', sql: "CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)" },
      { name: 'idx_payments_bold_order_id', sql: "CREATE INDEX IF NOT EXISTS idx_payments_bold_order_id ON payments(bold_order_id) WHERE bold_order_id IS NOT NULL" },
      { name: 'idx_payments_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)" },
      
      // MEDICAL_RECORDS
      { name: 'idx_medical_records_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id)" },
      { name: 'idx_medical_records_client_id', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_client_id ON medical_records(client_id)" },
      { name: 'idx_medical_records_status', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status)" },
      { name: 'idx_medical_records_tenant_status', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_status ON medical_records(tenant_id, status)" },
      { name: 'idx_medical_records_record_number', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_record_number ON medical_records(record_number)" },
      { name: 'idx_medical_records_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at)" },
      { name: 'idx_medical_records_tenant_client', sql: "CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_client ON medical_records(tenant_id, client_id)" },
      
      // MEDICAL_RECORD_CONSENTS
      { name: 'idx_mr_consents_medical_record_id', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consents_medical_record_id ON medical_record_consents(medical_record_id)" },
      { name: 'idx_mr_consents_template_id', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consents_template_id ON medical_record_consents(template_id)" },
      { name: 'idx_mr_consents_signed_at', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consents_signed_at ON medical_record_consents(signed_at)" },
      
      // CONSENTS
      { name: 'idx_consents_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id) WHERE deleted_at IS NULL" },
      { name: 'idx_consents_client_id', sql: "CREATE INDEX IF NOT EXISTS idx_consents_client_id ON consents(client_id) WHERE deleted_at IS NULL" },
      { name: 'idx_consents_template_id', sql: "CREATE INDEX IF NOT EXISTS idx_consents_template_id ON consents(template_id) WHERE deleted_at IS NULL" },
      { name: 'idx_consents_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_consents_created_at ON consents(created_at) WHERE deleted_at IS NULL" },
      
      // CONSENT_TEMPLATES
      { name: 'idx_consent_templates_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant_id ON consent_templates(tenant_id)" },
      { name: 'idx_consent_templates_is_active', sql: "CREATE INDEX IF NOT EXISTS idx_consent_templates_is_active ON consent_templates(is_active) WHERE tenant_id IS NOT NULL" },
      
      // MR_CONSENT_TEMPLATES
      { name: 'idx_mr_consent_templates_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_tenant_id ON medical_record_consent_templates(tenant_id)" },
      { name: 'idx_mr_consent_templates_is_active', sql: "CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_is_active ON medical_record_consent_templates(is_active)" },
      
      // BRANCHES
      { name: 'idx_branches_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id) WHERE deleted_at IS NULL" },
      
      // SERVICES
      { name: 'idx_services_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id) WHERE deleted_at IS NULL" },
      
      // ADMISSIONS
      { name: 'idx_admissions_medical_record_id', sql: "CREATE INDEX IF NOT EXISTS idx_admissions_medical_record_id ON admissions(medical_record_id)" },
      { name: 'idx_admissions_status', sql: "CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status)" },
      { name: 'idx_admissions_admission_date', sql: "CREATE INDEX IF NOT EXISTS idx_admissions_admission_date ON admissions(admission_date)" },
      
      // WEBHOOK_LOGS
      { name: 'idx_webhook_logs_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_webhook_logs_invoice_id ON webhook_logs(invoice_id)" },
      { name: 'idx_webhook_logs_status', sql: "CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status)" },
      { name: 'idx_webhook_logs_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at)" },
      
      // NOTIFICATIONS
      { name: 'idx_notifications_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id)" },
      { name: 'idx_notifications_is_read', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)" },
      { name: 'idx_notifications_created_at', sql: "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)" },
      
      // BILLING_HISTORY
      { name: 'idx_billing_history_tenant_id', sql: "CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON billing_history(tenant_id)" },
      { name: 'idx_billing_history_billing_date', sql: "CREATE INDEX IF NOT EXISTS idx_billing_history_billing_date ON billing_history(billing_date)" },
      
      // PAYMENT_REMINDERS
      { name: 'idx_payment_reminders_invoice_id', sql: "CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id)" },
      { name: 'idx_payment_reminders_sent_at', sql: "CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at ON payment_reminders(sent_at)" },
    ];

    let created = 0;
    let skipped = 0;

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
          console.log(`❌ ${index.name}: ${error.message}`);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 RESUMEN:`);
    console.log(`   • Índices creados: ${created}`);
    console.log(`   • Índices existentes: ${skipped}`);
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
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Monitorear el rendimiento de queries después de aplicar índices');
    console.log('   2. Ejecutar VACUUM FULL en horario de bajo tráfico si es necesario');
    console.log('   3. Revisar índices no utilizados después de 1 semana en producción');
    console.log('   4. Considerar particionamiento para tablas muy grandes (>1M registros)');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

optimizeDatabase();
