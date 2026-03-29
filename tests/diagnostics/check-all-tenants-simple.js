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

    // 1. Ver estructura de la tabla tenants
    console.log('=== ESTRUCTURA DE TABLA TENANTS ===\n');
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas disponibles:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // 2. Contar todos los tenants
    const countResult = await client.query(`SELECT COUNT(*) as total FROM tenants`);
    console.log(`Total de tenants en BD: ${countResult.rows[0].total}\n`);

    // 3. Ver todos los tenants (usando SELECT *)
    const tenantsResult = await client.query(`
      SELECT * FROM tenants ORDER BY created_at DESC
    `);

    console.log('=== LISTA DE TODOS LOS TENANTS ===\n');
    tenantsResult.rows.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name || tenant.tenant_name || 'Sin nombre'}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Status: ${tenant.status}`);
      console.log(`   Plan: ${tenant.plan}`);
      console.log(`   Creado: ${tenant.created_at}`);
      console.log('');
    });

    // 4. Verificar tenants por estado
    const statusResult = await client.query(`
      SELECT status, COUNT(*) as count
      FROM tenants
      GROUP BY status
      ORDER BY count DESC
    `);

    console.log('=== TENANTS POR ESTADO ===\n');
    statusResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} tenant(s)`);
    });
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
