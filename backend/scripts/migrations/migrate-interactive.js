const { Client } = require('pg');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Configuración de Supabase (destino)
const supabaseConfig = {
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function getLocalConfig() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CONFIGURACIÓN DE BASE DE DATOS LOCAL     ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const host = await question('Host (default: localhost): ') || 'localhost';
  const port = await question('Port (default: 5432): ') || '5432';
  const user = await question('User (default: postgres): ') || 'postgres';
  const password = await question('Password: ');
  const database = await question('Database name: ');
  
  return {
    host,
    port: parseInt(port),
    user,
    password,
    database,
    ssl: false
  };
}

async function testConnection(config, name) {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log(`✅ Conexión exitosa a ${name}`);
    await client.end();
    return true;
  } catch (error) {
    console.error(`❌ Error conectando a ${name}:`, error.message);
    return false;
  }
}

async function getTableData(client, table) {
  try {
    const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
    return parseInt(result.rows[0].count);
  } catch (e) {
    return 0;
  }
}

async function exportAndMigrate(localConfig) {
  const localClient = new Client(localConfig);
  const supabaseClient = new Client(supabaseConfig);
  
  try {
    console.log('\n=== Conectando a ambas bases de datos ===\n');
    
    await localClient.connect();
    console.log('✅ Conectado a base de datos local');
    
    await supabaseClient.connect();
    console.log('✅ Conectado a Supabase');
    console.log('');
    
    // Obtener lista de tablas
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`Encontradas ${tables.length} tablas\n`);
    
    // Verificar datos en cada tabla
    const tablesWithData = [];
    for (const table of tables) {
      const count = await getTableData(localClient, table);
      if (count > 0) {
        tablesWithData.push({ table, count });
        console.log(`${table.padEnd(35)} ${count} registros`);
      }
    }
    
    if (tablesWithData.length === 0) {
      console.log('\n⚠️  No hay datos para migrar');
      await localClient.end();
      await supabaseClient.end();
      return;
    }
    
    const totalRecords = tablesWithData.reduce((sum, t) => sum + t.count, 0);
    console.log('\n' + '='.repeat(50));
    console.log(`Total: ${tablesWithData.length} tablas, ${totalRecords} registros`);
    console.log('');
    
    const confirm = await question('¿Deseas continuar con la migración? (s/n): ');
    if (confirm.toLowerCase() !== 's') {
      console.log('Migración cancelada');
      await localClient.end();
      await supabaseClient.end();
      return;
    }
    
    console.log('\n=== Iniciando migración ===\n');
    
    let migratedTables = 0;
    let migratedRecords = 0;
    
    for (const { table, count } of tablesWithData) {
      console.log(`Migrando ${table} (${count} registros)...`);
      
      try {
        // Obtener columnas
        const columnsResult = await localClient.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table]);
        
        const columns = columnsResult.rows.map(r => r.column_name);
        
        // Obtener datos
        const dataResult = await localClient.query(`SELECT * FROM ${table}`);
        
        if (dataResult.rows.length > 0) {
          // Limpiar tabla en Supabase
          await supabaseClient.query(`DELETE FROM ${table}`);
          
          // Insertar datos en lotes de 100
          const batchSize = 100;
          for (let i = 0; i < dataResult.rows.length; i += batchSize) {
            const batch = dataResult.rows.slice(i, i + batchSize);
            
            for (const row of batch) {
              const values = columns.map((col, idx) => `$${idx + 1}`);
              const params = columns.map(col => row[col]);
              
              await supabaseClient.query(
                `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')})`,
                params
              );
            }
            
            if (i + batchSize < dataResult.rows.length) {
              process.stdout.write(`  ${i + batchSize}/${dataResult.rows.length}\r`);
            }
          }
          
          console.log(`  ✅ ${dataResult.rows.length} registros migrados`);
          migratedTables++;
          migratedRecords += dataResult.rows.length;
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migración completada`);
    console.log(`   Tablas migradas: ${migratedTables}/${tablesWithData.length}`);
    console.log(`   Registros migrados: ${migratedRecords}/${totalRecords}`);
    console.log('');
    
    await localClient.end();
    await supabaseClient.end();
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  MIGRACIÓN DE DATOS LOCAL A SUPABASE      ║');
  console.log('╚════════════════════════════════════════════╝');
  
  // 1. Obtener configuración de base de datos local
  const localConfig = await getLocalConfig();
  
  // 2. Probar conexiones
  console.log('\n=== Probando conexiones ===\n');
  
  const localOk = await testConnection(localConfig, 'Base de datos local');
  if (!localOk) {
    console.log('\n❌ No se pudo conectar a la base de datos local');
    rl.close();
    process.exit(1);
  }
  
  const supabaseOk = await testConnection(supabaseConfig, 'Supabase');
  if (!supabaseOk) {
    console.log('\n❌ No se pudo conectar a Supabase');
    rl.close();
    process.exit(1);
  }
  
  // 3. Exportar y migrar
  await exportAndMigrate(localConfig);
  
  rl.close();
  
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  ✅ PROCESO COMPLETADO                    ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

main().catch(error => {
  console.error('Error fatal:', error);
  rl.close();
  process.exit(1);
});
