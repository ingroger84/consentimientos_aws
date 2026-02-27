const { Client } = require('pg');
require('dotenv').config();

async function checkStructure() {
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

    // Ver estructura de la tabla roles
    console.log('\n📋 Estructura de la tabla roles:');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'roles'
      ORDER BY ordinal_position;
    `;
    const structureResult = await client.query(structureQuery);
    console.table(structureResult.rows);

    // Ver algunos roles de ejemplo
    console.log('\n📋 Roles existentes:');
    const rolesQuery = `
      SELECT id, name, type, permissions
      FROM roles
      WHERE name IN ('Administrador', 'Médico', 'Operador')
      LIMIT 5;
    `;
    const rolesResult = await client.query(rolesQuery);
    console.log(JSON.stringify(rolesResult.rows, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
