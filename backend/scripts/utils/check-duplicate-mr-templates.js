/**
 * Script: Verificar plantillas HC duplicadas
 * Identifica plantillas duplicadas por tenant
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function checkDuplicates() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar duplicados por tenant
    const duplicatesResult = await client.query(`
      SELECT 
        tenant_id,
        name,
        category,
        COUNT(*) as count,
        ARRAY_AGG(id ORDER BY created_at) as ids,
        ARRAY_AGG(created_at ORDER BY created_at) as dates
      FROM medical_record_consent_templates
      WHERE deleted_at IS NULL
      GROUP BY tenant_id, name, category
      HAVING COUNT(*) > 1
      ORDER BY tenant_id, name
    `);

    if (duplicatesResult.rows.length === 0) {
      console.log('✅ No se encontraron plantillas duplicadas\n');
      
      // Mostrar resumen por tenant
      const summaryResult = await client.query(`
        SELECT 
          COALESCE(t.name, 'Super Admin (Global)') as tenant_name,
          COALESCE(t.slug, 'global') as tenant_slug,
          COUNT(mrt.*) as template_count
        FROM medical_record_consent_templates mrt
        LEFT JOIN tenants t ON mrt.tenant_id = t.id
        WHERE mrt.deleted_at IS NULL
        GROUP BY t.name, t.slug, mrt.tenant_id
        ORDER BY mrt.tenant_id NULLS FIRST
      `);

      console.log('📊 Resumen de plantillas por tenant:\n');
      summaryResult.rows.forEach(row => {
        console.log(`   ${row.tenant_name} (${row.tenant_slug}): ${row.template_count} plantillas`);
      });

      return;
    }

    console.log(`⚠️  Se encontraron ${duplicatesResult.rows.length} grupos de plantillas duplicadas:\n`);

    for (const dup of duplicatesResult.rows) {
      // Obtener info del tenant
      let tenantInfo = 'Super Admin (Global)';
      if (dup.tenant_id) {
        const tenantResult = await client.query(
          'SELECT name, slug FROM tenants WHERE id = $1',
          [dup.tenant_id]
        );
        if (tenantResult.rows.length > 0) {
          tenantInfo = `${tenantResult.rows[0].name} (${tenantResult.rows[0].slug})`;
        }
      }

      console.log(`📋 Tenant: ${tenantInfo}`);
      console.log(`   Plantilla: "${dup.name}" (${dup.category})`);
      console.log(`   Duplicados: ${dup.count} copias`);
      console.log(`   IDs:`);
      
      dup.ids.forEach((id, index) => {
        const date = new Date(dup.dates[index]).toLocaleString('es-ES');
        const marker = index === 0 ? '✓ MANTENER' : '✗ ELIMINAR';
        console.log(`      ${marker} - ${id} (creado: ${date})`);
      });
      console.log('');
    }

    // Resumen
    const totalDuplicates = duplicatesResult.rows.reduce((sum, row) => sum + (row.count - 1), 0);
    console.log('='.repeat(60));
    console.log(`📊 Total de duplicados a eliminar: ${totalDuplicates}`);
    console.log('='.repeat(60));
    console.log('\n💡 Para eliminar los duplicados, ejecuta:');
    console.log('   node remove-duplicate-mr-templates.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDuplicates();
