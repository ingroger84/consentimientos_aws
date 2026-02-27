const { Client } = require('pg');
const fs = require('fs');

// Configuración de base de datos LOCAL (PostgreSQL en tu máquina)
const localConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres', // Ajusta si es diferente
  database: 'archivoenlinea', // Ajusta el nombre de tu base de datos local
  ssl: false
};

// Configuración de Supabase
const supabaseConfig = {
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function checkLocalData() {
  const client = new Client(localConfig);
  
  try {
    console.log('=== Conectando a base de datos LOCAL ===\n');
    await client.connect();
    console.log('✅ Conectado a:', localConfig.host);
    console.log('Database:', localConfig.database);
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
    const tablesWithData = [];
    let total = 0;
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          console.log(`${table.padEnd(35)} ${count}`);
          tablesWithData.push({ table, count });
          total += count;
        }
      } catch (e) {
        // Tabla no existe o error
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total de registros: ${total}`);
    console.log('');
    
    await client.end();
    
    return tablesWithData;
  } catch (error) {
    console.error('❌ Error conectando a base de datos local:', error.message);
    console.error('');
    console.error('Por favor verifica:');
    console.error('1. PostgreSQL está corriendo en tu máquina');
    console.error('2. Las credenciales son correctas');
    console.error('3. El nombre de la base de datos es correcto');
    console.error('');
    console.error('Credenciales actuales:');
    console.error(`   Host: ${localConfig.host}`);
    console.error(`   Port: ${localConfig.port}`);
    console.error(`   User: ${localConfig.user}`);
    console.error(`   Database: ${localConfig.database}`);
    process.exit(1);
  }
}

async function exportData(tablesWithData) {
  const localClient = new Client(localConfig);
  
  try {
    console.log('=== Exportando datos de base de datos LOCAL ===\n');
    await localClient.connect();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = `backup_local_${timestamp}.sql`;
    
    let sqlContent = `-- Backup de base de datos local
-- Fecha: ${new Date().toISOString()}
-- Tablas: ${tablesWithData.length}
-- Registros: ${tablesWithData.reduce((sum, t) => sum + t.count, 0)}

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

`;
    
    for (const { table, count } of tablesWithData) {
      console.log(`Exportando ${table} (${count} registros)...`);
      
      // Obtener estructura de la tabla
      const columns = await localClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        ORDER BY ordinal_position
      `);
      
      const columnNames = columns.rows.map(c => c.column_name);
      
      // Obtener datos
      const data = await localClient.query(`SELECT * FROM ${table}`);
      
      if (data.rows.length > 0) {
        sqlContent += `\n-- Tabla: ${table}\n`;
        sqlContent += `DELETE FROM ${table};\n`;
        
        for (const row of data.rows) {
          const values = columnNames.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return val;
          });
          
          sqlContent += `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
    }
    
    fs.writeFileSync(backupFile, sqlContent);
    console.log(`\n✅ Backup creado: ${backupFile}`);
    console.log('');
    
    await localClient.end();
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error exportando datos:', error.message);
    process.exit(1);
  }
}

async function importToSupabase(backupFile) {
  const supabaseClient = new Client(supabaseConfig);
  
  try {
    console.log('=== Importando datos a Supabase ===\n');
    await supabaseClient.connect();
    console.log('✅ Conectado a Supabase');
    console.log('');
    
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    const statements = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim());
    
    console.log(`Ejecutando ${statements.length} statements...`);
    console.log('');
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      try {
        await supabaseClient.query(stmt);
        success++;
        if ((i + 1) % 100 === 0) {
          console.log(`Procesados: ${i + 1}/${statements.length}`);
        }
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`Error en statement ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`✅ Statements exitosos: ${success}`);
    if (errors > 0) {
      console.log(`⚠️  Statements con error: ${errors}`);
    }
    console.log('');
    
    await supabaseClient.end();
    
  } catch (error) {
    console.error('❌ Error importando a Supabase:', error.message);
    process.exit(1);
  }
}

async function verifyMigration() {
  const supabaseClient = new Client(supabaseConfig);
  
  try {
    console.log('=== Verificando migración en Supabase ===\n');
    await supabaseClient.connect();
    
    const tables = [
      'users', 'tenants', 'roles', 'clients', 'consents', 
      'medical_records', 'branches', 'services'
    ];
    
    for (const table of tables) {
      try {
        const result = await supabaseClient.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table.padEnd(25)} ${result.rows[0].count}`);
      } catch (e) {
        // Tabla no existe
      }
    }
    
    console.log('');
    console.log('✅ Migración completada');
    
    await supabaseClient.end();
    
  } catch (error) {
    console.error('❌ Error verificando:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  MIGRACIÓN DE DATOS LOCAL A SUPABASE      ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  // 1. Verificar datos en local
  const tablesWithData = await checkLocalData();
  
  if (tablesWithData.length === 0) {
    console.log('⚠️  No hay datos para migrar en la base de datos local');
    return;
  }
  
  // 2. Exportar datos
  const backupFile = await exportData(tablesWithData);
  
  // 3. Importar a Supabase
  await importToSupabase(backupFile);
  
  // 4. Verificar migración
  await verifyMigration();
  
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  ✅ MIGRACIÓN COMPLETADA                  ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
