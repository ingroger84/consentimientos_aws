const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseConfig = {
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function importBackupToSupabase(backupFile) {
  const client = new Client(supabaseConfig);
  
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  IMPORTANDO BACKUP A SUPABASE             ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log('Archivo:', backupFile);
    console.log('Destino: Supabase');
    console.log('');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(backupFile)) {
      console.error('❌ Error: El archivo no existe:', backupFile);
      process.exit(1);
    }
    
    const fileSize = fs.statSync(backupFile).size;
    console.log(`Tamaño del archivo: ${(fileSize / 1024).toFixed(2)} KB`);
    console.log('');
    
    // Conectar a Supabase
    console.log('Conectando a Supabase...');
    await client.connect();
    console.log('✅ Conectado a Supabase');
    console.log('');
    
    // Leer el archivo SQL
    console.log('Leyendo archivo SQL...');
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    console.log('✅ Archivo leído');
    console.log('');
    
    // Dividir en statements
    console.log('Procesando statements SQL...');
    const statements = sqlContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('--') && 
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('SET ') &&
               !trimmed.startsWith('SELECT pg_catalog') &&
               !trimmed.startsWith('CREATE EXTENSION') &&
               !trimmed.startsWith('COMMENT ON EXTENSION');
      })
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Total de statements: ${statements.length}`);
    console.log('');
    
    // Ejecutar statements
    console.log('Ejecutando statements...');
    console.log('(Esto puede tomar varios minutos)');
    console.log('');
    
    let success = 0;
    let errors = 0;
    let skipped = 0;
    const errorDetails = [];
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Saltar statements que no queremos ejecutar
      if (stmt.includes('CREATE TYPE') || 
          stmt.includes('CREATE SEQUENCE') ||
          stmt.includes('ALTER SEQUENCE') ||
          stmt.includes('CREATE TABLE') ||
          stmt.includes('ALTER TABLE ONLY') ||
          stmt.includes('CREATE INDEX') ||
          stmt.includes('ADD CONSTRAINT')) {
        skipped++;
        continue;
      }
      
      try {
        await client.query(stmt);
        success++;
        
        if ((i + 1) % 100 === 0) {
          console.log(`Procesados: ${i + 1}/${statements.length} (${success} exitosos, ${errors} errores, ${skipped} omitidos)`);
        }
      } catch (error) {
        errors++;
        
        // Guardar solo los primeros 10 errores
        if (errorDetails.length < 10) {
          errorDetails.push({
            statement: stmt.substring(0, 100) + '...',
            error: error.message
          });
        }
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(50));
    console.log(`✅ Statements exitosos: ${success}`);
    console.log(`⏭️  Statements omitidos: ${skipped}`);
    if (errors > 0) {
      console.log(`⚠️  Statements con error: ${errors}`);
      console.log('');
      console.log('Primeros errores:');
      errorDetails.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.statement}`);
        console.log(`   Error: ${err.error}`);
      });
    }
    console.log('');
    
    await client.end();
    
    // Verificar datos importados
    await verifyImport();
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function verifyImport() {
  const client = new Client(supabaseConfig);
  
  try {
    console.log('='.repeat(50));
    console.log('VERIFICANDO DATOS EN SUPABASE');
    console.log('='.repeat(50));
    console.log('');
    
    await client.connect();
    
    const tables = [
      'users', 'tenants', 'roles', 'permissions', 'clients', 
      'consents', 'medical_records', 'branches', 'services',
      'consent_templates', 'plan_pricing', 'notifications',
      'payments', 'invoices', 'billing_history'
    ];
    
    let totalRecords = 0;
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          console.log(`${table.padEnd(30)} ${count} registros`);
          totalRecords += count;
        }
      } catch (e) {
        // Tabla no existe o error
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`Total de registros importados: ${totalRecords}`);
    console.log('');
    
    await client.end();
    
  } catch (error) {
    console.error('Error verificando:', error.message);
  }
}

// Obtener el archivo de backup más reciente
const backupDir = '/home/ubuntu/consentimientos_aws';
const backupFiles = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
  .map(f => ({
    name: f,
    path: path.join(backupDir, f),
    mtime: fs.statSync(path.join(backupDir, f)).mtime
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (backupFiles.length === 0) {
  console.error('❌ No se encontraron archivos de backup');
  process.exit(1);
}

const latestBackup = backupFiles[0];
console.log('\n📦 Backup más reciente encontrado:');
console.log(`   Archivo: ${latestBackup.name}`);
console.log(`   Fecha: ${latestBackup.mtime.toISOString()}`);
console.log('');

importBackupToSupabase(latestBackup.path);
