/**
 * Script: Agregar permisos faltantes al rol Administrador General
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

const REQUIRED_PERMISSIONS = [
  'view_roles',
  'edit_roles',
  'view_mr_consent_templates',
  'create_mr_consent_templates',
  'edit_mr_consent_templates',
  'delete_mr_consent_templates',
  'generate_mr_consents',
  'view_mr_consents',
];

async function addMissingPermissions() {
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
    console.log(`  Permisos actuales: ${role.permissions.length}\n`);

    // Identificar permisos faltantes
    const currentPermissions = role.permissions || [];
    const missingPermissions = REQUIRED_PERMISSIONS.filter(
      (perm) => !currentPermissions.includes(perm)
    );

    if (missingPermissions.length === 0) {
      console.log('✅ El rol ya tiene todos los permisos requeridos');
      return;
    }

    console.log(`📝 Permisos faltantes (${missingPermissions.length}):`);
    missingPermissions.forEach((perm) => {
      console.log(`   - ${perm}`);
    });
    console.log('');

    // Agregar permisos faltantes
    const finalPermissions = [...new Set([...currentPermissions, ...missingPermissions])];

    console.log('📝 Actualizando permisos...\n');

    await client.query(
      `UPDATE roles SET permissions = $1 WHERE id = $2`,
      [finalPermissions, role.id]
    );

    console.log('✅ Permisos actualizados exitosamente!\n');
    console.log(`  Permisos antes: ${currentPermissions.length}`);
    console.log(`  Permisos después: ${finalPermissions.length}`);
    console.log(`  Permisos agregados: ${missingPermissions.length}\n`);

    // Verificar todos los permisos requeridos
    console.log('📋 Verificando permisos requeridos:');
    REQUIRED_PERMISSIONS.forEach((perm) => {
      const has = finalPermissions.includes(perm);
      console.log(`   ${has ? '✅' : '❌'} ${perm}`);
    });

    console.log('\n✅ Actualización completada!');
    console.log('\n⚠️  IMPORTANTE: Limpia las sesiones de usuario:');
    console.log('   node clear-user-sessions.js');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addMissingPermissions();
