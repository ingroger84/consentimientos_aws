const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function fixClosePermission() {
  try {
    await client.connect();
    console.log('✓ Conectado a Supabase\n');

    const permissionToAdd = 'close_medical_records';
    const rolesToUpdate = ['Administrador General', 'Administrador de Sede', 'Operador'];
    
    for (const roleName of rolesToUpdate) {
      const roleResult = await client.query(
        'SELECT id, name, permissions FROM roles WHERE name = $1',
        [roleName]
      );

      if (roleResult.rows.length === 0) {
        console.log(`⚠ Rol ${roleName} no encontrado`);
        continue;
      }

      const role = roleResult.rows[0];
      const currentPermissions = role.permissions || [];

      if (currentPermissions.includes(permissionToAdd)) {
        console.log(`✓ ${roleName} ya tiene el permiso ${permissionToAdd}`);
      } else {
        const updatedPermissions = [...currentPermissions, permissionToAdd];
        
        await client.query(
          'UPDATE roles SET permissions = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(updatedPermissions), role.id]
        );
        
        console.log(`✓ Permiso ${permissionToAdd} agregado a ${roleName}`);
      }
    }

    console.log('\n=== VERIFICACIÓN FINAL ===');
    for (const roleName of rolesToUpdate) {
      const result = await client.query(
        'SELECT name, permissions::text FROM roles WHERE name = $1',
        [roleName]
      );

      if (result.rows.length > 0) {
        const permissionsText = result.rows[0].permissions;
        const hasPermission = permissionsText.includes(permissionToAdd);
        console.log(`${hasPermission ? '✓' : '✗'} ${roleName}: ${hasPermission ? 'SÍ' : 'NO'} tiene ${permissionToAdd}`);
      }
    }

    await client.end();
    console.log('\n✓ Proceso completado exitosamente');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

fixClosePermission();
