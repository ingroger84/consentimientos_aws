// Script simple para verificar la migración
const { Client } = require('pg');

async function verifyMigration() {
  console.log('========================================');
  console.log('VERIFICACION DEL SISTEMA DE IMPUESTOS');
  console.log('========================================\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  let allPassed = true;

  try {
    console.log('1. Conectando a la base de datos...');
    await client.connect();
    console.log('   ✓ Conectado exitosamente\n');

    // Verificar columnas en invoices
    console.log('2. Verificando columnas en tabla invoices...');
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'invoices' 
        AND column_name IN ('taxExempt', 'taxExemptReason', 'taxConfigId')
      ORDER BY column_name;
    `;

    const columnsResult = await client.query(columnsQuery);
    
    const hasTaxExempt = columnsResult.rows.some(r => r.column_name === 'taxExempt');
    const hasTaxExemptReason = columnsResult.rows.some(r => r.column_name === 'taxExemptReason');
    const hasTaxConfigId = columnsResult.rows.some(r => r.column_name === 'taxConfigId');

    if (hasTaxExempt) {
      console.log('   ✓ Columna taxExempt existe');
    } else {
      console.log('   ✗ Columna taxExempt NO existe');
      allPassed = false;
    }

    if (hasTaxExemptReason) {
      console.log('   ✓ Columna taxExemptReason existe');
    } else {
      console.log('   ✗ Columna taxExemptReason NO existe');
      allPassed = false;
    }

    if (hasTaxConfigId) {
      console.log('   ✓ Columna taxConfigId existe');
    } else {
      console.log('   ✗ Columna taxConfigId NO existe');
      allPassed = false;
    }

    // Verificar tabla tax_configs
    console.log('\n3. Verificando tabla tax_configs...');
    const tableQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'tax_configs';
    `;

    const tableResult = await client.query(tableQuery);
    
    if (tableResult.rows[0].count > 0) {
      console.log('   ✓ Tabla tax_configs existe');

      // Contar configuraciones
      const countQuery = 'SELECT COUNT(*) as count FROM tax_configs;';
      const countResult = await client.query(countQuery);
      console.log(`   ✓ Configuraciones de impuestos: ${countResult.rows[0].count}`);
    } else {
      console.log('   ✗ Tabla tax_configs NO existe');
      allPassed = false;
    }

    // Resultado final
    console.log('\n========================================');
    if (allPassed) {
      console.log('✓ VERIFICACION EXITOSA');
      console.log('========================================\n');
      console.log('El sistema de impuestos esta correctamente instalado.\n');
      console.log('Proximos pasos:');
      console.log('1. Reinicia el servidor backend si esta corriendo');
      console.log('2. Reinicia el servidor frontend si esta corriendo');
      console.log('3. Accede a http://localhost:5173');
      console.log('4. Ve a "Configuracion de Impuestos"');
      console.log('5. Crea una configuracion de impuesto de prueba\n');
    } else {
      console.log('✗ VERIFICACION FALLIDA');
      console.log('========================================\n');
      console.log('Se encontraron problemas. Revisa los errores arriba.\n');
    }

  } catch (error) {
    console.error('\n✗ Error durante la verificacion:');
    console.error(error.message);
    allPassed = false;
  } finally {
    await client.end();
  }

  process.exit(allPassed ? 0 : 1);
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar verificación
verifyMigration();
