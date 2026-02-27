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
    console.log('='.repeat(60));
    console.log('VERIFICACIÓN DE PERMISOS - SUPER ADMINISTRADOR');
    console.log('='.repeat(60));
    console.log('');

    // 1. Verificar que el permiso existe
    console.log('1. Verificando que el permiso delete_medical_records existe...');
    const permissionCheck = await pool.query(
      "SELECT * FROM permissions WHERE name = 'delete_medical_records'"
    );
    
    if (permissionCheck.rows.length === 0) {
      console.log('❌ El permiso delete_medical_records NO existe en la base de datos');
      pool.end();
      return;
    }
    
    console.log('✅ Permiso encontrado:');
    console.log(`   ID: ${permissionCheck.rows[0].id}`);
    console.log(`   Nombre: ${permissionCheck.rows[0].name}`);
    console.log(`   Descripción: ${permissionCheck.rows[0].description}`);
    console.log('');

    // 2. Verificar rol Super Administrador
    console.log('2. Verificando rol Super Administrador...');
    const roleCheck = await pool.query(
      "SELECT * FROM roles WHERE name = 'Super Administrador'"
    );
    
    if (roleCheck.rows.length === 0) {
      console.log('❌ El rol Super Administrador NO existe');
      pool.end();
      return;
    }
    
    console.log('✅ Rol encontrado:');
    console.log(`   ID: ${roleCheck.rows[0].id}`);
    console.log(`   Nombre: ${roleCheck.rows[0].name}`);
    console.log('');

    // 3. Verificar si el permiso está asignado al rol
    console.log('3. Verificando asignación del permiso al rol...');
    const assignmentCheck = await pool.query(
      `SELECT rp.*, p.name as permission_name, r.name as role_name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = 'Super Administrador' AND p.name = 'delete_medical_records'`
    );
    
    if (assignmentCheck.rows.length === 0) {
      console.log('❌ El permiso NO está asignado al rol Super Administrador');
      console.log('');
      console.log('Asignando permiso...');
      
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT r.id, p.id
         FROM roles r, permissions p
         WHERE r.name = 'Super Administrador' AND p.name = 'delete_medical_records'
         ON CONFLICT DO NOTHING`
      );
      
      console.log('✅ Permiso asignado correctamente');
    } else {
      console.log('✅ Permiso YA está asignado al rol');
    }
    console.log('');

    // 4. Listar todos los permisos de medical_records del Super Admin
    console.log('4. Permisos de Historias Clínicas del Super Administrador:');
    const allPermissions = await pool.query(
      `SELECT p.name, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = 'Super Administrador' AND p.name LIKE '%medical_records%'
       ORDER BY p.name`
    );
    
    console.log(`   Total: ${allPermissions.rows.length} permisos`);
    allPermissions.rows.forEach(perm => {
      console.log(`   ✓ ${perm.name}`);
    });
    console.log('');

    // 5. Verificar usuario Super Admin
    console.log('5. Verificando usuario Super Admin...');
    const userCheck = await pool.query(
      `SELECT u.id, u.email, u.name, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'Super Administrador'
       LIMIT 1`
    );
    
    if (userCheck.rows.length === 0) {
      console.log('❌ No hay usuarios con rol Super Administrador');
    } else {
      console.log('✅ Usuario Super Admin encontrado:');
      console.log(`   Email: ${userCheck.rows[0].email}`);
      console.log(`   Nombre: ${userCheck.rows[0].name}`);
      console.log(`   Rol: ${userCheck.rows[0].role_name}`);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkPermissions();
