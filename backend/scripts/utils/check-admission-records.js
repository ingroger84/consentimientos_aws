const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function checkAdmissionRecords() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Buscar la HC más reciente
    const hcResult = await client.query(`
      SELECT id, record_number, client_id, created_at
      FROM medical_records
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (hcResult.rows.length === 0) {
      console.log('❌ No hay historias clínicas en la base de datos');
      return;
    }

    const hc = hcResult.rows[0];
    console.log('\n📋 Historia Clínica más reciente:');
    console.log(`   ID: ${hc.id}`);
    console.log(`   Número: ${hc.record_number}`);
    console.log(`   Fecha: ${hc.created_at}`);

    // Buscar admisiones de esta HC
    const admissionsResult = await client.query(`
      SELECT id, admission_number, admission_type, status, created_at
      FROM admissions
      WHERE medical_record_id = $1
      ORDER BY created_at DESC
    `, [hc.id]);

    console.log(`\n🏥 Admisiones encontradas: ${admissionsResult.rows.length}`);
    
    for (const admission of admissionsResult.rows) {
      console.log(`\n   📌 Admisión: ${admission.admission_number}`);
      console.log(`      ID: ${admission.id}`);
      console.log(`      Tipo: ${admission.admission_type}`);
      console.log(`      Estado: ${admission.status}`);
      console.log(`      Fecha: ${admission.created_at}`);

      // Contar registros asociados a esta admisión
      const anamnesisCount = await client.query(`
        SELECT COUNT(*) as count FROM anamnesis WHERE admission_id = $1
      `, [admission.id]);

      const physicalExamsCount = await client.query(`
        SELECT COUNT(*) as count FROM physical_exams WHERE admission_id = $1
      `, [admission.id]);

      const diagnosesCount = await client.query(`
        SELECT COUNT(*) as count FROM diagnoses WHERE admission_id = $1
      `, [admission.id]);

      const evolutionsCount = await client.query(`
        SELECT COUNT(*) as count FROM evolutions WHERE admission_id = $1
      `, [admission.id]);

      console.log(`\n      📊 Registros asociados:`);
      console.log(`         Anamnesis: ${anamnesisCount.rows[0].count}`);
      console.log(`         Exámenes Físicos: ${physicalExamsCount.rows[0].count}`);
      console.log(`         Diagnósticos: ${diagnosesCount.rows[0].count}`);
      console.log(`         Evoluciones: ${evolutionsCount.rows[0].count}`);

      // Mostrar detalles de anamnesis si existen
      if (parseInt(anamnesisCount.rows[0].count) > 0) {
        const anamnesisDetails = await client.query(`
          SELECT id, chief_complaint, created_at
          FROM anamnesis
          WHERE admission_id = $1
          ORDER BY created_at DESC
        `, [admission.id]);

        console.log(`\n      📝 Detalles de Anamnesis:`);
        for (const ana of anamnesisDetails.rows) {
          console.log(`         - ${ana.chief_complaint.substring(0, 50)}... (${ana.created_at})`);
        }
      }
    }

    // Verificar registros huérfanos (sin admission_id)
    const orphanAnamnesis = await client.query(`
      SELECT COUNT(*) as count FROM anamnesis WHERE medical_record_id = $1 AND admission_id IS NULL
    `, [hc.id]);

    const orphanPhysicalExams = await client.query(`
      SELECT COUNT(*) as count FROM physical_exams WHERE medical_record_id = $1 AND admission_id IS NULL
    `, [hc.id]);

    const orphanDiagnoses = await client.query(`
      SELECT COUNT(*) as count FROM diagnoses WHERE medical_record_id = $1 AND admission_id IS NULL
    `, [hc.id]);

    const orphanEvolutions = await client.query(`
      SELECT COUNT(*) as count FROM evolutions WHERE medical_record_id = $1 AND admission_id IS NULL
    `, [hc.id]);

    console.log(`\n⚠️  Registros huérfanos (sin admisión):`);
    console.log(`   Anamnesis: ${orphanAnamnesis.rows[0].count}`);
    console.log(`   Exámenes Físicos: ${orphanPhysicalExams.rows[0].count}`);
    console.log(`   Diagnósticos: ${orphanDiagnoses.rows[0].count}`);
    console.log(`   Evoluciones: ${orphanEvolutions.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmissionRecords();
