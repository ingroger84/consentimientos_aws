const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkMedicalRecordsStatus() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Obtener todas las historias clínicas con sus estados
    const records = await AppDataSource.query(`
      SELECT 
        id,
        record_number,
        status,
        is_locked,
        closed_at,
        tenant_id
      FROM medical_records
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('\n📋 ESTADOS DE HISTORIAS CLÍNICAS:');
    console.log('='.repeat(80));
    
    records.forEach(record => {
      console.log(`\nHC: ${record.record_number}`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Estado: ${record.status}`);
      console.log(`  Bloqueada: ${record.is_locked}`);
      console.log(`  Cerrada en: ${record.closed_at || 'N/A'}`);
      console.log(`  Tenant ID: ${record.tenant_id}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Verificación completada');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMedicalRecordsStatus();
