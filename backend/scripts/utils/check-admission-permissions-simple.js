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

async function checkAdmissionPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando permisos de admisiones en Supabase...\n');

    // 1. Buscar todos los permisos relacionados con admisiones
    console.log('📋 Permisos relacionados con admisiones:');
    const permsResult = await client.query(`
      SELECT id, name, resource, action, description 
      FROM permissions 
      WHERE name ILIKE '%admission%' OR resource ILIKE '%admission%'
      ORDER BY name
    `);
    
    if (permsResult.rows.length === 0) {
      console.log('  ❌ No se encontraron permisos relacionados con admisiones');
    } else {
      permsResult.rows.forEach(p => {
        console.log(`  - ${p.name} (${p.resource}:${p.action})`);
        if (p.description) console.log(`    ${p.description}`);
      });
    }

    // 2. Verificar permisos de edición de HC (que es el que usa cerrar admisión)
    console.log('\n📝 Permisos de edición de HC:');
    const editPermsResult = await client.query(`
      SELECT id, name, resource, action, description 
      FROM permissions 
      WHERE name = 'edit_medical_records'
    `);
    
    if (editPermsResult.rows.length > 0) {
      console.log('  ✅ Permiso edit_medical_records existe');
      editPermsResult.rows.forEach(p => {
        console.log(`     ID: ${p.id}`);
        console.log(`     Nombre: ${p.name}`);
        console.log(`     Recurso: ${p.resource}`);
        console.log(`     Acción: ${p.action}`);
      });
    } else {
      console.log('  ❌ Permiso edit_medical_records NO existe');
    }

    // 3. Verificar qué roles tienen el permiso de editar HC
    console.log('\n🎭 Roles con permiso de editar HC:');
    const rolesResult = await client.query(`
      SELECT id, name, permissions 
      FROM roles 
      ORDER BY name
    `);
    
    for (const role of rolesResult.rows) {
      const hasEditPerm = role.permissions.includes('edit_medical_records');
      const admissionPerms = role.permissions.filter(p => p.includes('admission'));
      
      console.log(`\n  ${role.name}:`);
      console.log(`    edit_medical_records: ${hasEditPerm ? '✅ SÍ' : '❌ NO'}`);
      
      if (admissionPerms.length > 0) {
        console.log(`    Permisos de admisiones: ${admissionPerms.join(', ')}`);
      } else {
        console.log(`    Permisos de admisiones: ninguno`);
      }
      
      console.log(`    Total permisos: ${role.permissions.length}`);
    }

    // 4. Verificar el usuario actual
    console.log('\n👤 Verificando usuarios:');
    const usersResult = await client.query(`
      SELECT u.id, u.email, u.name, r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.email
      LIMIT 10
    `);
    
    for (const user of usersResult.rows) {
      const hasEditPerm = user.permissions && user.permissions.includes('edit_medical_records');
      console.log(`\n  ${user.email} (${user.name})`);
      console.log(`    Rol: ${user.role_name}`);
      console.log(`    Puede editar HC: ${hasEditPerm ? '✅ SÍ' : '❌ NO'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdmissionPermissions();
