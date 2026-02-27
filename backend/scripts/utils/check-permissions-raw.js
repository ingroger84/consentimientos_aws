const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estructura de permisos...\n');

    // Ver la estructura de la tabla roles
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de la tabla roles:');
    columnsResult.rows.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type}`);
    });

    // Ver un rol completo
    const roleResult = await client.query(`
      SELECT * FROM roles LIMIT 1
    `);
    
    console.log('\n📄 Ejemplo de rol (primero):');
    if (roleResult.rows.length > 0) {
      const role = roleResult.rows[0];
      console.log(JSON.stringify(role, null, 2));
    }

    // Ver estructura de users
    const userColumnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas de la tabla users:');
    userColumnsResult.rows.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPermissions();
