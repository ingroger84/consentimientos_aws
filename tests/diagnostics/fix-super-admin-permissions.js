require('dotenv').config();
const { Client } = require('pg');

async function fixSuperAdminPermissions() {
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

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'rcaraballo@innovasystems.com.co';
    console.log(`Arreglando permisos de Super Admin: ${superAdminEmail}\n`);

    // 1. Buscar el usuario
    const userResult = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, [superAdminEmail]);

    if (userResult.rows.length === 0) {
      console.log('❌ No se encontró el usuario Super Admin');
      return;
    }

    const user = userResult.rows[0];
    console.log(`Usuario encontrado: ${user.id}\n`);

    // 2. Buscar el rol Super Admin
    const roleResult = await client.query(`
      SELECT * FROM roles WHERE name = 'Super Admin'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol Super Admin');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`Rol encontrado: ${role.id} - ${role.name}\n`);

    // 3. Todos los permisos del Super Admin
    const allPermissions = [
      'view_dashboard',
      'manage_users',
      'manage_roles',
      'manage_branches',
      'manage_services',
      'manage_clients',
      'manage_consents',
      'view_consents',
      'create_consents',
      'edit_consents',
      'delete_consents',
      'manage_medical_records',
      'view_medical_records',
      'create_medical_records',
      'edit_medical_records',
      'delete_medical_records',
      'reopen_medical_records',
      'manage_mr_consent_templates',
      'manage_consent_templates',
      'manage_tenants',
      'view_global_stats',
      'manage_plans',
      'manage_billing',
      'configure_email',
      'preview_email',
      'view_roles',
      'manage_profiles',
      'view_profiles'
    ];

    console.log('Permisos a asignar:');
    allPermissions.forEach(perm => console.log(`  - ${perm}`));
    console.log('');

    // 4. Actualizar el rol
    await client.query(`
      UPDATE roles
      SET permissions = $1
      WHERE id = $2
    `, [JSON.stringify(allPermissions), role.id]);

    console.log('✓ Rol actualizado\n');

    // 5. Actualizar el usuario
    await client.query(`
      UPDATE users
      SET 
        "roleId" = $1,
        permissions = $2
      WHERE id = $3
    `, [role.id, JSON.stringify(allPermissions), user.id]);

    console.log('✓ Usuario actualizado\n');

    // 6. Verificar
    const verifyResult = await client.query(`
      SELECT * FROM users WHERE id = $1
    `, [user.id]);

    const updatedUser = verifyResult.rows[0];
    console.log('=== VERIFICACIÓN ===\n');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Role ID: ${updatedUser.roleId}`);
    console.log(`\nPermisos actualizados:`);
    
    const userPermissions = updatedUser.permissions;
    if (Array.isArray(userPermissions)) {
      userPermissions.forEach(perm => console.log(`  ✓ ${perm}`));
      console.log(`\nTotal: ${userPermissions.length} permisos`);
    } else {
      console.log('  ⚠️  Formato incorrecto');
    }

    console.log('\n✓ Permisos de Super Admin arreglados exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixSuperAdminPermissions();
