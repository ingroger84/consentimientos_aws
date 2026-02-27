require('dotenv').config();
const { Client } = require('pg');

async function fixAllRolesPermissions() {
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

    // Definir permisos por rol
    const rolePermissions = {
      'super_admin': [
        'view_dashboard', 'view_global_stats',
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
      ],
      'ADMIN_GENERAL': [
        'view_dashboard',
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
        'view_invoices', 'pay_invoices',
        'view_settings', 'edit_settings', 'configure_email',
      ],
      'ADMIN_SEDE': [
        'view_dashboard',
        'view_consents', 'create_consents', 'edit_consents', 'delete_consents', 'sign_consents', 'resend_consent_email',
        'view_users', 'create_users', 'edit_users',
        'view_branches', 'view_services', 'view_questions',
        'view_clients', 'create_clients', 'edit_clients',
        'view_medical_records', 'create_medical_records', 'edit_medical_records', 'sign_medical_records',
        'view_settings',
      ],
      'OPERADOR': [
        'view_dashboard',
        'view_consents', 'create_consents', 'edit_consents', 'sign_consents', 'resend_consent_email',
        'view_branches', 'view_services', 'view_questions',
        'view_clients', 'create_clients', 'edit_clients',
        'view_templates',
        'view_medical_records', 'create_medical_records', 'edit_medical_records', 
        'close_medical_records', 'sign_medical_records', 'export_medical_records',
        'view_mr_consent_templates', 'create_mr_consent_templates', 'edit_mr_consent_templates',
        'generate_mr_consents', 'view_mr_consents',
        'view_invoices',
      ],
    };

    // Obtener todos los roles
    const rolesResult = await client.query(`
      SELECT id, name, type
      FROM roles
      ORDER BY type
    `);

    console.log(`Encontrados ${rolesResult.rows.length} roles\n`);

    for (const role of rolesResult.rows) {
      const permissions = rolePermissions[role.type];
      
      if (!permissions) {
        console.log(`⚠️  ${role.name} (${role.type}): Sin permisos definidos, saltando...`);
        continue;
      }

      console.log(`Actualizando ${role.name} (${role.type})...`);
      console.log(`  Permisos: ${permissions.length}`);

      await client.query(`
        UPDATE roles
        SET permissions = $1::text
        WHERE id = $2
      `, [JSON.stringify(permissions), role.id]);

      console.log(`  ✓ Actualizado\n`);
    }

    console.log('=== RESUMEN ===\n');
    console.log('Todos los roles han sido actualizados con el formato JSON correcto.\n');
    console.log('IMPORTANTE:');
    console.log('- Todos los usuarios deben cerrar sesión');
    console.log('- Limpiar localStorage');
    console.log('- Volver a iniciar sesión');
    console.log('- El nuevo JWT tendrá los permisos actualizados\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixAllRolesPermissions();
