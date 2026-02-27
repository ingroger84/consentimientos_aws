const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyPermissions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'consentimientos',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    console.log('=== Aplicando Permisos: Plantillas HC ===\n');
    
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-mr-consent-templates-permissions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script
    console.log('Ejecutando script de permisos...');
    await client.query(sql);
    console.log('✓ Permisos aplicados exitosamente\n');

    console.log('✓ Proceso completado');

  } catch (error) {
    console.error('\n❌ Error al aplicar permisos:');
    console.error(error.message);
    if (error.detail) {
      console.error('Detalle:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyPermissions();
