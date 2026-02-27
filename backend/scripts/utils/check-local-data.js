const { Client } = require('pg');
require('dotenv').config();

async function checkLocal() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('=== Base de Datos LOCAL ===\n');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_DATABASE);
    console.log('');
    
    const tables = [
      'users', 'tenants', 'roles', 'permissions', 'clients', 
      'consents', 'medical_records', 'branches', 'services',
      'consent_templates', 'medical_record_consent_templates',
      'plan_pricing', 'tax_configs', 'notifications', 'payments',
      'invoices', 'billing_history', 'questions', 'answers',
      'anamnesis', 'physical_exams', 'diagnoses', 'prescriptions',
      'medical_orders', 'procedures', 'treatment_plans', 'evolutions',
      'epicrisis', 'medical_record_documents', 'admissions',
      'medical_record_consents', 'app_settings', 'user_sessions',
      'medical_record_audit', 'payment_reminders', 'user_branches'
    ];
    
    console.log('Tablas con datos:\n');
    let total = 0;
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          console.log(`${table.padEnd(35)} ${count}`);
          total += count;
        }
      } catch (e) {
        // Tabla no existe o error
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total de registros: ${total}`);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLocal();
