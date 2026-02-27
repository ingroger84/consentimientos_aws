require('dotenv').config();
const { Pool } = require('pg');

// Configuración de AWS (base de datos antigua)
const awsPool = new Pool({
  host: '100.28.198.249',
  port: 5432,
  database: 'consentimientos_db',
  user: 'postgres',
  password: 'Innova2024!',
  ssl: false
});

// Configuración de Supabase (base de datos nueva)
const supabasePool = new Pool({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function migrateMRTemplates() {
  let awsClient;
  let supabaseClient;

  try {
    console.log('🔍 Conectando a base de datos AWS...');
    awsClient = await awsPool.connect();
    
    console.log('🔍 Conectando a Supabase...');
    supabaseClient = await supabasePool.connect();

    // 1. Verificar plantillas en AWS
    console.log('\n📋 Verificando plantillas de HC en AWS...');
    const awsTemplates = await awsClient.query(`
      SELECT * FROM mr_consent_templates 
      ORDER BY id
    `);
    
    console.log(`✅ Encontradas ${awsTemplates.rows.length} plantillas en AWS`);
    
    if (awsTemplates.rows.length === 0) {
      console.log('⚠️  No hay plantillas en AWS para migrar');
      return;
    }

    // Mostrar plantillas encontradas
    console.log('\n📄 Plantillas encontradas:');
    awsTemplates.rows.forEach(template => {
      console.log(`  - ID: ${template.id}, Nombre: ${template.name}, Tenant: ${template.tenant_id || 'Global'}`);
    });

    // 2. Verificar plantillas existentes en Supabase
    console.log('\n🔍 Verificando plantillas existentes en Supabase...');
    const supabaseTemplates = await supabaseClient.query(`
      SELECT id, name, tenant_id FROM mr_consent_templates
    `);
    
    console.log(`📊 Plantillas actuales en Supabase: ${supabaseTemplates.rows.length}`);

    // 3. Migrar plantillas
    console.log('\n🚀 Iniciando migración de plantillas...');
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const template of awsTemplates.rows) {
      try {
        // Verificar si ya existe
        const exists = await supabaseClient.query(
          'SELECT id FROM mr_consent_templates WHERE id = $1',
          [template.id]
        );

        if (exists.rows.length > 0) {
          console.log(`⏭️  Plantilla ${template.id} (${template.name}) ya existe, omitiendo...`);
          skipped++;
          continue;
        }

        // Insertar plantilla
        await supabaseClient.query(`
          INSERT INTO mr_consent_templates (
            id, name, description, content, is_active, 
            tenant_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          template.id,
          template.name,
          template.description,
          template.content,
          template.is_active !== false, // Default true si es null
          template.tenant_id,
          template.created_at || new Date(),
          template.updated_at || new Date()
        ]);

        console.log(`✅ Migrada: ${template.name} (ID: ${template.id})`);
        migrated++;

      } catch (error) {
        console.error(`❌ Error migrando plantilla ${template.id}:`, error.message);
        errors++;
      }
    }

    // 4. Actualizar secuencia
    if (migrated > 0) {
      console.log('\n🔄 Actualizando secuencia...');
      const maxId = await supabaseClient.query(`
        SELECT MAX(id) as max_id FROM mr_consent_templates
      `);
      
      if (maxId.rows[0].max_id) {
        await supabaseClient.query(`
          SELECT setval('mr_consent_templates_id_seq', $1, true)
        `, [maxId.rows[0].max_id]);
        console.log(`✅ Secuencia actualizada a ${maxId.rows[0].max_id}`);
      }
    }

    // 5. Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    const finalCount = await supabaseClient.query(`
      SELECT COUNT(*) as count FROM mr_consent_templates
    `);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Plantillas migradas: ${migrated}`);
    console.log(`⏭️  Plantillas omitidas: ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📋 Total en Supabase: ${finalCount.rows[0].count}`);
    console.log('='.repeat(60));

    // 6. Mostrar plantillas finales
    console.log('\n📄 Plantillas en Supabase:');
    const finalTemplates = await supabaseClient.query(`
      SELECT id, name, tenant_id, is_active 
      FROM mr_consent_templates 
      ORDER BY id
    `);
    
    finalTemplates.rows.forEach(template => {
      console.log(`  - ID: ${template.id}, Nombre: ${template.name}, Tenant: ${template.tenant_id || 'Global'}, Activo: ${template.is_active}`);
    });

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (awsClient) awsClient.release();
    if (supabaseClient) supabaseClient.release();
    await awsPool.end();
    await supabasePool.end();
  }
}

// Ejecutar migración
migrateMRTemplates()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  });
