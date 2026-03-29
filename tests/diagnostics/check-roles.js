require('dotenv').config();
const { Client } = require('pg');

async function checkRoles() {
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

    // Ver todos los roles
    const rolesResult = await client.query(`
      SELECT * FROM roles ORDER BY created_at
    `);

    console.log(`=== ROLES EN EL SISTEMA (${rolesResult.rows.length}) ===\n`);
    
    rolesResult.rows.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Tenant ID: ${role.tenantId || role.tenant_id || 'null (global)'}`);
      console.log(`   Permisos: ${role.permissions ? role.permissions.length : 0}`);
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.slice(0, 5).forEach(perm => {
          console.log(`     - ${perm}`);
        });
        if (role.permissions.length > 5) {
          console.log(`     ... y ${role.permissions.length - 5} más`);
        }
      }
      console.log('');
    });

    console.log('✓ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkRoles();
