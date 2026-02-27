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

async function checkRolePermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando permisos de roles en Supabase...\n');

    // 1. Obtener todos los roles y sus permisos
    const rolesResult = await client.query(`
      SELECT id, name, permissions, description 
      FROM roles 
      ORDER BY name
    `);
    
    console.log('🎭 Roles y permisos:\n');
    
    for (const role of rolesResult.rows) {
      console.log(`${role.name}:`);
      console.log(`  ID: ${role.id}`);
      console.log(`  Descripción: ${role.description || 'N/A'}`);
      
      // Los permisos pueden ser un array o un objeto JSON
      const permissions = Array.isArray(role.permissions) 
        ? role.permissions 
        : (typeof role.permissions === 'object' ? Object.keys(role.permissions) : []);
      
      console.log(`  Total permisos: ${permissions.length}`);
      console.log(`  Tipo de permisos: ${typeof role.permissions}`);
      
      // Buscar permisos relacionados con HC
      const medicalRecordPerms = permissions.filter(p => 
        p.includes('medical_record') || p.includes('admission')
      );
      
      if (medicalRecordPerms.length > 0) {
        console.log(`  Permisos de HC y admisiones:`);
        medicalRecordPerms.forEach(p => {
          console.log(`    - ${p}`);
        });
      } else {
        console.log(`  ❌ No tiene permisos de HC ni admisiones`);
      }
      
      // Verificar específicamente el permiso de editar HC
      const hasEditMR = permissions.includes('edit_medical_records');
      console.log(`  Puede editar HC (edit_medical_records): ${hasEditMR ? '✅ SÍ' : '❌ NO'}`);
      
      console.log('');
    }

    // 2. Verificar usuarios y sus roles
    console.log('\n👤 Usuarios y sus permisos:\n');
    const usersResult = await client.query(`
      SELECT u.id, u.email, u.name, r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.email
    `);
    
    for (const user of usersResult.rows) {
      console.log(`${user.email} (${user.name || 'Sin nombre'})`);
      console.log(`  Rol: ${user.role_name || 'Sin rol'}`);
      
      if (user.permissions) {
        const permissions = Array.isArray(user.permissions) 
          ? user.permissions 
          : (typeof user.permissions === 'object' ? Object.keys(user.permissions) : []);
        
        const hasEditMR = permissions.includes('edit_medical_records');
        console.log(`  Puede editar HC: ${hasEditMR ? '✅ SÍ' : '❌ NO'}`);
        
        const admissionPerms = permissions.filter(p => p.includes('admission'));
        if (admissionPerms.length > 0) {
          console.log(`  Permisos de admisiones: ${admissionPerms.join(', ')}`);
        }
      } else {
        console.log(`  ❌ Sin permisos asignados`);
      }
      
      console.log('');
    }

    // 3. Resumen
    console.log('\n📊 RESUMEN:');
    console.log('El endpoint PATCH /admissions/:id/close requiere el permiso: edit_medical_records');
    console.log('');
    
    const rolesWithEdit = rolesResult.rows.filter(r => {
      const permissions = Array.isArray(r.permissions) 
        ? r.permissions 
        : (typeof r.permissions === 'object' ? Object.keys(r.permissions) : []);
      return permissions.includes('edit_medical_records');
    });
    
    if (rolesWithEdit.length > 0) {
      console.log('✅ Roles que pueden cerrar admisiones:');
      rolesWithEdit.forEach(r => console.log(`  - ${r.name}`));
    } else {
      console.log('❌ NINGÚN rol tiene el permiso edit_medical_records');
      console.log('   Necesitas agregar este permiso a los roles correspondientes');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRolePermissions();
