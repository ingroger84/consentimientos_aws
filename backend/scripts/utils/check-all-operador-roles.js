const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function checkAllOperadorRoles() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar TODOS los roles con nombre "Operador"
    const rolesResult = await client.query(`
      SELECT id, name, permissions
      FROM roles
      WHERE name ILIKE '%operador%'
      ORDER BY name
    `);

    console.log(`📋 Roles encontrados: ${rolesResult.rows.length}\n`);

    for (const role of rolesResult.rows) {
      console.log(`\n🔧 Rol ID: ${role.id}`);
      console.log(`   Nombre: ${role.name}`);
      console.log(`   Total permisos: ${role.permissions.length}`);
      
      const hasEditPermission = role.permissions.includes('edit_medical_records');
      console.log(`   edit_medical_records: ${hasEditPermission ? '✅ SÍ' : '❌ NO'}`);
      
      if (!hasEditPermission) {
        console.log(`   ⚠️  FALTA EL PERMISO - Necesita actualización`);
      }
    }

    // Buscar usuarios con rol Operador
    console.log('\n\n👥 Usuarios con rol Operador:');
    const usersResult = await client.query(`
      SELECT u.id, u.name, u.email, r.name as role_name, r.id as role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name ILIKE '%operador%'
      ORDER BY u.name
    `);

    console.log(`   Total usuarios: ${usersResult.rows.length}\n`);
    
    for (const user of usersResult.rows) {
      console.log(`   • ${user.name} (${user.email})`);
      console.log(`     Rol: ${user.role_name} (ID: ${user.role_id})`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAllOperadorRoles();
