const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin123',
    database: 'consentimientos',
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'create-tax-config-table.sql'),
      'utf8'
    );

    await client.query(sql);
    console.log('✓ Tabla tax_configs creada correctamente');
    console.log('✓ Columna taxConfigId agregada a invoices');
    console.log('✓ Configuración de impuesto por defecto insertada');
  } catch (error) {
    console.error('Error ejecutando migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
