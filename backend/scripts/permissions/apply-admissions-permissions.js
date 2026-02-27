/**
 * Script para agregar permisos de admisiones a todos los roles
 * que pueden ver historias clínicas
 * 
 * Versión: 38.1.19
 * Fecha: 2026-02-19
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function applyPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando aplicación de permisos de admisiones...\n');
    
    // 1. Verificar que el permiso CREATE_MEDICAL_RECORDS existe
    console.log('📋 Paso 1: Verificando permiso CREATE_MEDICAL_RECORDS...');
    const permissionCheck = await client.query(`
      SELECT id, name, description 
      FROM permissions 
      WHERE name = 'create_medical_records'
    `);
    
    if (permissionCheck.rows.length === 0) {
      console.log('❌ ERROR: El permiso create_medical_records no existe');
      return;
    }
    
    const createPermissionId = permissionCheck.rows[0].id;
    console.log(`✅ Permiso encontrado: ${permissionCheck.rows[0].description}`);
    console.log(`   ID: ${createPermissionId}\n`);
    
    // 2. Obtener roles que tienen VIEW_MEDICAL_RECORDS
    console.log('📋 Paso 2: Obteniendo roles con permiso VIEW_MEDICAL_RECORDS...');
    const rolesWithView = await client.query(`
      SELECT DISTINCT r.id, r.name
      FROM roles r
      JOIN role_permissions rp ON r.id = rp."roleId"
      JOIN permissions p ON rp."permissionId" = p.id
      WHERE p.name = 'view_medical_records'
      ORDER BY r.name
    `);
    
    console.log(`✅ Encontrados ${rolesWithView.rows.length} roles:\n`);
    rolesWithView.rows.forEach(role => {
      console.log(`   - ${role.name} (${role.id})`);
    });
    console.log('');
    
    // 3. Agregar permiso CREATE_MEDICAL_RECORDS a cada rol
    console.log('📋 Paso 3: Agregando permiso CREATE_MEDICAL_RECORDS a roles...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const role of rolesWithView.rows) {
      // Verificar si ya tiene el permiso
      const hasPermission = await client.query(`
        SELECT 1 
        FROM role_permissions 
        WHERE "roleId" = $1 AND "permissionId" = $2
      `, [role.id, createPermissionId]);
      
      if (hasPermission.rows.length > 0) {
        console.log(`⏭️  ${role.name}: Ya tiene el permiso (omitido)`);
        skipped++;
      } else {
        // Agregar el permiso
        await client.query(`
          INSERT INTO role_permissions ("roleId", "permissionId", "createdAt", "updatedAt")
          VALUES ($1, $2, NOW(), NOW())
        `, [role.id, createPermissionId]);
        
        console.log(`✅ ${role.name}: Permiso agregado`);
        added++;
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   - Permisos agregados: ${added}`);
    console.log(`   - Permisos omitidos (ya existían): ${skipped}`);
    console.log(`   - Total de roles procesados: ${rolesWithView.rows.length}\n`);
    
    // 4. Verificar permisos finales
    console.log('📋 Paso 4: Verificando permisos finales...\n');
    const finalCheck = await client.query(`
      SELECT 
        r.name as role_name,
        COUNT(*) as total_permissions
      FROM roles r
      JOIN role_permissions rp ON r.id = rp."roleId"
      JOIN permissions p ON rp."permissionId" = p.id
      WHERE p.name LIKE '%medical_records%'
      GROUP BY r.name
      ORDER BY r.name
    `);
    
    console.log('Permisos de HC por rol:');
    finalCheck.rows.forEach(row => {
      console.log(`   - ${row.role_name}: ${row.total_permissions} permisos`);
    });
    
    console.log('\n✅ Proceso completado exitosamente');
    console.log('\n💡 IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar sesión');
    console.log('   para que los nuevos permisos surtan efecto.\n');
    
  } catch (error) {
    console.error('❌ Error al aplicar permisos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
applyPermissions()
  .then(() => {
    console.log('🎉 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
