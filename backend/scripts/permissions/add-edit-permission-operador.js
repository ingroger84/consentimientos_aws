const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function addEditPermissionToOperador() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar el rol Operador
    const roleResult = await client.query(`
      SELECT id, name, permissions
      FROM roles
      WHERE name = 'Operador'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol "Operador"');
      return;
    }

    console.log(`📋 Roles "Operador" encontrados: ${roleResult.rows.length}\n`);

    for (const role of roleResult.rows) {
      console.log(`\n🔧 Procesando rol ID: ${role.id}`);
      console.log(`   Nombre: ${role.name}`);
      console.log(`   Permisos actuales: ${role.permissions.length}`);

      // Verificar si ya tiene el permiso
      if (role.permissions.includes('edit_medical_records')) {
        console.log('   ✅ Ya tiene el permiso "edit_medical_records"');
        continue;
      }

      // Agregar el permiso
      const newPermissions = [...role.permissions, 'edit_medical_records'];

      await client.query(`
        UPDATE roles
        SET permissions = $1
        WHERE id = $2
      `, [newPermissions, role.id]);

      console.log('   ✅ Permiso "edit_medical_records" agregado exitosamente');
      console.log(`   📊 Total de permisos ahora: ${newPermissions.length}`);
    }

    console.log('\n✅ Proceso completado');
    console.log('\n📝 Permisos relacionados con admisiones:');
    console.log('   • create_medical_records - Crear admisiones');
    console.log('   • edit_medical_records - Cerrar/reabrir/editar admisiones ✅ AGREGADO');
    console.log('   • view_medical_records - Ver admisiones');
    console.log('\n💡 Los usuarios con rol "Operador" ahora pueden:');
    console.log('   ✅ Crear admisiones');
    console.log('   ✅ Cerrar admisiones');
    console.log('   ✅ Reabrir admisiones');
    console.log('   ✅ Editar admisiones');
    console.log('\n⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar para que los cambios surtan efecto.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

addEditPermissionToOperador();
