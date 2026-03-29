require('dotenv').config();
const { Client } = require('pg');

async function checkSuperAdminRole() {
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

    // Buscar el rol Super Administrador
    const roleResult = await client.query(`
      SELECT * FROM roles WHERE name = 'Super Administrador'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol Super Administrador');
      return;
    }

    const role = roleResult.rows[0];
    console.log('=== ROL SUPER ADMINISTRADOR ===\n');
    console.log(`ID: ${role.id}`);
    console.log(`Nombre: ${role.name}`);
    console.log(`Tenant ID: ${role.tenantId || 'null (global)'}`);
    console.log(`\nTipo de permisos: ${typeof role.permissions}`);
    console.log(`Permisos (raw): ${JSON.stringify(role.permissions).substring(0, 200)}...\n`);

    // Intentar parsear si es string
    let permissions = role.permissions;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
        console.log('✓ Permisos parseados desde string\n');
      } catch (e) {
        console.log('⚠️  No se pudo parsear como JSON\n');
      }
    }

    if (Array.isArray(permissions)) {
      console.log(`Total de permisos: ${permissions.length}\n`);
      console.log('Primeros 20 permisos:');
      permissions.slice(0, 20).forEach(perm => {
        console.log(`  - ${perm}`);
      });
      
      // Verificar si tiene manage_tenants
      const hasManageTenants = permissions.includes('manage_tenants');
      console.log(`\n¿Tiene manage_tenants? ${hasManageTenants ? '✓ SÍ' : '❌ NO'}`);
    } else {
      console.log('⚠️  Permisos no son un array');
    }

    // Ahora verificar el usuario
    console.log('\n=== USUARIO SUPER ADMIN ===\n');
    const userResult = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, [process.env.SUPER_ADMIN_EMAIL]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`Email: ${user.email}`);
      console.log(`Role ID: ${user.roleId}`);
      console.log(`Tipo de permisos: ${typeof user.permissions}`);
      
      if (user.permissions) {
        console.log(`Permisos (raw): ${JSON.stringify(user.permissions).substring(0, 200)}...`);
        
        let userPermissions = user.permissions;
        if (typeof userPermissions === 'string') {
          try {
            userPermissions = JSON.parse(userPermissions);
          } catch (e) {}
        }
        
        if (Array.isArray(userPermissions)) {
          console.log(`\nTotal de permisos del usuario: ${userPermissions.length}`);
          const hasManageTenants = userPermissions.includes('manage_tenants');
          console.log(`¿Tiene manage_tenants? ${hasManageTenants ? '✓ SÍ' : '❌ NO'}`);
        }
      } else {
        console.log('⚠️  Usuario sin permisos');
      }
    }

    console.log('\n✓ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkSuperAdminRole();
