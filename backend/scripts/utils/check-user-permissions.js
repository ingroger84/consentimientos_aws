// Script para verificar permisos de un usuario
const { Client } = require('pg');

async function checkPermissions() {
  console.log('=== Verificando permisos de usuario ===\n');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'consentimientos',
    user: 'admin',
    password: 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Buscar el usuario operador1
    const userResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        r.name as role_name,
        r.type as role_type,
        r.permissions,
        t.name as tenant_name,
        t.slug as tenant_slug
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      LEFT JOIN tenants t ON u."tenantId" = t.id
      WHERE u.email = 'operador1@demo-clinica.com'
      AND u.deleted_at IS NULL
    `);

    if (userResult.rows.length === 0) {
      console.log('✗ Usuario no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('Usuario encontrado:');
    console.log(`  Nombre: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rol: ${user.role_name} (${user.role_type})`);
    console.log(`  Tenant: ${user.tenant_name} (${user.tenant_slug})`);
    console.log('\nPermisos del rol:');
    
    // Parsear permissions si es string
    let permissions = user.permissions || [];
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        permissions = [];
      }
    }
    
    if (permissions.length === 0) {
      console.log('  ✗ No tiene permisos asignados');
    } else {
      permissions.forEach(perm => {
        const hasViewTemplates = perm === 'view_templates';
        const icon = hasViewTemplates ? '✓' : '  ';
        console.log(`  ${icon} ${perm}`);
      });
    }

    // Verificar si tiene el permiso view_templates
    const hasViewTemplates = permissions.includes('view_templates');
    console.log(`\n${hasViewTemplates ? '✓' : '✗'} Permiso 'view_templates': ${hasViewTemplates ? 'SÍ' : 'NO'}`);

    if (!hasViewTemplates) {
      console.log('\n⚠️  El usuario NO tiene permiso para ver plantillas');
      console.log('   Necesitas agregar el permiso "view_templates" al rol del usuario');
    }

    // Mostrar todos los roles disponibles
    console.log('\n--- Roles disponibles en el tenant ---');
    const rolesResult = await client.query(`
      SELECT 
        id,
        name,
        type,
        permissions
      FROM roles
      WHERE deleted_at IS NULL
      AND (
        type = 'super_admin'
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users."roleId" = roles.id 
          AND users."tenantId" = $1
        )
      )
      ORDER BY name
    `, [user.id]);

    rolesResult.rows.forEach(role => {
      let rolePermissions = role.permissions || [];
      if (typeof rolePermissions === 'string') {
        try {
          rolePermissions = JSON.parse(rolePermissions);
        } catch (e) {
          rolePermissions = [];
        }
      }
      const hasViewTemplates = rolePermissions.includes('view_templates');
      console.log(`\n  Rol: ${role.name} (${role.type})`);
      console.log(`    view_templates: ${hasViewTemplates ? '✓ SÍ' : '✗ NO'}`);
      console.log(`    Total permisos: ${rolePermissions.length}`);
    });

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkPermissions();
