const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración AWS RDS
const awsClient = new Client({
  host: '18.206.200.237',
  port: 5432,
  user: 'postgres',
  password: 'Innova2024*',
  database: 'consentimientos',
  ssl: false,
});

// Configuración Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://witvuzaarlqxkiqfiljq.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateAdmissions() {
  try {
    console.log('🔍 Conectando a AWS RDS...');
    await awsClient.connect();
    console.log('✅ Conectado a AWS RDS\n');

    // 1. Obtener todas las admisiones de AWS
    console.log('📊 Obteniendo admisiones de AWS...');
    const awsResult = await awsClient.query(`
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
        discharge_date,
        discharge_summary,
        closure_notes,
        created_by,
        closed_by
      FROM admissions
      ORDER BY created_at
    `);
    
    const awsAdmissions = awsResult.rows;
    console.log(`✅ Admisiones en AWS: ${awsAdmissions.length}\n`);

    // 2. Obtener todas las admisiones de Supabase
    console.log('📊 Obteniendo admisiones de Supabase...');
    const { data: supabaseAdmissions, error: supabaseError } = await supabase
      .from('admissions')
      .select('id');

    if (supabaseError) {
      console.error('❌ Error al obtener admisiones de Supabase:', supabaseError);
      return;
    }

    console.log(`✅ Admisiones en Supabase: ${supabaseAdmissions.length}\n`);

    // 3. Crear un Set con los IDs de Supabase para búsqueda rápida
    const supabaseIds = new Set(supabaseAdmissions.map(a => a.id));

    // 4. Filtrar admisiones que NO están en Supabase
    const missingAdmissions = awsAdmissions.filter(a => !supabaseIds.has(a.id));
    console.log(`📋 Admisiones faltantes en Supabase: ${missingAdmissions.length}\n`);

    if (missingAdmissions.length === 0) {
      console.log('✅ Todas las admisiones ya están migradas');
      return;
    }

    // 5. Mostrar resumen de admisiones faltantes
    console.log('📝 Resumen de admisiones faltantes:');
    const byType = {};
    missingAdmissions.forEach(a => {
      byType[a.admission_type] = (byType[a.admission_type] || 0) + 1;
    });
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    console.log('');

    // 6. Verificar que las historias clínicas existen en Supabase
    console.log('🔍 Verificando historias clínicas en Supabase...');
    const uniqueMrIds = [...new Set(missingAdmissions.map(a => a.medical_record_id))];
    const { data: existingMRs, error: mrError } = await supabase
      .from('medical_records')
      .select('id')
      .in('id', uniqueMrIds);

    if (mrError) {
      console.error('❌ Error al verificar historias clínicas:', mrError);
      return;
    }

    const existingMRIds = new Set(existingMRs.map(mr => mr.id));
    console.log(`✅ Historias clínicas encontradas: ${existingMRIds.size}/${uniqueMrIds.length}\n`);

    // 7. Filtrar admisiones cuyas HC existen en Supabase
    const admissionsToMigrate = missingAdmissions.filter(a => 
      existingMRIds.has(a.medical_record_id)
    );

    console.log(`📋 Admisiones a migrar (con HC válida): ${admissionsToMigrate.length}\n`);

    if (admissionsToMigrate.length === 0) {
      console.log('⚠️  No hay admisiones para migrar (todas las HC asociadas no existen en Supabase)');
      return;
    }

    // 8. Migrar admisiones en lotes
    const BATCH_SIZE = 50;
    let migrated = 0;
    let errors = 0;

    for (let i = 0; i < admissionsToMigrate.length; i += BATCH_SIZE) {
      const batch = admissionsToMigrate.slice(i, i + BATCH_SIZE);
      
      console.log(`📦 Migrando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(admissionsToMigrate.length / BATCH_SIZE)} (${batch.length} admisiones)...`);

      // Preparar datos para inserción
      const admissionsData = batch.map(a => ({
        id: a.id,
        created_at: a.created_at,
        updated_at: a.updated_at,
        deleted_at: a.deleted_at,
        medical_record_id: a.medical_record_id,
        admission_date: a.admission_date,
        admission_type: a.admission_type,
        reason: a.reason,
        status: a.status,
        discharge_date: a.discharge_date,
        discharge_summary: a.discharge_summary,
        closure_notes: a.closure_notes,
        created_by: a.created_by,
        closed_by: a.closed_by,
      }));

      const { data, error } = await supabase
        .from('admissions')
        .insert(admissionsData);

      if (error) {
        console.error(`   ❌ Error en lote:`, error.message);
        errors += batch.length;
      } else {
        console.log(`   ✅ Lote migrado exitosamente`);
        migrated += batch.length;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total en AWS:              ${awsAdmissions.length}`);
    console.log(`Total en Supabase (antes): ${supabaseAdmissions.length}`);
    console.log(`Faltantes detectadas:      ${missingAdmissions.length}`);
    console.log(`Con HC válida:             ${admissionsToMigrate.length}`);
    console.log(`Migradas exitosamente:     ${migrated}`);
    console.log(`Errores:                   ${errors}`);
    console.log(`Total en Supabase (ahora): ${supabaseAdmissions.length + migrated}`);
    console.log('='.repeat(60));

    // 9. Verificar conteo final
    console.log('\n🔍 Verificando conteo final...');
    const { count: finalCount, error: countError } = await supabase
      .from('admissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar admisiones:', countError);
    } else {
      console.log(`✅ Total de admisiones en Supabase: ${finalCount}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await awsClient.end();
    console.log('\n✅ Conexión a AWS cerrada');
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de admisiones AWS → Supabase\n');
migrateAdmissions();
