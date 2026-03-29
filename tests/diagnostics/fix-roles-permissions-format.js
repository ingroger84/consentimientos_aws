require('dotenv').config();
const { Client } = require('pg');

async function fixRolesPermissionsFormat() {
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

    // 1. Ver todos los roles
    const rolesResult = await client.query(`SELECT * FROM roles`);
    
    console.log(`=== ARREGLANDO FORMATO DE PERMISOS (${rolesResult.rows.length} roles) ===\n`);

    for (const role of rolesResult.rows) {
      console.log(`Procesando: ${role.name}`);
      
      let permissions = role.permissions;
      
      // Si es string, convertir a array
      if (typeof permissions === 'string') {
        permissions = permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
        console.log(`  ✓ Convertido de CSV a array: ${permissions.length} permisos`);
        
        // Actualizar en la BD
        await client.query(`
          UPDATE roles
          SET permissions = $1::jsonb
          WHERE id = $2
        `, [JSON.stringify(permissions), role.id]);
        
        console.log(`  ✓ Actualizado en BD`);
      } else if (Array.isArray(permissions)) {
        console.log(`  ✓ Ya está en formato array: ${permissions.length} permisos`);
      } else {
        console.log(`  ⚠️  Formato desconocido: ${typeof permissions}`);
      }
      console.log('');
    }

    // 2. Verificar el rol Super Administrador específicamente
    const superAdminResult = await client.query(`
      SELECT * FROM roles WHERE name = 'Super Administrador'
    `);

    if (superAdminResult.rows.length > 0) {
      const role = superAdminResult.rows[0];
      console.log('=== VERIFICACIÓN SUPER ADMINISTRADOR ===\n');
      console.log(`Nombre: ${role.name}`);
      console.log(`Tipo de permisos: ${typeof role.permissions}`);
      
      if (Array.isArray(role.permissions)) {
        console.log(`Total de permisos: ${role.permissions.length}`);
        
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
          const has = role.permissions.includes(perm);
          console.log(`  ${has ? '✓' : '❌'} ${perm}`);
        });
      }
    }

    console.log('\n✓ Formato de permisos arreglado exitosamente');
    console.log('\n⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar sesión');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixRolesPermissionsFormat();
