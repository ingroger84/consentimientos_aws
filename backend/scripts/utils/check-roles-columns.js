require('dotenv').config();
const { Client } = require('pg');

async function checkColumns() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar columnas de la tabla roles
    console.log('📋 COLUMNAS DE LA TABLA ROLES:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    `);
    
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Obtener un rol de ejemplo
    console.log('\n📋 ROL DE EJEMPLO:');
    const roleResult = await client.query(`SELECT * FROM roles LIMIT 1`);
    if (roleResult.rows.length > 0) {
      console.log(JSON.stringify(roleResult.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();
