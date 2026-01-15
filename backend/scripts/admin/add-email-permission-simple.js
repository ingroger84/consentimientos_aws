const { Client } = require('pg');
require('dotenv').config();

async function addPermission() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Actualizar roles
    const result = await client.query(`
      UPDATE roles
      SET permissions = permissions || ',configure_email'
      WHERE type IN ('ADMIN_GENERAL', 'ADMIN_SEDE')
      AND NOT (permissions LIKE '%configure_email%')
      RETURNING id, name, type
    `);

    console.log(`✅ ${result.rowCount} roles actualizados\n`);

    // Mostrar roles actualizados
    if (result.rowCount > 0) {
      console.log('Roles actualizados:');
      result.rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
      });
    }

    // Verificar todos los roles
    const verify = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE type IN ('ADMIN_GENERAL', 'ADMIN_SEDE')
      ORDER BY name
    `);

    console.log('\n📋 Estado actual de los roles:');
    verify.rows.forEach(row => {
      const hasPermission = row.permissions.includes('configure_email');
      const icon = hasPermission ? '✅' : '❌';
      console.log(`  ${icon} ${row.name} (${row.type})`);
      if (hasPermission) {
        console.log(`     Permisos: ${row.permissions.split(',').length} permisos`);
      }
    });

    await client.end();
    console.log('\n✅ Script completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPermission();
