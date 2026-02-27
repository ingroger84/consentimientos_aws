require('dotenv').config();
const { Client } = require('pg');

async function checkAdminGeneralPermissions() {
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
    console.log('=== ROL ADMINISTRADOR GENERAL ===\n');
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

    // Parsear permisos
    let permissions = [];
    try {
      permissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions;
    } catch (error) {
      console.log('⚠️  Error parseando permisos');
      permissions = [];
    }

    console.log(`Total de permisos: ${permissions.length}\n`);

    // Verificar permisos relacionados con plantillas HC
    console.log('=== PERMISOS DE PLANTILLAS HC ===\n');
    
    const mrTemplatePermissions = [
      'view_mr_consent_templates',
      'create_mr_consent_templates',
      'edit_mr_consent_templates',
      'delete_mr_consent_templates',
    ];

    mrTemplatePermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`  ${has ? '✓' : '✗'} ${perm}`);
    });

    console.log('\n=== PERMISOS DE CONSENTIMIENTOS HC ===\n');
    
    const mrConsentPermissions = [
      'view_mr_consents',
      'generate_mr_consents',
      'delete_mr_consents',
    ];

    mrConsentPermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`  ${has ? '✓' : '✗'} ${perm}`);
    });

    console.log('\n=== TODOS LOS PERMISOS ===\n');
    if (permissions.length > 0) {
      permissions.forEach(perm => {
        console.log(`  - ${perm}`);
      });
    } else {
      console.log('  (ninguno)');
    }

    // Buscar usuario admin
    console.log('\n=== USUARIO ADMINISTRADOR ===\n');
    const userResult = await client.query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.type as role_type
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = 'admin@clinicademo.com'
    `);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`Usuario: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rol: ${user.role_name} (${user.role_type})`);
      console.log(`Role ID: ${user.role_id}`);
    } else {
      console.log('❌ Usuario admin@clinicademo.com no encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkAdminGeneralPermissions();
