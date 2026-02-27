require('dotenv').config();
const { Client } = require('pg');

async function fixAdminSettingsPermission() {
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

    // Buscar el tenant demo-medico
    const tenantResult = await client.query(`
      SELECT id, name, slug
      FROM tenants
      WHERE slug = 'demo-medico'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant demo-medico no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`Tenant: ${tenant.name} (${tenant.slug})\n`);

    // Buscar el rol Administrador General (los roles son globales, no por tenant)
    console.log('=== VERIFICANDO ROL ADMINISTRADOR GENERAL ===\n');
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

    // Parsear permisos actuales
    let permissions = [];
    try {
      permissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions;
    } catch (error) {
      console.log('⚠️  Error parseando permisos, usando array vacío');
      permissions = [];
    }

    console.log('Permisos actuales:', permissions.length);
    console.log('Tiene edit_settings:', permissions.includes('edit_settings') ? '✓' : '✗');
    console.log('');

    // Agregar edit_settings si no existe
    if (!permissions.includes('edit_settings')) {
      console.log('Agregando permiso edit_settings...');
      permissions.push('edit_settings');

      // Actualizar en la base de datos
      await client.query(`
        UPDATE roles
        SET permissions = $1
        WHERE id = $2
      `, [JSON.stringify(permissions), role.id]);

      console.log('✓ Permiso agregado exitosamente\n');
    } else {
      console.log('✓ El permiso edit_settings ya existe\n');
    }

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
    console.log(`Total de permisos: ${finalPermissions.length}`);
    console.log('Tiene edit_settings:', finalPermissions.includes('edit_settings') ? '✓' : '✗');
    console.log('');

    console.log('=== INSTRUCCIONES ===\n');
    console.log('1. Cierra sesión en el navegador');
    console.log('2. Vuelve a iniciar sesión como Administrador General');
    console.log('3. Ve a Configuración → Logos HC');
    console.log('4. Ahora deberías poder subir logos\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixAdminSettingsPermission();
