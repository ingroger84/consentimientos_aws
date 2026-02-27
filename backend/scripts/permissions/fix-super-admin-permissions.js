require('dotenv').config();
const { Client } = require('pg');

async function fixSuperAdminPermissions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'consentimientos',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Buscar el rol Super Admin
    console.log('=== VERIFICANDO ROL SUPER ADMIN ===\n');
    const roleResult = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE type = 'super_admin'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ Rol Super Admin no encontrado');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`Rol: ${role.name} (${role.type})`);
    console.log(`ID: ${role.id}\n`);

    // Parsear permisos actuales
    let currentPermissions = [];
    try {
      currentPermissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions;
      console.log(`Permisos actuales: ${currentPermissions.length}`);
    } catch (error) {
      console.log('⚠️  Error parseando permisos actuales');
    }

    // Lista completa de permisos para Super Admin
    const allPermissions = [
      'view_dashboard',
      'view_global_stats',
      'view_consents', 'create_consents', 'edit_consents', 'delete_consents', 'sign_consents', 'resend_consent_email',
      'view_templates', 'create_templates', 'edit_templates', 'delete_templates',
      'view_medical_records', 'create_medical_records', 'edit_medical_records', 'close_medical_records', 
      'delete_medical_records', 'sign_medical_records', 'export_medical_records',
      'view_mr_consent_templates', 'create_mr_consent_templates', 'edit_mr_consent_templates', 'delete_mr_consent_templates',
      'view_mr_consents', 'generate_mr_consents', 'delete_mr_consents',
      'view_clients', 'create_clients', 'edit_clients', 'delete_clients',
      'view_users', 'create_users', 'edit_users', 'delete_users', 'change_passwords',
      'view_roles', 'edit_roles',
      'view_branches', 'create_branches', 'edit_branches', 'delete_branches',
      'view_services', 'create_services', 'edit_services', 'delete_services',
      'view_questions', 'create_questions', 'edit_questions', 'delete_questions',
      'view_invoices',
      'view_settings', 'edit_settings',
      'manage_tenants',
    ];

    console.log(`\nAplicando ${allPermissions.length} permisos...\n`);

    // Actualizar permisos
    await client.query(`
      UPDATE roles
      SET permissions = $1::text
      WHERE id = $2
    `, [JSON.stringify(allPermissions), role.id]);

    console.log('✓ Permisos actualizados\n');

    // Verificar
    const verifyResult = await client.query(`
      SELECT permissions
      FROM roles
      WHERE id = $1
    `, [role.id]);

    const finalPermissions = typeof verifyResult.rows[0].permissions === 'string'
      ? JSON.parse(verifyResult.rows[0].permissions)
      : verifyResult.rows[0].permissions;

    console.log('=== VERIFICACIÓN FINAL ===\n');
    console.log(`✓ Total de permisos: ${finalPermissions.length}`);
    console.log('\nPermisos clave:');
    console.log(`  ✓ view_roles: ${finalPermissions.includes('view_roles')}`);
    console.log(`  ✓ edit_roles: ${finalPermissions.includes('edit_roles')}`);
    console.log(`  ✓ manage_tenants: ${finalPermissions.includes('manage_tenants')}`);
    console.log(`  ✓ view_global_stats: ${finalPermissions.includes('view_global_stats')}`);
    console.log(`  ✓ delete_mr_consents: ${finalPermissions.includes('delete_mr_consents')}`);

    console.log('\n=== INSTRUCCIONES ===\n');
    console.log('1. Cierra sesión como Super Admin');
    console.log('2. Limpia localStorage: localStorage.clear()');
    console.log('3. Vuelve a iniciar sesión');
    console.log('4. Ahora deberías poder ver y editar roles\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixSuperAdminPermissions();
