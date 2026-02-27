/**
 * Script: Corregir permisos del rol Administrador General
 * Elimina duplicados y agrega permisos de Plantillas HC
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

const MR_PERMISSIONS = [
  'view_mr_consent_templates',
  'create_mr_consent_templates',
  'edit_mr_consent_templates',
  'delete_mr_consent_templates',
  'generate_mr_consents',
  'view_mr_consents',
];

async function fixAdminPermissions() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Obtener el rol Administrador General
    const roleResult = await client.query(
      `SELECT id, name, permissions FROM roles WHERE name = 'Administrador General'`
    );

    if (roleResult.rows.length === 0) {
      console.log('❌ Rol "Administrador General" no encontrado');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`✓ Rol encontrado: ${role.name}`);
    console.log(`  Permisos actuales (con duplicados): ${role.permissions.length}\n`);

    // Eliminar duplicados y agregar permisos de Plantillas HC
    const uniquePermissions = [...new Set(role.permissions)];
    console.log(`  Permisos únicos: ${uniquePermissions.length}`);

    // Agregar permisos de Plantillas HC
    const finalPermissions = [...new Set([...uniquePermissions, ...MR_PERMISSIONS])];
    console.log(`  Permisos finales: ${finalPermissions.length}\n`);

    console.log('📝 Actualizando permisos...\n');

    await client.query(
      `UPDATE roles SET permissions = $1 WHERE id = $2`,
      [finalPermissions, role.id]
    );

    console.log('✅ Permisos actualizados exitosamente!\n');

    // Verificar permisos de Plantillas HC
    console.log('📋 Permisos de Plantillas HC:');
    MR_PERMISSIONS.forEach((perm) => {
      const has = finalPermissions.includes(perm);
      console.log(`   ${has ? '✅' : '❌'} ${perm}`);
    });

    console.log('\n✅ Actualización completada!');
    console.log('\n⚠️  IMPORTANTE: Limpia las sesiones de usuario para que los cambios surtan efecto:');
    console.log('   node clear-user-sessions.js');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixAdminPermissions();
