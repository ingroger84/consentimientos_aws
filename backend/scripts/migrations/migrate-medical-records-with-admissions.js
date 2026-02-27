const { Client } = require('pg');
require('dotenv').config();

// Configuración AWS (base de datos antigua)
const awsClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
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

async function migrateMedicalRecordsWithAdmissions() {
  try {
    console.log('🔄 Conectando a las bases de datos...\n');
    
    await awsClient.connect();
    console.log('✅ Conectado a AWS');
    
    await supabaseClient.connect();
    console.log('✅ Conectado a Supabase\n');

    // 1. Contar historias clínicas en AWS
    const awsCountResult = await awsClient.query('SELECT COUNT(*) FROM medical_records');
    const awsCount = parseInt(awsCountResult.rows[0].count);
    console.log(`📊 Historias clínicas en AWS: ${awsCount}`);

    // 2. Contar historias clínicas en Supabase
    const supabaseCountResult = await supabaseClient.query('SELECT COUNT(*) FROM medical_records');
    const supabaseCount = parseInt(supabaseCountResult.rows[0].count);
    console.log(`📊 Historias clínicas en Supabase: ${supabaseCount}\n`);

    if (awsCount === 0) {
      console.log('⚠️  No hay historias clínicas en AWS para migrar');
      return;
    }

    // 3. Obtener todas las historias clínicas de AWS
    console.log('📥 Obteniendo historias clínicas de AWS...');
    const awsMRResult = await awsClient.query(`
      SELECT 
        id,
        created_at,
        updated_at,
        deleted_at,
        client_id,
        branch_id,
        admission_date,
        admission_type,
        record_number,
        status,
        is_locked,
        closed_at,
        closed_by,
        created_by,
        tenant_id
      FROM medical_records
      WHERE deleted_at IS NULL
      ORDER BY created_at
    `);
    
    const awsMedicalRecords = awsMRResult.rows;
    console.log(`✅ ${awsMedicalRecords.length} historias clínicas obtenidas de AWS\n`);

    // 4. Obtener IDs de HC ya existentes en Supabase
    const existingIdsResult = await supabaseClient.query('SELECT id FROM medical_records');
    const existingIds = new Set(existingIdsResult.rows.map(row => row.id));
    console.log(`📋 ${existingIds.size} historias clínicas ya existen en Supabase\n`);

    // 5. Filtrar HC que no existen en Supabase
    const mrToMigrate = awsMedicalRecords.filter(mr => !existingIds.has(mr.id));
    
    if (mrToMigrate.length === 0) {
      console.log('✅ Todas las historias clínicas ya están migradas');
      return;
    }

    console.log(`🔄 Migrando ${mrToMigrate.length} historias clínicas faltantes...\n`);

    // 6. Crear mapas de validación
    const clientIdsResult = await supabaseClient.query('SELECT id FROM clients');
    const validClientIds = new Set(clientIdsResult.rows.map(row => row.id));

    const branchIdsResult = await supabaseClient.query('SELECT id FROM branches');
    const validBranchIds = new Set(branchIdsResult.rows.map(row => row.id));

    const userIdsResult = await supabaseClient.query('SELECT id FROM users');
    const validUserIds = new Set(userIdsResult.rows.map(row => row.id));

    const tenantIdsResult = await supabaseClient.query('SELECT id FROM tenants');
    const validTenantIds = new Set(tenantIdsResult.rows.map(row => row.id));

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    let admissionsCreated = 0;

    for (const mr of mrToMigrate) {
      try {
        // Validaciones
        if (!validClientIds.has(mr.client_id)) {
          console.log(`⚠️  Saltando HC ${mr.id} - Cliente ${mr.client_id} no existe`);
          skipped++;
          continue;
        }

        if (!validTenantIds.has(mr.tenant_id)) {
          console.log(`⚠️  Saltando HC ${mr.id} - Tenant ${mr.tenant_id} no existe`);
          skipped++;
          continue;
        }

        // Ajustar referencias opcionales
        if (mr.branch_id && !validBranchIds.has(mr.branch_id)) {
          console.log(`⚠️  HC ${mr.id} - Sede ${mr.branch_id} no existe, usando NULL`);
          mr.branch_id = null;
        }

        if (mr.created_by && !validUserIds.has(mr.created_by)) {
          console.log(`⚠️  HC ${mr.id} - Usuario creador ${mr.created_by} no existe, usando NULL`);
          mr.created_by = null;
        }

        if (mr.closed_by && !validUserIds.has(mr.closed_by)) {
          console.log(`⚠️  HC ${mr.id} - Usuario cerrador ${mr.closed_by} no existe, usando NULL`);
          mr.closed_by = null;
        }

        // Insertar HC en Supabase
        await supabaseClient.query(`
          INSERT INTO medical_records (
            id,
            created_at,
            updated_at,
            deleted_at,
            client_id,
            branch_id,
            admission_date,
            admission_type,
            record_number,
            status,
            is_locked,
            closed_at,
            closed_by,
            created_by,
            tenant_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          mr.id,
          mr.created_at,
          mr.updated_at,
          mr.deleted_at,
          mr.client_id,
          mr.branch_id,
          mr.admission_date,
          mr.admission_type,
          mr.record_number,
          mr.status,
          mr.is_locked,
          mr.closed_at,
          mr.closed_by,
          mr.created_by,
          mr.tenant_id
        ]);

        migrated++;

        // Crear admisión automática para esta HC
        try {
          const admissionIdResult = await supabaseClient.query('SELECT gen_random_uuid() as id');
          const admissionId = admissionIdResult.rows[0].id;

          await supabaseClient.query(`
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
            admissionId,
            mr.id,
            mr.admission_date,
            mr.admission_type,
            'Primera admisión - Apertura de Historia Clínica (migración automática)',
            mr.status === 'closed' ? 'closed' : 'open',
            mr.created_by,
            mr.created_at,
            mr.created_at
          ]);

          admissionsCreated++;
        } catch (admError) {
          console.error(`⚠️  Error al crear admisión para HC ${mr.id}:`, admError.message);
        }

        if (migrated % 5 === 0) {
          console.log(`✅ Migradas ${migrated}/${mrToMigrate.length} HC...`);
        }
      } catch (error) {
        console.error(`❌ Error al migrar HC ${mr.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumen de Migración:');
    console.log(`✅ HC migradas exitosamente: ${migrated}`);
    console.log(`✅ Admisiones creadas: ${admissionsCreated}`);
    console.log(`⚠️  HC saltadas: ${skipped}`);
    console.log(`❌ Errores: ${errors}`);

    // Verificar conteo final
    const finalMRCountResult = await supabaseClient.query('SELECT COUNT(*) FROM medical_records');
    const finalMRCount = parseInt(finalMRCountResult.rows[0].count);
    console.log(`\n✅ Total HC en Supabase: ${finalMRCount}`);

    const finalAdmCountResult = await supabaseClient.query('SELECT COUNT(*) FROM admissions');
    const finalAdmCount = parseInt(finalAdmCountResult.rows[0].count);
    console.log(`✅ Total admisiones en Supabase: ${finalAdmCount}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await awsClient.end();
    await supabaseClient.end();
    console.log('\n🔌 Conexiones cerradas');
  }
}

migrateMedicalRecordsWithAdmissions();
