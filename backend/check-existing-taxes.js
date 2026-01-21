// Script para verificar impuestos existentes
const { Client } = require('pg');

async function checkTaxes() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    await client.connect();
    
    console.log('========================================');
    console.log('IMPUESTOS EXISTENTES EN LA BASE DE DATOS');
    console.log('========================================\n');

    const query = 'SELECT * FROM tax_configs ORDER BY "createdAt" DESC;';
    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log('No hay impuestos configurados.\n');
    } else {
      console.log(`Total de impuestos: ${result.rows.length}\n`);
      
      result.rows.forEach((tax, index) => {
        console.log(`${index + 1}. ${tax.name}`);
        console.log(`   ID: ${tax.id}`);
        console.log(`   Tasa: ${tax.rate}%`);
        console.log(`   Tipo: ${tax.applicationType}`);
        console.log(`   Activo: ${tax.isActive ? 'Sí' : 'No'}`);
        console.log(`   Por defecto: ${tax.isDefault ? 'Sí' : 'No'}`);
        if (tax.description) {
          console.log(`   Descripción: ${tax.description}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
checkTaxes();
