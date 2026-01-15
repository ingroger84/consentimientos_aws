const { Client } = require('pg');
require('dotenv').config();

async function migrateStatus() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos_db',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Paso 1: Agregar el nuevo valor al enum
    console.log('Agregando valor "voided" al enum...');
    await client.query(`ALTER TYPE invoices_status_enum ADD VALUE IF NOT EXISTS 'voided'`);
    console.log('✅ Valor agregado\n');

    // Paso 2: Actualizar las facturas existentes
    console.log('Actualizando facturas de "cancelled" a "voided"...');
    const result = await client.query(`
      UPDATE invoices 
      SET status = 'voided' 
      WHERE status = 'cancelled'
    `);
    console.log(`✅ Actualizado ${result.rowCount} facturas\n`);

    // Paso 3: Verificar el cambio
    console.log('Verificando estados de facturas:');
    const verification = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM invoices 
      GROUP BY status
      ORDER BY status
    `);
    
    console.table(verification.rows);

    await client.end();
    console.log('\n✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateStatus();
