/**
 * Script: Verificar permisos del usuario admin
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function checkAdminPermissions() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Obtener el tenant demo-medico
    const tenantResult = await client.query(
      `SELECT id, name, slug FROM tenants WHERE slug = 'demo-medico'`
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant demo-medico no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`✓ Tenant: ${tenant.name} (${tenant.slug})\n`);

    // Obtener el usuario admin
    const userResult = await client.query(
      `SELECT u.id, u.name, u.email, u."roleId", r.name as role_name, r.permissions
       FROM users u
       JOIN roles r ON u."roleId" = r.id
       WHERE u."tenantId" = $1 AND u.email = $2`,
      [tenant.id, 'admin@clinicademo.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin@clinicademo.com no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log(`✓ Usuario: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rol: ${user.role_name}`);
    console.log(`  Total permisos: ${user.permissions.length}\n`);

    // Verificar permisos específicos
    const requiredPermissions = [
      'view_roles',
      'edit_roles',
      'view_mr_consent_templates',
      'create_mr_consent_templates',
      'edit_mr_consent_templates',
      'delete_mr_consent_templates',
      'generate_mr_consents',
      'view_mr_consents',
    ];

    console.log('📋 Verificando permisos requeridos:\n');
    requiredPermissions.forEach((perm) => {
      const has = user.permissions.includes(perm);
      console.log(`   ${has ? '✅' : '❌'} ${perm}`);
    });

    console.log('\n📋 Todos los permisos del usuario:');
    user.permissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkAdminPermissions();
