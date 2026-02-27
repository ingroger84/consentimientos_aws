const { Client } = require('pg');
require('dotenv').config();

// Configuración LOCAL (desde .env)
const localConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Configuración Supabase (hardcoded para comparar)
const supabaseConfig = {
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function getTableCounts(config, name) {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const tables = [
      'users', 'tenants', 'roles', 'permissions', 'clients', 
      'consents', 'medical_records', 'branches', 'services',
      'consent_templates', 'questions', 'answers',
      'plan_pricing', 'tax_configs', 'notifications',
      'payments', 'invoices', 'billing_history',
      'anamnesis', 'physical_exams', 'diagnoses', 'prescriptions',
      'medical_orders', 'procedures', 'treatment_plans', 'evolutions',
      'epicrisis', 'medical_record_documents', 'admissions',
      'medical_record_consents', 'app_settings', 'user_sessions',
      'medical_record_audit', 'payment_reminders', 'user_branches'
    ];
    
    const counts = {};
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        counts[table] = parseInt(result.rows[0].count);
      } catch (e) {
        counts[table] = 'ERROR';
      }
    }
    
    await client.end();
    return counts;
    
  } catch (error) {
    console.error(`❌ Error conectando a ${name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  COMPARACIÓN LOCAL VS SUPABASE            ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log('Configuración LOCAL:');
  console.log(`  Host: ${localConfig.host}`);
  console.log(`  Database: ${localConfig.database}`);
  console.log('');
  
  console.log('Configuración SUPABASE:');
  console.log(`  Host: ${supabaseConfig.host}`);
  console.log(`  Database: ${supabaseConfig.database}`);
  console.log('');
  
  // Verificar si local apunta a Supabase
  if (localConfig.host === supabaseConfig.host) {
    console.log('✅ LOCAL está configurado para usar SUPABASE');
    console.log('');
    console.log('Obteniendo datos de Supabase...');
    console.log('');
    
    const supabaseCounts = await getTableCounts(supabaseConfig, 'Supabase');
    
    if (!supabaseCounts) {
      console.error('❌ No se pudo conectar a Supabase');
      process.exit(1);
    }
    
    console.log('DATOS EN SUPABASE:');
    console.log('='.repeat(50));
    
    let total = 0;
    const tablesWithData = [];
    
    Object.entries(supabaseCounts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`${table.padEnd(30)} ${count} registros`);
        tablesWithData.push({ table, count });
        total += count;
      }
    });
    
    console.log('='.repeat(50));
    console.log(`Total de registros: ${total}`);
    console.log('');
    
    if (tablesWithData.length === 0) {
      console.log('⚠️  No hay datos en Supabase');
    } else {
      console.log(`✅ ${tablesWithData.length} tablas con datos`);
    }
    
  } else {
    console.log('⚠️  LOCAL NO está configurado para Supabase');
    console.log('');
    console.log('Comparando datos...');
    console.log('');
    
    const localCounts = await getTableCounts(localConfig, 'Local');
    const supabaseCounts = await getTableCounts(supabaseConfig, 'Supabase');
    
    if (!localCounts || !supabaseCounts) {
      console.error('❌ Error obteniendo datos');
      process.exit(1);
    }
    
    console.log('COMPARACIÓN:');
    console.log('='.repeat(70));
    console.log(`${'Tabla'.padEnd(30)} ${'Local'.padEnd(15)} ${'Supabase'.padEnd(15)} Estado`);
    console.log('='.repeat(70));
    
    const allTables = new Set([...Object.keys(localCounts), ...Object.keys(supabaseCounts)]);
    
    allTables.forEach(table => {
      const local = localCounts[table] || 0;
      const supabase = supabaseCounts[table] || 0;
      
      let status = '';
      if (local === supabase && local > 0) {
        status = '✅ Igual';
      } else if (local > supabase) {
        status = '⚠️  Local > Supabase';
      } else if (supabase > local) {
        status = '⚠️  Supabase > Local';
      } else if (local === 0 && supabase === 0) {
        return; // Skip empty tables
      }
      
      console.log(`${table.padEnd(30)} ${String(local).padEnd(15)} ${String(supabase).padEnd(15)} ${status}`);
    });
    
    console.log('='.repeat(70));
  }
  
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  ✅ VERIFICACIÓN COMPLETADA               ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
