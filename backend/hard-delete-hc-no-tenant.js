require('dotenv').config();
const { Client } = require('pg');

async function hardDeleteHCNoTenant() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Verificar plantillas HC sin tenant (soft deleted)
    console.log('=== PLANTILLAS HC SIN TENANT (SOFT DELETED) ===');
    const softDeleted = await client.query(`
      SELECT 
        id,
        name,
        category,
        tenant_id,
        deleted_at
      FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
        AND deleted_at IS NOT NULL
      ORDER BY created_at DESC
    `);
    
    console.log(`Total plantillas a eliminar permanentemente: ${softDeleted.rows.length}\n`);
    
    if (softDeleted.rows.length > 0) {
      console.log('Plantillas que serán eliminadas PERMANENTEMENTE:');
      softDeleted.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (${row.category}) - ID: ${row.id}`);
      });

      console.log('\n⚠️  ADVERTENCIA: Esta operación NO se puede deshacer.');
      console.log('Estas plantillas serán eliminadas PERMANENTEMENTE de la base de datos.\n');

      // Eliminar permanentemente
      const deleteResult = await client.query(`
        DELETE FROM medical_record_consent_templates
        WHERE tenant_id IS NULL
          AND deleted_at IS NOT NULL
        RETURNING id, name
      `);

      console.log(`\n✅ ${deleteResult.rows.length} plantillas eliminadas PERMANENTEMENTE:`);
      deleteResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} - ID: ${row.id}`);
      });
    } else {
      console.log('✅ No hay plantillas HC sin tenant para eliminar');
    }

    // 2. Verificar estado final
    console.log('\n\n=== ESTADO FINAL ===');
    const finalState = await client.query(`
      SELECT 
        CASE 
          WHEN tenant_id IS NULL AND deleted_at IS NULL THEN 'Sin tenant - Activas'
          WHEN tenant_id IS NULL AND deleted_at IS NOT NULL THEN 'Sin tenant - Soft Deleted'
          WHEN tenant_id IS NOT NULL AND deleted_at IS NULL THEN 'Con tenant - Activas'
          WHEN tenant_id IS NOT NULL AND deleted_at IS NOT NULL THEN 'Con tenant - Soft Deleted'
        END as estado,
        COUNT(*) as total
      FROM medical_record_consent_templates
      GROUP BY estado
      ORDER BY estado
    `);
    
    finalState.rows.forEach(row => {
      console.log(`${row.estado}: ${row.total}`);
    });

    // 3. Verificar que no queden plantillas sin tenant
    const noTenantCount = await client.query(`
      SELECT COUNT(*) as count
      FROM medical_record_consent_templates
      WHERE tenant_id IS NULL
    `);

    if (parseInt(noTenantCount.rows[0].count) === 0) {
      console.log('\n✅ ÉXITO: No quedan plantillas HC sin tenant en la base de datos');
    } else {
      console.log(`\n⚠️  Aún quedan ${noTenantCount.rows[0].count} plantillas HC sin tenant`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

hardDeleteHCNoTenant()
  .then(() => {
    console.log('\n✅ Operación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en operación:', error);
    process.exit(1);
  });
