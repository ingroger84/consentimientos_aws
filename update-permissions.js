const { DataSource } = require('typeorm');
require('dotenv').config({ path: './backend/.env' });

// Definir los permisos actualizados
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'view_dashboard',
    'view_global_stats',
    'view_consents',
    'create_consents',
    'edit_consents',
    'delete_consents',
    'sign_consents',
    'resend_consent_email',
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
    'view_questions',
    'create_questions',
    'edit_questions',
    'delete_questions',
    'view_clients',
    'create_clients',
    'edit_clients',
    'delete_clients',
    'view_templates',
    'create_templates',
    'edit_templates',
    'delete_templates',
    'view_mr_consent_templates',
    'create_mr_consent_templates',
    'edit_mr_consent_templates',
    'delete_mr_consent_templates',
    'generate_mr_consents',
    'view_mr_consents',
    'delete_mr_consents',
    'view_medical_records',
    'create_medical_records',
    'edit_medical_records',
    'delete_medical_records',
    'close_medical_records',
    'sign_medical_records',
    'export_medical_records',
    'view_settings',
    'edit_settings',
    'manage_tenants',
  ],

  ADMIN_GENERAL: [
    'view_dashboard',
    'view_consents',
    'create_consents',
    'edit_consents',
    'delete_consents',
    'sign_consents',
    'resend_consent_email',
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
    'view_questions',
    'create_questions',
    'edit_questions',
    'delete_questions',
    'view_clients',
    'create_clients',
    'edit_clients',
    'delete_clients',
    'view_templates',
    'create_templates',
    'edit_templates',
    'delete_templates',
    'view_mr_consent_templates',
    'create_mr_consent_templates',
    'edit_mr_consent_templates',
    'delete_mr_consent_templates',
    'generate_mr_consents',
    'view_mr_consents',
    'delete_mr_consents',
    'view_medical_records',
    'create_medical_records',
    'edit_medical_records',
    'delete_medical_records',
    'close_medical_records',
    'sign_medical_records',
    'export_medical_records',
    'view_settings',
    'edit_settings',
    'configure_email',
    'view_invoices',
    'pay_invoices',
  ],

  ADMIN_SEDE: [
    'view_dashboard',
    'view_consents',
    'create_consents',
    'edit_consents',
    'delete_consents',
    'sign_consents',
    'resend_consent_email',
    'view_users',
    'create_users',
    'edit_users',
    'view_branches',
    'view_services',
    'view_questions',
    'view_clients',
    'create_clients',
    'edit_clients',
    'view_medical_records',
    'create_medical_records',
    'edit_medical_records',
    'sign_medical_records',
    'view_settings',
  ],

  OPERADOR: [
    'view_dashboard',
    'view_consents',
    'create_consents',
    'sign_consents',
    'resend_consent_email',
    'view_services',
    'view_branches',
    'view_clients',
    'create_clients',
    'view_medical_records',
    'create_medical_records',
    'sign_medical_records',
  ],
};

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function updatePermissions() {
  try {
    await dataSource.initialize();
    console.log('✓ Conectado a la base de datos');
    
    // Obtener todos los roles
    const roles = await dataSource.query('SELECT id, name, type FROM roles');
    
    console.log('\n=== Roles encontrados ===');
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.type})`);
    });
    
    console.log('\n=== Actualizando permisos ===');
    
    for (const role of roles) {
      let permissions = [];
      
      switch (role.type) {
        case 'super_admin':
          permissions = ROLE_PERMISSIONS.SUPER_ADMIN;
          break;
        case 'ADMIN_GENERAL':
          permissions = ROLE_PERMISSIONS.ADMIN_GENERAL;
          break;
        case 'ADMIN_SEDE':
          permissions = ROLE_PERMISSIONS.ADMIN_SEDE;
          break;
        case 'OPERADOR':
          permissions = ROLE_PERMISSIONS.OPERADOR;
          break;
        default:
          console.log(`⚠ Tipo de rol desconocido: ${role.type}`);
          continue;
      }
      
      const permissionsString = permissions.join(',');
      
      await dataSource.query(
        'UPDATE roles SET permissions = $1 WHERE id = $2',
        [permissionsString, role.id]
      );
      
      console.log(`✓ ${role.name}: ${permissions.length} permisos actualizados`);
    }
    
    console.log('\n=== Verificación ===');
    const updatedRoles = await dataSource.query(
      'SELECT name, type, LENGTH(permissions) as perm_length, LEFT(permissions, 100) as perm_preview FROM roles ORDER BY name'
    );
    
    updatedRoles.forEach(role => {
      console.log(`\n${role.name} (${role.type}):`);
      console.log(`  Longitud: ${role.perm_length} caracteres`);
      console.log(`  Preview: ${role.perm_preview}...`);
    });
    
    console.log('\n✅ Permisos actualizados exitosamente');
    
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePermissions();
