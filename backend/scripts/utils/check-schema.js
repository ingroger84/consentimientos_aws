require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function checkSchema() {
  try {
    // Verificar esquemas disponibles
    const schemas = await pool.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log('Esquemas disponibles:');
    schemas.rows.forEach(row => console.log(`- ${row.schema_name}`));
    
    // Buscar la tabla permissions en todos los esquemas
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'permissions'
    `);
    
    console.log('\nTabla permissions encontrada en:');
    tables.rows.forEach(row => console.log(`- ${row.table_schema}.${row.table_name}`));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkSchema();
