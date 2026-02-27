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

async function fixAdmissionPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Analizando permisos actuales...\n');

    // 1. Ver todos los roles y sus permisos
    const rolesResult = await client.query(`SELECT * FROM roles ORDER BY name`);
    
    console.log('🎭 Roles actuales:\n');
    
    for (const role of rolesResult.rows) {
      console.log(`${role.name} (${role.type}):`);
      console.log(`  Permisos raw: ${role.permissions.substring(0, 200)}...`);
      
      // Intentar parsear los permisos
      let permissionsArray = [];
      try {
        // Los permisos están en formato JSON mal formado, intentar limpiar
        let permsStr = role.permissions;
        
        // Si empieza con {" y termina con "}, es un JSON stringificado mal
        if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
          // Extraer el contenido entre las comillas
          permsStr = permsStr.substring(2, permsStr.length - 2);
        }
        
        // Dividir por comas
        permissionsArray = permsStr.split(',').map(p => p.trim());
        
        console.log(`  Total permisos: ${permissionsArray.length}`);
        
        // Buscar permisos de HC
        const mrPerms = permissionsArray.filter(p => 
          p.includes('medical_record') || p.includes('admission')
        );
        
        if (mrPerms.length > 0) {
          console.log(`  Permisos de HC/Admisiones:`);
          mrPerms.forEach(p => console.log(`    - ${p}`));
        } else {
          console.log(`  ❌ NO tiene permisos de HC ni admisiones`);
        }
        
        // Verificar edit_medical_records
        const hasEdit = permissionsArray.includes('edit_medical_records');
        console.log(`  Puede editar HC: ${hasEdit ? '✅ SÍ' : '❌ NO'}`);
        
      } catch (e) {
        console.log(`  ⚠️  Error parseando permisos: ${e.message}`);
      }
      
      console.log('');
    }

    // 2. Verificar usuarios
    console.log('\n👤 Usuarios:\n');
    const usersResult = await client.query(`
      SELECT u.id, u.email, u.name, u."roleId", r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.email
    `);
    
    for (const user of usersResult.rows) {
      console.log(`${user.email} (${user.name || 'Sin nombre'})`);
      console.log(`  Rol: ${user.role_name || 'Sin rol'}`);
      
      if (user.permissions) {
        let permsStr = user.permissions;
        if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
          permsStr = permsStr.substring(2, permsStr.length - 2);
        }
        const permissionsArray = permsStr.split(',').map(p => p.trim());
        const hasEdit = permissionsArray.includes('edit_medical_records');
        console.log(`  Puede editar HC: ${hasEdit ? '✅ SÍ' : '❌ NO'}`);
      }
      console.log('');
    }

    // 3. Proponer solución
    console.log('\n📊 DIAGNÓSTICO:');
    console.log('El endpoint PATCH /admissions/:id/close requiere: edit_medical_records');
    console.log('');
    
    const rolesNeedingFix = [];
    for (const role of rolesResult.rows) {
      let permsStr = role.permissions;
      if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
        permsStr = permsStr.substring(2, permsStr.length - 2);
      }
      const permissionsArray = permsStr.split(',').map(p => p.trim());
      
      if (!permissionsArray.includes('edit_medical_records') && 
          (role.type === 'ADMIN_GENERAL' || role.type === 'OPERADOR' || role.type === 'ADMIN_SEDE')) {
        rolesNeedingFix.push(role);
      }
    }
    
    if (rolesNeedingFix.length > 0) {
      console.log('⚠️  Roles que necesitan el permiso edit_medical_records:');
      rolesNeedingFix.forEach(r => console.log(`  - ${r.name} (${r.type})`));
      console.log('');
      console.log('💡 SOLUCIÓN:');
      console.log('Ejecutar las siguientes queries para agregar el permiso:\n');
      
      for (const role of rolesNeedingFix) {
        let permsStr = role.permissions;
        if (permsStr.startsWith('{"') && permsStr.endsWith('"}')) {
          permsStr = permsStr.substring(2, permsStr.length - 2);
        }
        
        // Agregar el permiso
        const newPerms = permsStr + ',edit_medical_records';
        const newPermsJson = `{"${newPerms}"}`;
        
        console.log(`-- ${role.name}`);
        console.log(`UPDATE roles SET permissions = '${newPermsJson}' WHERE id = '${role.id}';`);
        console.log('');
      }
      
      console.log('\n¿Deseas aplicar estos cambios? (y/n)');
      console.log('Para aplicar, ejecuta: node backend/apply-admission-permissions.js');
      
    } else {
      console.log('✅ Todos los roles tienen los permisos necesarios');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdmissionPermissions();
