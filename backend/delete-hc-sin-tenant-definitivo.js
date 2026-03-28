require('dotenv').config();
const { Client } = require('pg');

async function deleteHCSinTenant() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar plantillas HC sin tenant
    console.log('=== VERIFICANDO PLANTILLAS HC SIN TENANT ===');
    const checkResult = await client.query(`
      SELECT 
        id,
        name,
        category,
        is_active,
        is_default,
        tenant_id,
        deleted_at,
        created_at
      FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
      ORDER BY created_at DESC
    `);

    console.log(`Total encontradas: ${checkResult.rows.length}\n`);

    if (checkResult.rows.length === 0) {
      console.log('✅ No hay plantillas HC sin tenant. Todo está correcto.');
      return;
    }

    // Mostrar las plantillas que se van a eliminar
    console.log('Plantillas que se eliminarán:\n');
    checkResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Categoría: ${row.category}`);
      console.log(`   Activa: ${row.is_active}`);
      console.log(`   Soft Deleted: ${row.deleted_at ? 'Sí' : 'No'}`);
      console.log('');
    });

    // Eliminar PERMANENTEMENTE todas las plantillas sin tenant
    console.log('\n=== ELIMINANDO PLANTILLAS HC SIN TENANT (HARD DELETE) ===');
    const deleteResult = await client.query(`
      DELETE FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
      RETURNING id, name
    `);

    console.log(`\n✅ ${deleteResult.rows.length} plantillas eliminadas permanentemente:\n`);
    deleteResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (ID: ${row.id})`);
    });

    // Verificar que no queden plantillas sin tenant
    const verifyResult = await client.query(`
      SELECT COUNT(*) as total
      FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
    `);

    console.log(`\n\n=== VERIFICACIÓN FINAL ===`);
    console.log(`Plantillas HC sin tenant restantes: ${verifyResult.rows[0].total}`);

    if (verifyResult.rows[0].total === '0') {
      console.log('✅ ÉXITO: Todas las plantillas HC sin tenant han sido eliminadas');
    } else {
      console.log('⚠️ ADVERTENCIA: Aún quedan plantillas HC sin tenant');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

deleteHCSinTenant();
