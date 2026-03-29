require('dotenv').config();
const { Client } = require('pg');

async function checkAllTenants() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // 1. Contar todos los tenants
    console.log('=== VERIFICACIÓN DE TENANTS ===\n');
    
    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM tenants
    `);
    console.log(`Total de tenants en BD: ${countResult.rows[0].total}\n`);

    // 2. Ver todos los tenants con detalles
    const tenantsResult = await client.query(`
      SELECT 
        id,
        name,
        slug,
        status,
        plan,
        created_at,
        is_active
      FROM tenants
      ORDER BY created_at DESC
    `);

    console.log('=== LISTA DE TODOS LOS TENANTS ===\n');
    tenantsResult.rows.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Status: ${tenant.status}`);
      console.log(`   Plan: ${tenant.plan}`);
      console.log(`   Activo: ${tenant.is_active}`);
      console.log(`   Creado: ${tenant.created_at}`);
      console.log('');
    });

    // 3. Verificar tenants por estado
    const statusResult = await client.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tenants
      GROUP BY status
      ORDER BY count DESC
    `);

    console.log('=== TENANTS POR ESTADO ===\n');
    statusResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} tenant(s)`);
    });
    console.log('');

    // 4. Verificar tenants activos vs inactivos
    const activeResult = await client.query(`
      SELECT 
        is_active,
        COUNT(*) as count
      FROM tenants
      GROUP BY is_active
    `);

    console.log('=== TENANTS ACTIVOS/INACTIVOS ===\n');
    activeResult.rows.forEach(row => {
      console.log(`  ${row.is_active ? 'Activos' : 'Inactivos'}: ${row.count} tenant(s)`);
    });
    console.log('');

    // 5. Verificar si hay tenants con problemas
    const problemsResult = await client.query(`
      SELECT 
        id,
        name,
        slug,
        status,
        is_active
      FROM tenants
      WHERE is_active = false OR status = 'suspended'
    `);

    if (problemsResult.rows.length > 0) {
      console.log('=== TENANTS CON PROBLEMAS ===\n');
      problemsResult.rows.forEach(tenant => {
        console.log(`  ⚠️  ${tenant.name} (${tenant.slug})`);
        console.log(`      Status: ${tenant.status}, Activo: ${tenant.is_active}`);
      });
      console.log('');
    }

    // 6. Verificar índices en tabla tenants
    const indexResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'tenants'
      ORDER BY indexname
    `);

    console.log('=== ÍNDICES EN TABLA TENANTS ===\n');
    indexResult.rows.forEach(idx => {
      console.log(`  ✓ ${idx.indexname}`);
    });
    console.log('');

    // 7. Verificar si hay datos en otras tablas relacionadas
    const relatedResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM invoices) as invoices_count,
        (SELECT COUNT(*) FROM consents) as consents_count,
        (SELECT COUNT(*) FROM medical_records) as medical_records_count
    `);

    console.log('=== DATOS RELACIONADOS ===\n');
    const related = relatedResult.rows[0];
    console.log(`  Usuarios: ${related.users_count}`);
    console.log(`  Facturas: ${related.invoices_count}`);
    console.log(`  Consentimientos: ${related.consents_count}`);
    console.log(`  Historias Clínicas: ${related.medical_records_count}`);
    console.log('');

    console.log('✓ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkAllTenants();
