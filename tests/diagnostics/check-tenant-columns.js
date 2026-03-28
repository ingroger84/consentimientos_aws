const { DataSource } = require('typeorm');
require('dotenv').config({ path: './backend/.env' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function checkColumns() {
  try {
    await dataSource.initialize();
    console.log('✓ Conectado a la base de datos');
    
    const result = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenant' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== Columnas de la tabla tenant ===');
    result.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar si existe max_medical_records
    const hasMedicalRecords = result.some(col => col.column_name === 'max_medical_records');
    console.log('\n=== Verificación ===');
    console.log(`max_medical_records existe: ${hasMedicalRecords ? '✓ SÍ' : '✗ NO'}`);
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
