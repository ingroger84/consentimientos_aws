const { Client } = require('pg');
require('dotenv').config();

async function checkPermission() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'consentimientos',
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Buscar el rol de Administrador
    console.log('\n📋 Buscando rol Administrador...');
    const query = `
      SELECT id, name, type, permissions
      FROM roles
      WHERE LOWER(name) LIKE '%admin%'
      ORDER BY name;
    `;
    const result = await client.query(query);
    
    console.log(`\nRoles encontrados: ${result.rows.length}`);
    
    for (const row of result.rows) {
      console.log(`\n${row.name} (${row.type}):`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Permisos: ${row.permissions}`);
      const hasPermission = row.permissions && row.permissions.includes('delete:medical-record-consents');
      console.log(`  Tiene permiso delete:medical-record-consents: ${hasPermission ? 'SÍ ✅' : 'NO ❌'}`);
      
      if (!hasPermission) {
        console.log(`\n  🔧 Agregando permiso...`);
        const newPermissions = row.permissions + ',delete:medical-record-consents';
        await client.query('UPDATE roles SET permissions = $1 WHERE id = $2', [newPermissions, row.id]);
        console.log(`  ✅ Permiso agregado a ${row.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkPermission()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
