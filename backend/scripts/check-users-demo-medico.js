/**
 * Script para verificar usuarios del tenant demo-medico
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'consentimientos',
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Buscar el tenant demo-medico
    const tenantResult = await client.query(`
      SELECT id, name, slug, status
      FROM tenants
      WHERE slug = 'demo-medico'
      AND deleted_at IS NULL
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ No se encontró el tenant "demo-medico"');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('✓ Tenant encontrado:');
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Nombre: ${tenant.name}`);
    console.log(`  Slug: ${tenant.slug}`);
    console.log(`  Status: ${tenant.status}\n`);

    // Buscar usuarios del tenant
    const usersResult = await client.query(`
      SELECT u.id, u.name, u.email, r.name as role_name, r.type as role_type
      FROM users u
      INNER JOIN roles r ON u."roleId" = r.id
      WHERE u."tenantId" = $1
      AND u.deleted_at IS NULL
      ORDER BY u.created_at ASC
    `, [tenant.id]);

    if (usersResult.rows.length === 0) {
      console.log('❌ No se encontraron usuarios para este tenant');
      return;
    }

    console.log(`✓ Usuarios del tenant (${usersResult.rows.length}):\n`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role_name} (${user.role_type})`);
      console.log(`   ID: ${user.id}\n`);
    });

    console.log('\n📝 Para iniciar sesión usa:');
    console.log(`   Email: ${usersResult.rows[0].email}`);
    console.log(`   Contraseña: La que configuraste al crear el tenant`);
    console.log(`   URL: http://demo-medico.localhost:5173/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
