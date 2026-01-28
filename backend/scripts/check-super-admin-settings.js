const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function checkSettings() {
  try {
    const result = await pool.query(
      'SELECT key, value FROM app_settings WHERE "tenantId" IS NULL ORDER BY key'
    );
    
    console.log('========================================');
    console.log('  Settings del Super Admin');
    console.log('========================================');
    console.log('');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay settings configurados para el Super Admin');
    } else {
      console.log(`✓ Encontrados ${result.rows.length} settings:`);
      console.log('');
      result.rows.forEach(row => {
        const value = row.value.length > 80 ? row.value.substring(0, 80) + '...' : row.value;
        console.log(`  ${row.key.padEnd(25)} = ${value}`);
      });
    }
    
    console.log('');
    console.log('========================================');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSettings();
