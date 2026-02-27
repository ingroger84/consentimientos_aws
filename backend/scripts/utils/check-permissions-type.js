const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkType() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT name, permissions, pg_typeof(permissions) as type
      FROM roles
      WHERE name = 'Operador'
      AND deleted_at IS NULL
    `);
    
    console.log('Operador:');
    console.log('  permissions:', result.rows[0].permissions);
    console.log('  type:', result.rows[0].type);
    console.log('  is array:', Array.isArray(result.rows[0].permissions));
    console.log('  typeof:', typeof result.rows[0].permissions);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkType();
