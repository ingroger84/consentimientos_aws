require('dotenv').config();
const { Client } = require('pg');

async function verifyPermissionsFixed() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar el tipo de dato de la columna permissions
    const columnResult = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'permissions'
    `);

    console.log('=== ESTRUCTURA DE COLUMNA PERMISSIONS ===\n');
    if (columnResult.rows.length > 0) {
      const col = columnResult.rows[0];
      console.log(`Nombre: ${col.column_name}`);
      console.log(`Tipo: ${col.data_type}`);
      console.log(`UDT: ${col.udt_name}\n`);
    }

    // Ver el rol Super Administrador con el tipo real
    const roleResult = await client.query(`
      SELECT 
        id,
        name,
        permissions,
        pg_typeof(permissions) as permissions_type
      FROM roles 
      WHERE name = 'Super Administrador'
    `);

    if (roleResult.rows.length > 0) {
      const role = roleResult.rows[0];
      console.log('=== ROL SUPER ADMINISTRADOR ===\n');
      console.log(`Nombre: ${role.name}`);
      console.log(`Tipo en PostgreSQL: ${role.permissions_type}`);
      console.log(`Tipo en Node.js: ${typeof role.permissions}`);
      console.log(`Es Array: ${Array.isArray(role.permissions)}`);
      
      // Intentar parsear
      let permissions = role.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
          console.log(`\n✓ Parseado exitosamente: ${permissions.length} permisos`);
        } catch (e) {
          console.log(`\n❌ Error al parsear: ${e.message}`);
        }
      }
      
      if (Array.isArray(permissions)) {
        const hasManageTenants = permissions.includes('manage_tenants');
        console.log(`\n¿Tiene manage_tenants? ${hasManageTenants ? '✓ SÍ' : '❌ NO'}`);
        
        console.log('\nPrimeros 10 permisos:');
        permissions.slice(0, 10).forEach(perm => {
          console.log(`  - ${perm}`);
        });
      }
    }

    console.log('\n✓ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

verifyPermissionsFixed();
