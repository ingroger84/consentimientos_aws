// Script para establecer un impuesto como predeterminado
const { Client } = require('pg');

async function setDefaultTax() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    await client.connect();
    
    console.log('Estableciendo impuesto por defecto...\n');

    // Primero, quitar el default de todos
    await client.query('UPDATE tax_configs SET "isDefault" = false;');

    // Establecer el "IVA 19%" como predeterminado (el que tiene descripción)
    const result = await client.query(`
      UPDATE tax_configs 
      SET "isDefault" = true 
      WHERE name = 'IVA 19%'
      RETURNING *;
    `);

    if (result.rows.length > 0) {
      const tax = result.rows[0];
      console.log('✓ Impuesto establecido como predeterminado:');
      console.log(`  Nombre: ${tax.name}`);
      console.log(`  Tasa: ${tax.rate}%`);
      console.log(`  Tipo: ${tax.applicationType}`);
      console.log('');
    } else {
      console.log('✗ No se encontró el impuesto "IVA 19%"');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
setDefaultTax();
