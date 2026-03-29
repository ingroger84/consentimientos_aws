require('dotenv').config();
const { Client } = require('pg');

async function fixSuperAdminFinal() {
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

    // Todos los permisos del Super Administrador
    const allPermissions = [
      'view_dashboard',
      'view_global_stats',
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      'change_passwords',
      'view_roles',
      'edit_roles',
      'view_branches',
      'create_branches',
      'edit_branches',
      'delete_branches',
      'view_services',
      'create_services',
      'edit_services',
      'delete_services',
      'view_clients',
      'create_clients',
      'edit_clients',
      'delete_clients',
      'view_consents',
      'create_consents',
      'edit_consents',
      'delete_consents',
      'view_medical_records',
      'create_medical_records',
      'edit_medical_records',
      'delete_medical_records',
      'reopen_medical_records',
      'manage_mr_consent_templates',
      'manage_consent_templates',
      'manage_tenants',
      'manage_users',
      'manage_roles',
      'manage_plans',
      'manage_billing',
      'configure_email',
      'preview_email',
      'manage_profiles',
      'view_profiles'
    ];

    console.log(`Permisos a asignar: ${allPermissions.length}\n`);

    // Convertir a formato CSV (como está guardado en la BD)
    const permissionsCSV = allPermissions.join(',');

    // Actualizar el rol Super Administrador
    await client.query(`
      UPDATE roles
      SET permissions = $1
      WHERE name = 'Super Administrador'
    `, [permissionsCSV]);

    console.log('✓ Rol Super Administrador actualizado\n');

    // Verificar
    const verifyResult = await client.query(`
      SELECT * FROM roles WHERE name = 'Super Administrador'
    `);

    if (verifyResult.rows.length > 0) {
      const role = verifyResult.rows[0];
      const permissions = role.permissions.split(',').map(p => p.trim());
      
      console.log('=== VERIFICACIÓN ===\n');
      console.log(`Total de permisos: ${permissions.length}`);
      
      const keyPermissions = [
        'manage_tenants',
        'view_global_stats',
        'manage_users',
        'manage_roles',
        'manage_plans',
        'manage_billing'
      ];
      
      console.log('\nPermisos clave:');
      keyPermissions.forEach(perm => {
        const has = permissions.includes(perm);
        console.log(`  ${has ? '✓' : '❌'} ${perm}`);
      });
    }

    console.log('\n✓ Permisos arreglados exitosamente');
    console.log('\n⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión');
    console.log('   1. Cerrar sesión en el navegador');
    console.log('   2. Limpiar caché del navegador (Ctrl+Shift+Del)');
    console.log('   3. Volver a iniciar sesión');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixSuperAdminFinal();
