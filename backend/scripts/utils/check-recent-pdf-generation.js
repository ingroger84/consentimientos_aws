const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function checkRecentPDFs() {
  try {
    console.log('\n========================================');
    console.log('=== VERIFICANDO PDFs RECIENTES ===');
    console.log('========================================\n');

    // Obtener los últimos 5 consentimientos HC generados
    const result = await pool.query(`
      SELECT 
        mrc.id,
        mrc.consent_number,
        mrc.pdf_url,
        mrc.created_at,
        mr."recordNumber",
        c.full_name as client_name
      FROM medical_record_consents mrc
      JOIN medical_records mr ON mrc.medical_record_id = mr.id
      JOIN clients c ON mr."clientId" = c.id
      ORDER BY mrc.created_at DESC
      LIMIT 5
    `);

    console.log(`Últimos ${result.rows.length} consentimientos HC generados:\n`);

    result.rows.forEach((row, index) => {
      const createdAt = new Date(row.created_at);
      const now = new Date();
      const minutesAgo = Math.floor((now - createdAt) / 1000 / 60);
      
      console.log(`${index + 1}. ${row.consent_number}`);
      console.log(`   Cliente: ${row.client_name}`);
      console.log(`   HC: ${row.record_number}`);
      console.log(`   Generado: ${createdAt.toLocaleString('es-CO')} (hace ${minutesAgo} minutos)`);
      console.log(`   PDF URL: ${row.pdf_url}`);
      console.log('');
    });

    // Verificar si hay PDFs generados después de las 12:43:59 AM (reinicio del backend)
    const backendRestartTime = new Date('2026-01-27T00:43:59');
    const pdfsAfterRestart = result.rows.filter(row => new Date(row.created_at) > backendRestartTime);

    console.log('========================================');
    console.log(`PDFs generados DESPUÉS del reinicio del backend (12:43:59 AM): ${pdfsAfterRestart.length}`);
    console.log('========================================\n');

    if (pdfsAfterRestart.length > 0) {
      console.log('✅ Hay PDFs generados después del reinicio:');
      pdfsAfterRestart.forEach((row, index) => {
        console.log(`${index + 1}. ${row.consent_number} - ${new Date(row.created_at).toLocaleString('es-CO')}`);
      });
    } else {
      console.log('⚠️  NO hay PDFs generados después del reinicio del backend');
      console.log('   El usuario está viendo PDFs antiguos generados con el código anterior');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkRecentPDFs();
