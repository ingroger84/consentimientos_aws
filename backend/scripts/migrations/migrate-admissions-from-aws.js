const { Client } = require('pg');
require('dotenv').config();

// Configuración AWS (base de datos antigua)
const awsClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Datagree2024!',
  database: 'consentimientos',
  ssl: false
});

// Configuración Supabase (base de datos nueva)
const supabaseClient = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrateAdmissions() {
  try {
    console.log('🔄 Conectando a las bases de datos...\n');
    
    await awsClient.connect();
    console.log('✅ Conectado a AWS');
    
    await supabaseClient.connect();
    console.log('✅ Conectado a Supabase\n');

    // 1. Contar admisiones en AWS
    const awsCountResult = await awsClient.query('SELECT COUNT(*) FROM admissions');
    const awsCount = parseInt(awsCountResult.rows[0].count);
    console.log(`📊 Admisiones en AWS: ${awsCount}`);

    // 2. Contar admisiones en Supabase
    const supabaseCountResult = await supabaseClient.query('SELECT COUNT(*) FROM admissions');
    const supabaseCount = parseInt(supabaseCountResult.rows[0].count);
    console.log(`📊 Admisiones en Supabase: ${supabaseCount}\n`);

    if (awsCount === 0) {
      console.log('⚠️  No hay admisiones en AWS para migrar');
      return;
    }

    // 3. Obtener todas las admisiones de AWS
    console.log('📥 Obteniendo admisiones de AWS...');
    const awsAdmissionsResult = await awsClient.query(`
      SELECT 
        id,
        created_at,
        updated_at,
        deleted_at,
        medical_record_id,
        admission_date,
        admission_type,
        reason,
        status,
        closed_at,
        closure_notes,
        created_by,
        closed_by
      FROM admissions
      ORDER BY created_at
    `);
    
    const awsAdmissions = awsAdmissionsResult.rows;
    console.log(`✅ ${awsAdmissions.length} admisiones obtenidas de AWS\n`);

    // 4. Obtener IDs de admisiones ya existentes en Supabase
    const existingIdsResult = await supabaseClient.query('SELECT id FROM admissions');
    const existingIds = new Set(existingIdsResult.rows.map(row => row.id));
    console.log(`📋 ${existingIds.size} admisiones ya existen en Supabase\n`);

    // 5. Filtrar admisiones que no existen en Supabase
    const admissionsToMigrate = awsAdmissions.filter(admission => !existingIds.has(admission.id));
    
    if (admissionsToMigrate.length === 0) {
      console.log('✅ Todas las admisiones ya están migradas');
      return;
    }

    console.log(`🔄 Migrando ${admissionsToMigrate.length} admisiones faltantes...\n`);

    // 6. Crear un mapa de historias clínicas para verificar que existen
    const mrIdsResult = await supabaseClient.query('SELECT id FROM medical_records');
    const validMrIds = new Set(mrIdsResult.rows.map(row => row.id));

    // 7. Crear un mapa de usuarios para verificar que existen
    const userIdsResult = await supabaseClient.query('SELECT id FROM users');
    const validUserIds = new Set(userIdsResult.rows.map(row => row.id));

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const admission of admissionsToMigrate) {
      try {
        // Verificar que la historia clínica existe
        if (!validMrIds.has(admission.medical_record_id)) {
          console.log(`⚠️  Saltando admisión ${admission.id} - HC ${admission.medical_record_id} no existe`);
          skipped++;
          continue;
        }

        // Verificar que el usuario creador existe (si está definido)
        if (admission.created_by && !validUserIds.has(admission.created_by)) {
          console.log(`⚠️  Admisión ${admission.id} - Usuario creador ${admission.created_by} no existe, usando NULL`);
          admission.created_by = null;
        }

        // Verificar que el usuario que cerró existe (si está definido)
        if (admission.closed_by && !validUserIds.has(admission.closed_by)) {
          console.log(`⚠️  Admisión ${admission.id} - Usuario cerrador ${admission.closed_by} no existe, usando NULL`);
          admission.closed_by = null;
        }

        // Insertar admisión en Supabase
        await supabaseClient.query(`
          INSERT INTO admissions (
            id,
            created_at,
            updated_at,
            deleted_at,
            medical_record_id,
            admission_date,
            admission_type,
            reason,
            status,
            closed_at,
            closure_notes,
            created_by,
            closed_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          admission.id,
          admission.created_at,
          admission.updated_at,
          admission.deleted_at,
          admission.medical_record_id,
          admission.admission_date,
          admission.admission_type,
          admission.reason,
          admission.status,
          admission.closed_at,
          admission.closure_notes,
          admission.created_by,
          admission.closed_by
        ]);

        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`✅ Migradas ${migrated}/${admissionsToMigrate.length} admisiones...`);
        }
      } catch (error) {
        console.error(`❌ Error al migrar admisión ${admission.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumen de Migración:');
    console.log(`✅ Migradas exitosamente: ${migrated}`);
    console.log(`⚠️  Saltadas (HC no existe): ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📋 Total en Supabase ahora: ${supabaseCount + migrated}`);

    // 8. Verificar conteo final
    const finalCountResult = await supabaseClient.query('SELECT COUNT(*) FROM admissions');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    console.log(`\n✅ Verificación final: ${finalCount} admisiones en Supabase`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await awsClient.end();
    await supabaseClient.end();
    console.log('\n🔌 Conexiones cerradas');
  }
}

migrateAdmissions();
