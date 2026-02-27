require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function checkPermissions() {
  try {
    console.log('='.repeat(70));
    console.log('VERIFICACIÓN DE PERMISOS - SUPER ADMINISTRADOR');
    console.log('='.repeat(70));
    console.log('');

    // 1. Verificar rol Super Administrador
    console.log('1. Verificando rol Super Administrador...');
    const roleCheck = await pool.query(
      "SELECT * FROM roles WHERE name = 'Super Administrador' OR type = 'super_admin'"
    );
    
    if (roleCheck.rows.length === 0) {
      console.log('❌ El rol Super Administrador NO existe');
      pool.end();
      return;
    }
    
    const role = roleCheck.rows[0];
    console.log('✅ Rol encontrado:');
    console.log(`   ID: ${role.id}`);
    console.log(`   Nombre: ${role.name}`);
    console.log(`   Tipo: ${role.type}`);
    console.log('');

    // 2. Verificar permisos actuales
    console.log('2. Permisos actuales del Super Administrador:');
    let permissions = [];
    
    if (typeof role.permissions === 'string') {
      if (role.permissions.startsWith('[') || role.permissions.startsWith('{')) {
        try {
          permissions = JSON.parse(role.permissions);
        } catch {
          permissions = role.permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
        }
      } else {
        permissions = role.permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }
    } else if (Array.isArray(role.permissions)) {
      permissions = role.permissions;
    }
    
    console.log(`   Total de permisos: ${permissions.length}`);
    console.log('');

    // 3. Buscar permisos relacionados con medical_records
    console.log('3. Permisos de Historias Clínicas:');
    const mrPermissions = permissions.filter(p => p.includes('medical_records'));
    
    if (mrPermissions.length === 0) {
      console.log('   ❌ No hay permisos de medical_records');
    } else {
      mrPermissions.forEach(perm => {
        console.log(`   ${perm.includes('delete_medical_records') ? '✅' : '✓'} ${perm}`);
      });
    }
    console.log('');

    // 4. Verificar si tiene el permiso delete_medical_records
    const hasDeletePermission = permissions.includes('delete_medical_records');
    console.log('4. Permiso delete_medical_records:');
    if (hasDeletePermission) {
      console.log('   ✅ El permiso YA está asignado');
    } else {
      console.log('   ❌ El permiso NO está asignado');
      console.log('');
      console.log('   Agregando permiso delete_medical_records...');
      
      permissions.push('delete_medical_records');
      const permissionsStr = permissions.join(',');
      
      await pool.query(
        'UPDATE roles SET permissions = $1 WHERE id = $2',
        [permissionsStr, role.id]
      );
      
      console.log('   ✅ Permiso agregado correctamente');
    }
    console.log('');

    // 5. Verificar permisos finales
    console.log('5. Permisos finales del Super Administrador:');
    const finalCheck = await pool.query(
      "SELECT permissions FROM roles WHERE id = $1",
      [role.id]
    );
    
    let finalPermissions = [];
    const finalPermsRaw = finalCheck.rows[0].permissions;
    
    if (typeof finalPermsRaw === 'string') {
      if (finalPermsRaw.startsWith('[') || finalPermsRaw.startsWith('{')) {
        try {
          finalPermissions = JSON.parse(finalPermsRaw);
        } catch {
          finalPermissions = finalPermsRaw.split(',').map(p => p.trim()).filter(p => p.length > 0);
        }
      } else {
        finalPermissions = finalPermsRaw.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }
    } else if (Array.isArray(finalPermsRaw)) {
      finalPermissions = finalPermsRaw;
    }
    
    const finalMrPermissions = finalPermissions.filter(p => p.includes('medical_records'));
    console.log(`   Total de permisos de HC: ${finalMrPermissions.length}`);
    finalMrPermissions.forEach(perm => {
      console.log(`   ${perm === 'delete_medical_records' ? '✅' : '✓'} ${perm}`);
    });
    console.log('');

    // 6. Verificar usuario Super Admin
    console.log('6. Verificando usuario Super Admin...');
    const userCheck = await pool.query(
      `SELECT u.id, u.email, u.name, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE r.type = 'super_admin'
       LIMIT 1`
    );
    
    if (userCheck.rows.length === 0) {
      console.log('   ❌ No hay usuarios con rol Super Administrador');
    } else {
      console.log('   ✅ Usuario Super Admin encontrado:');
      console.log(`      Email: ${userCheck.rows[0].email}`);
      console.log(`      Nombre: ${userCheck.rows[0].name}`);
    }
    console.log('');

    console.log('='.repeat(70));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log('');
    console.log('IMPORTANTE: Si agregaste el permiso, debes:');
    console.log('1. Cerrar sesión en el navegador');
    console.log('2. Limpiar caché del navegador (Ctrl + Shift + R)');
    console.log('3. Iniciar sesión nuevamente');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    pool.end();
  }
}

checkPermissions();
