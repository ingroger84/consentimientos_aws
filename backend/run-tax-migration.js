// Script simple para ejecutar la migración de impuestos
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('========================================');
  console.log('MIGRACION: Facturas Exentas de Impuestos');
  console.log('========================================\n');

  // Configuración de la base de datos desde .env
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    console.log('✓ Conectado exitosamente\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-tax-exempt-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando migracion...');
    console.log('Agregando columnas:');
    console.log('  - taxExempt (boolean, default: false)');
    console.log('  - taxExemptReason (text, nullable)\n');

    // Ejecutar el SQL
    await client.query(sql);

    console.log('✓ Migracion aplicada exitosamente\n');

    // Verificar las columnas
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'invoices' 
        AND column_name IN ('taxExempt', 'taxExemptReason')
      ORDER BY column_name;
    `;

    const result = await client.query(verifyQuery);
    
    if (result.rows.length > 0) {
      console.log('Verificacion:');
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.column_name} (${row.data_type})`);
      });
    }

    console.log('\n========================================');
    console.log('MIGRACION COMPLETADA');
    console.log('========================================\n');
    console.log('Proximos pasos:');
    console.log('1. Reinicia el servidor backend si esta corriendo');
    console.log('2. Verifica que las facturas se muestren correctamente');
    console.log('3. Consulta la documentacion en doc/14-impuestos/MEJORAS_IMPLEMENTADAS.md\n');

  } catch (error) {
    console.error('\n✗ Error al aplicar la migracion:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar migración
runMigration();
