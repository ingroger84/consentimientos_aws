const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false },
});

async function checkAdmissions() {
  try {
    await client.connect();
    console.log('=== CONECTADO A LA BASE DE DATOS ===\n');

    // Verificar últimas admisiones
    const admissionsResult = await client.query(`
      SELECT 
        id, 
        admission_number, 
        admission_type, 
        status, 
        medical_record_id,
        created_at 
      FROM admissions 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log('=== ÚLTIMAS 10 ADMISIONES ===');
    console.log(`Total encontradas: ${admissionsResult.rows.length}\n`);
    admissionsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.admission_number}`);
      console.log(`   HC ID: ${row.medical_record_id}`);
      console.log(`   Tipo: ${row.admission_type}`);
      console.log(`   Estado: ${row.status}`);
      console.log(`   Creada: ${row.created_at}`);
      console.log('');
    });

    // Verificar HC específica (HC-2026-002)
    const hcResult = await client.query(`
      SELECT 
        id, 
        record_number 
      FROM medical_records 
      WHERE record_number = 'HC-2026-002'
    `);

    if (hcResult.rows.length > 0) {
      const hcId = hcResult.rows[0].id;
      console.log(`\n=== HC-2026-002 ===`);
      console.log(`ID: ${hcId}\n`);

      // Verificar admisiones de esta HC
      const hcAdmissionsResult = await client.query(`
        SELECT 
          id, 
          admission_number, 
          admission_type, 
          status, 
          created_at 
        FROM admissions 
        WHERE medical_record_id = $1
        ORDER BY created_at DESC
      `, [hcId]);

      console.log(`=== ADMISIONES DE HC-2026-002 ===`);
      console.log(`Total: ${hcAdmissionsResult.rows.length}\n`);
      hcAdmissionsResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.admission_number}`);
        console.log(`   Tipo: ${row.admission_type}`);
        console.log(`   Estado: ${row.status}`);
        console.log(`   Creada: ${row.created_at}`);
        console.log('');
      });
    } else {
      console.log('\n❌ HC-2026-002 no encontrada en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

checkAdmissions();
