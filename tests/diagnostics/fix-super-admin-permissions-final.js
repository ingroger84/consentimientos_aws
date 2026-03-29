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

    // 1. Buscar el rol Super Administrador
    const roleResult = await client.query(`
      SELECT * FROM roles WHERE name = 'Super Administrador'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol Super Administrador');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`Rol encontrado: ${role.id} - ${role.name}`);
    console.log(`Permisos actuales (tipo): ${typeof role.permissions}\n`);

    // 2. Convertir permisos de string a array si es necesario
    let permissions = role.permissions;
    
    if (typeof permissions === 'string') {
      // Está en formato CSV, convertir a array
      permissions = permissions.split(',').map(p => p.trim());
      console.log(`✓ Permisos convertidos de CSV a array: ${permissions.length} permisos\n`);
      
      // Actualizar el rol con formato JSON array
      await client.query(`
        UPDATE roles
        SET permissions = $1::jsonb
        WHERE id = $2
      `, [JSON.stringify(permissions), role.id]);
      
      console.log('✓ Rol actualizado con formato JSON array\n');
    } else if (Array.isArray(permissions)) {
      console.log(`✓ Permisos ya están en formato array: ${permissions.length} permisos\n`);
    }

    // Verificar que tenga manage_tenants
    if (!permissions.includes('manage_tenants')) {
      console.log('⚠️  Agregando permiso manage_tenants...');
      permissions.push('manage_tenants');
      
      await client.query(`
        UPDATE roles
        SET permissions = $1::jsonb
        WHERE id = $2
      `, [JSON.stringify(permissions), role.id]);
      
      console.log('✓ Permiso manage_tenants agregado\n');
    } else {
      console.log('✓ Ya tiene permiso manage_tenants\n');
    }

    // 3. Actualizar el usuario con los permisos del rol
    const userResult = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, [superAdminEmail]);

    if (userResult.rows.length === 0) {
      console.log('❌ No se encontró el usuario');
      return;
    }

    const user = userResult.rows[0];
    console.log(`Usuario encontrado: ${user.email}`);
    console.log(`Role ID actual: ${user.roleId}\n`);

    // Actualizar usuario con permisos
    await client.query(`
      UPDATE users
      SET 
        "roleId" = $1,
        permissions = $2::jsonb
      WHERE id = $3
    `, [role.id, JSON.stringify(permissions), user.id]);

    console.log('✓ Usuario actualizado con permisos del rol\n');

    // 4. Verificar
    const verifyResult = await client.query(`
      SELECT * FROM users WHERE id = $1
    `, [user.id]);

    const updatedUser = verifyResult.rows[0];
    console.log('=== VERIFICACIÓN FINAL ===\n');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Role ID: ${updatedUser.roleId}`);
    
    const userPermissions = updatedUser.permissions;
    if (Array.isArray(userPermissions)) {
      console.log(`\nPermisos: ${userPermissions.length} permisos`);
      console.log('\nPermisos clave:');
      const keyPermissions = [
        'manage_tenants',
        'view_global_stats',
        'manage_users',
        'manage_roles',
        'manage_plans'
      ];
      keyPermissions.forEach(perm => {
        const has = userPermissions.includes(perm);
        console.log(`  ${has ? '✓' : '❌'} ${perm}`);
      });
    } else {
      console.log('⚠️  Permisos en formato incorrecto');
    }

    console.log('\n✓ Permisos de Super Admin arreglados exitosamente');
    console.log('\n⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixSuperAdminPermissions();
