const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  database: 'archivoenlinea',
  ssl: { rejectUnauthorized: false }
});

async function checkAdmissions() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar tabla admissions
    const countResult = await client.query('SELECT COUNT(*) FROM admissions');
    console.log(`✓ Tabla admissions existe`);
    console.log(`  Registros: ${countResult.rows[0].count}\n`);

    // Verificar columnas admission_id
    const columnsResult = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'admission_id'
      ORDER BY table_name
    `);
    console.log(`✓ Columnas admission_id agregadas a ${columnsResult.rows.length} tablas:`);
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✓ Verificación completada exitosamente');
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmissions();
