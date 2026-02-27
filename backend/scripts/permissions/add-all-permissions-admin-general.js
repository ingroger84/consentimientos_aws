require('dotenv').config();
const { Client } = require('pg');

async function addAllPermissionsToAdminGeneral() {
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

    // Buscar el rol Administrador General
    console.log('=== AGREGANDO PERMISOS AL ADMINISTRADOR GENERAL ===\n');
    const roleResult = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE type = 'ADMIN_GENERAL'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ Rol Administrador General no encontrado');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`Rol: ${role.name} (${role.type})`);
    console.log(`ID: ${role.id}\n`);

    // Lista completa de permisos para Administrador General
    const allPermissions = [
      // Dashboard
      'view_dashboard',
      
      // Consentimientos normales
      'view_consents',
      'create_consents',
      'edit_consents',
      'delete_consents',
      'sign_consents',
      'resend_consent_email',
      
      // Plantillas de consentimientos normales
      'view_templates',
      'create_templates',
      'edit_templates',
      'delete_templates',
      
      // Historias Clínicas
      'view_medical_records',
      'create_medical_records',
      'edit_medical_records',
      'close_medical_records',
      'delete_medical_records',
      'sign_medical_records',
      'export_medical_records',
      
      // Plantillas de consentimientos HC
      'view_mr_consent_templates',
      'create_mr_consent_templates',
      'edit_mr_consent_templates',
      'delete_mr_consent_templates',
      
      // Consentimientos HC
      'view_mr_consents',
      'generate_mr_consents',
      'delete_mr_consents',
      
      // Clientes
      'view_clients',
      'create_clients',
      'edit_clients',
      'delete_clients',
      
      // Usuarios
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      
      // Roles
      'view_roles',
      'create_roles',
      'edit_roles',
      'delete_roles',
      
      // Sedes
      'view_branches',
      'create_branches',
      'edit_branches',
      'delete_branches',
      
      // Servicios
      'view_services',
      'create_services',
      'edit_services',
      'delete_services',
      
      // Preguntas
      'view_questions',
      'create_questions',
      'edit_questions',
      'delete_questions',
      
      // Facturas
      'view_invoices',
      'create_invoices',
      'edit_invoices',
      'delete_invoices',
      'pay_invoices',
      
      // Configuración
      'edit_settings',
      'view_settings',
      
      // Planes
      'view_plans',
      'edit_plans',
      
      // Notificaciones
      'view_notifications',
      'mark_notifications_read',
    ];

    console.log(`Agregando ${allPermissions.length} permisos...\n`);

    // Actualizar permisos
    await client.query(`
      UPDATE roles
      SET permissions = $1
      WHERE id = $2
    `, [JSON.stringify(allPermissions), role.id]);

    console.log('✓ Permisos actualizados exitosamente\n');

    // Verificar permisos finales
    const verifyResult = await client.query(`
      SELECT permissions
      FROM roles
      WHERE id = $1
    `, [role.id]);

    const finalPermissions = typeof verifyResult.rows[0].permissions === 'string'
      ? JSON.parse(verifyResult.rows[0].permissions)
      : verifyResult.rows[0].permissions;

    console.log('=== PERMISOS FINALES ===\n');
    console.log(`Total de permisos: ${finalPermissions.length}\n`);

    // Mostrar permisos por categoría
    console.log('Permisos de Plantillas HC:');
    const mrTemplatePerms = finalPermissions.filter(p => p.includes('mr_consent_templates'));
    mrTemplatePerms.forEach(p => console.log(`  ✓ ${p}`));
    
    console.log('\nPermisos de Consentimientos HC:');
    const mrConsentPerms = finalPermissions.filter(p => p.includes('mr_consents'));
    mrConsentPerms.forEach(p => console.log(`  ✓ ${p}`));
    
    console.log('\nPermisos de Historias Clínicas:');
    const mrPerms = finalPermissions.filter(p => p.includes('medical_records'));
    mrPerms.forEach(p => console.log(`  ✓ ${p}`));

    console.log('\n=== INSTRUCCIONES ===\n');
    console.log('1. Cierra sesión en el navegador');
    console.log('2. Vuelve a iniciar sesión como Administrador General');
    console.log('3. Ahora tendrás acceso completo a todas las funcionalidades\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

addAllPermissionsToAdminGeneral();
