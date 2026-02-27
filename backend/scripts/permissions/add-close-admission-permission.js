require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function addClosePermission() {
  try {
    console.log('Conectado a la base de datos');
    console.log('');

    const permissionToAdd = 'close_medical_records';
    const rolesToUpdate = ['Operador', 'Admin Sede', 'Admin General'];
    
    for (const roleName of rolesToUpdate) {
      // 1. Buscar el rol
      const roleResult = await pool.query(`
        SELECT id, name, permissions FROM roles WHERE name = $1
      `, [roleName]);

      if (roleResult.rows.length === 0) {
        console.log(`⚠ Rol ${roleName} no encontrado`);
        continue;
      }

      const role = roleResult.rows[0];
      
      // 2. Convertir permisos de string a array
      let currentPermissions = [];
      if (role.permissions && typeof role.permissions === 'string') {
        currentPermissions = role.permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }

      // 3. Verificar si ya tiene el permiso
      if (currentPermissions.includes(permissionToAdd)) {
        console.log(`✓ Rol ${roleName} ya tiene el permiso ${permissionToAdd}`);
        continue;
      }

      // 4. Agregar el permiso
      currentPermissions.push(permissionToAdd);
      const newPermissionsString = currentPermissions.join(',');

      await pool.query(`
        UPDATE roles 
        SET permissions = $1, updated_at = NOW()
        WHERE id = $2
      `, [newPermissionsString, role.id]);

      console.log(`✓ Permiso ${permissionToAdd} agregado al rol ${roleName}`);
      console.log(`  Total permisos: ${currentPermissions.length}`);
    }

    console.log('\n✅ Proceso completado');
    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

addClosePermission();
