const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function checkLogoSettings() {
  try {
    const result = await pool.query(`
      SELECT key, value, "tenantId"
      FROM app_settings
      WHERE key LIKE '%logo%'
      ORDER BY key
    `);

    console.log('Settings de logos en la base de datos:');
    if (result.rows.length === 0) {
      console.log('  No hay settings de logos configurados');
    } else {
      result.rows.forEach(s => {
        const tenantInfo = s.tenantId ? `tenant: ${s.tenantId}` : 'Super Admin';
        const valueInfo = s.value ? 'Configurado' : 'No configurado';
        console.log(`  ${s.key}: ${valueInfo} (${tenantInfo})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLogoSettings();
