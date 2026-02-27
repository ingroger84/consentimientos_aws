const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123'
});

async function checkTemplates() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos');

    // Obtener tenant demo-medico
    const tenantResult = await client.query(
      `SELECT id, name, slug FROM tenants WHERE slug = 'demo-medico'`
    );
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant demo-medico no encontrado');
      return;
    }
    
    const tenant = tenantResult.rows[0];
    console.log('\n✓ Tenant encontrado:');
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Name: ${tenant.name}`);
    console.log(`  Slug: ${tenant.slug}`);

    // Obtener plantillas HC del tenant
    const templatesResult = await client.query(
      `SELECT id, name, category, tenant_id, is_active, created_at 
       FROM medical_record_consent_templates 
       WHERE tenant_id = $1 AND deleted_at IS NULL 
       ORDER BY created_at DESC`,
      [tenant.id]
    );

    console.log(`\n✓ Plantillas HC del tenant (${templatesResult.rows.length}):`);
    templatesResult.rows.forEach((t, i) => {
      console.log(`\n  ${i + 1}. ${t.name}`);
      console.log(`     ID: ${t.id}`);
      console.log(`     Category: ${t.category}`);
      console.log(`     Active: ${t.is_active}`);
      console.log(`     TenantId: ${t.tenant_id}`);
    });

    // Verificar plantillas globales
    const globalResult = await client.query(
      `SELECT id, name, category, is_active 
       FROM medical_record_consent_templates 
       WHERE tenant_id IS NULL AND deleted_at IS NULL 
       ORDER BY created_at DESC`
    );

    console.log(`\n✓ Plantillas HC globales (${globalResult.rows.length}):`);
    globalResult.rows.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name} (${t.category})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplates();
