const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function applyPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Aplicando permisos de edición de HC...\n');

    // Obtener roles actuales
    const rolesResult = await client.query(`
      SELECT id, name, type, permissions 
      FROM roles 
      WHERE type IN ('ADMIN_SEDE', 'ADMIN_GENERAL', 'OPERADOR')
      ORDER BY name
    `);

    for (const role of rolesResult.rows) {
      console.log(`\n📝 Procesando: ${role.name} (${role.type})`);
      
      // Parsear permisos actuales
      let permsStr = role.permissions;
      
      // Limpiar formato JSON mal formado
      if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
        permsStr = permsStr.substring(2, permsStr.length - 2);
      }
      
      // Convertir a array
      let permissionsArray = permsStr.split(',').map(p => p.trim());
      
      console.log(`  Permisos actuales: ${permissionsArray.length}`);
      
      // Verificar si ya tiene el permiso
      if (permissionsArray.includes('edit_medical_records')) {
        console.log(`  ✅ Ya tiene edit_medical_records`);
        continue;
      }
      
      // Agregar el permiso
      permissionsArray.push('edit_medical_records');
      
      // Convertir de vuelta a string
      const newPermsStr = permissionsArray.join(',');
      
      console.log(`  ➕ Agregando edit_medical_records`);
      console.log(`  Nuevos permisos: ${permissionsArray.length}`);
      
      // Actualizar en la base de datos
      await client.query(
        `UPDATE roles SET permissions = $1 WHERE id = $2`,
        [newPermsStr, role.id]
      );
      
      console.log(`  ✅ Actualizado exitosamente`);
    }

    // Verificar cambios
    console.log('\n\n✅ VERIFICACIÓN FINAL:\n');
    
    const verifyResult = await client.query(`
      SELECT name, type, permissions 
      FROM roles 
      WHERE type IN ('ADMIN_SEDE', 'ADMIN_GENERAL', 'OPERADOR')
      ORDER BY name
    `);
    
    for (const role of verifyResult.rows) {
      let permsStr = role.permissions;
      if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
        permsStr = permsStr.substring(2, permsStr.length - 2);
      }
      const permissionsArray = permsStr.split(',').map(p => p.trim());
      const hasEdit = permissionsArray.includes('edit_medical_records');
      
      console.log(`${role.name}:`);
      console.log(`  edit_medical_records: ${hasEdit ? '✅ SÍ' : '❌ NO'}`);
      console.log(`  Total permisos: ${permissionsArray.length}`);
    }

    console.log('\n\n🎉 ¡Permisos actualizados exitosamente!');
    console.log('');
    console.log('📌 IMPORTANTE:');
    console.log('   Los usuarios con estos roles ahora pueden cerrar admisiones.');
    console.log('   No es necesario reiniciar el backend.');
    console.log('   Los cambios se aplican inmediatamente en la próxima petición.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

applyPermissions();
