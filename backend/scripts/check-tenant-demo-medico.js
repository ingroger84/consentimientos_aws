/**
 * Script para verificar si el tenant demo-medico existe
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkTenant() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'consentimientos',
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos');

    // Buscar el tenant demo-medico
    const result = await client.query(`
      SELECT id, name, slug, status, plan, created_at
      FROM tenants
      WHERE slug = 'demo-medico'
      AND deleted_at IS NULL
    `);

    if (result.rows.length === 0) {
      console.log('\n❌ ERROR: No se encontró el tenant "demo-medico"');
      console.log('\nTenants disponibles:');
      
      const allTenants = await client.query(`
        SELECT id, name, slug, status
        FROM tenants
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `);
      
      allTenants.rows.forEach(tenant => {
        console.log(`  - ${tenant.slug} (${tenant.name}) - Status: ${tenant.status}`);
      });
    } else {
      const tenant = result.rows[0];
      console.log('\n✓ Tenant encontrado:');
      console.log(`  ID: ${tenant.id}`);
      console.log(`  Nombre: ${tenant.name}`);
      console.log(`  Slug: ${tenant.slug}`);
      console.log(`  Status: ${tenant.status}`);
      console.log(`  Plan: ${tenant.plan}`);
      console.log(`  Creado: ${tenant.created_at}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTenant();
