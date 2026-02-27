const { Client } = require('pg');
require('dotenv').config();

// Configuración Supabase
const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function createMissingAdmissions() {
  try {
    console.log('🔄 Conectando a Supabase...\n');
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // 1. Obtener todas las historias clínicas
    console.log('📥 Obteniendo historias clínicas...');
    const mrResult = await client.query(`
      SELECT 
        id,
        admission_date,
        admission_type,
        created_by,
        created_at
      FROM medical_records
      ORDER BY created_at
    `);
    
    const medicalRecords = mrResult.rows;
    console.log(`✅ ${medicalRecords.length} historias clínicas encontradas\n`);

    // 2. Obtener historias clínicas que ya tienen admisiones
    const admissionsResult = await client.query(`
      SELECT DISTINCT medical_record_id 
      FROM admissions
    `);
    
    const mrWithAdmissions = new Set(admissionsResult.rows.map(row => row.medical_record_id));
    console.log(`📋 ${mrWithAdmissions.size} historias clínicas ya tienen admisiones\n`);

    // 3. Filtrar historias clínicas sin admisiones
    const mrWithoutAdmissions = medicalRecords.filter(mr => !mrWithAdmissions.has(mr.id));
    
    if (mrWithoutAdmissions.length === 0) {
      console.log('✅ Todas las historias clínicas ya tienen admisiones');
      return;
    }

    console.log(`🔄 Creando admisiones para ${mrWithoutAdmissions.length} historias clínicas...\n`);

    let created = 0;
    let errors = 0;

    for (const mr of mrWithoutAdmissions) {
      try {
        // Generar UUID para la admisión
        const admissionId = await client.query('SELECT gen_random_uuid() as id');
        const newId = admissionId.rows[0].id;

        // Crear admisión automática
        await client.query(`
          INSERT INTO admissions (
            id,
            medical_record_id,
            admission_date,
            admission_type,
            reason,
            status,
            created_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          newId,
          mr.id,
          mr.admission_date,
          mr.admission_type,
          'Primera admisión - Apertura de Historia Clínica (migración automática)',
          'open',
          mr.created_by,
          mr.created_at,
          mr.created_at
        ]);

        created++;
        console.log(`✅ Admisión creada para HC: ${mr.id} (${created}/${mrWithoutAdmissions.length})`);
      } catch (error) {
        console.error(`❌ Error al crear admisión para HC ${mr.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Admisiones creadas: ${created}`);
    console.log(`❌ Errores: ${errors}`);

    // 4. Verificar conteo final
    const finalCountResult = await client.query('SELECT COUNT(*) FROM admissions');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    console.log(`\n✅ Total de admisiones en Supabase: ${finalCount}`);

    // 5. Verificar que todas las HC tienen al menos una admisión
    const mrCountResult = await client.query('SELECT COUNT(*) FROM medical_records');
    const mrCount = parseInt(mrCountResult.rows[0].count);
    
    const mrWithAdmissionsResult = await client.query(`
      SELECT COUNT(DISTINCT medical_record_id) 
      FROM admissions
    `);
    const mrWithAdmissionsCount = parseInt(mrWithAdmissionsResult.rows[0].count);

    console.log(`\n📊 Verificación final:`);
    console.log(`   Total HC: ${mrCount}`);
    console.log(`   HC con admisiones: ${mrWithAdmissionsCount}`);
    
    if (mrCount === mrWithAdmissionsCount) {
      console.log(`   ✅ Todas las HC tienen al menos una admisión`);
    } else {
      console.log(`   ⚠️  ${mrCount - mrWithAdmissionsCount} HC sin admisiones`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

createMissingAdmissions();
