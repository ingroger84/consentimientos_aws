const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function checkOperadorPermissions() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar el rol Operador
    const roleResult = await client.query(`
      SELECT id, name, permissions
      FROM roles
      WHERE name = 'Operador'
      LIMIT 1
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol "Operador"');
      return;
    }

    const role = roleResult.rows[0];
    console.log('📋 Rol: Operador');
    console.log(`   ID: ${role.id}`);
    console.log(`   Nombre: ${role.name}`);
    console.log(`\n📊 Permisos asignados (${role.permissions.length}):\n`);

    // Permisos relacionados con HC y admisiones
    const hcPermissions = [
      'view_medical_records',
      'create_medical_records',
      'edit_medical_records',
      'delete_medical_records',
      'close_medical_records',
      'archive_medical_records',
      'reopen_medical_records',
    ];

    console.log('🏥 Permisos de Historias Clínicas:');
    for (const perm of hcPermissions) {
      const hasPermission = role.permissions.includes(perm);
      console.log(`   ${hasPermission ? '✅' : '❌'} ${perm}`);
    }

    console.log('\n📝 Todos los permisos del rol:');
    role.permissions.sort().forEach(perm => {
      console.log(`   • ${perm}`);
    });

    // Verificar si falta edit_medical_records
    if (!role.permissions.includes('edit_medical_records')) {
      console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
      console.log('   El rol "Operador" NO tiene el permiso "edit_medical_records"');
      console.log('   Este permiso es necesario para:');
      console.log('   - Cerrar admisiones');
      console.log('   - Reabrir admisiones');
      console.log('   - Editar admisiones');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   Ejecutar el script: node backend/add-edit-permission-operador.js');
    } else {
      console.log('\n✅ El rol "Operador" tiene el permiso "edit_medical_records"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOperadorPermissions();
