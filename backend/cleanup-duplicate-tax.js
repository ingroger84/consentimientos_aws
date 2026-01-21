// Script para eliminar el impuesto duplicado "IVA" (sin descripción)
const { Client } = require('pg');

async function cleanupDuplicate() {
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
    console.log('LIMPIEZA DE IMPUESTO DUPLICADO');
    console.log('========================================\n');

    // Verificar si hay facturas usando este impuesto
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM invoices 
      WHERE "taxConfigId" = (
        SELECT id FROM tax_configs WHERE name = 'IVA' AND (description IS NULL OR description = '')
      );
    `;
    
    const checkResult = await client.query(checkQuery);
    const invoiceCount = parseInt(checkResult.rows[0].count);

    if (invoiceCount > 0) {
      console.log(`⚠ ADVERTENCIA: Hay ${invoiceCount} factura(s) usando este impuesto.`);
      console.log('No se puede eliminar porque tiene facturas asociadas.\n');
      console.log('Recomendación: Desactívalo en lugar de eliminarlo.');
      return;
    }

    // Eliminar el impuesto "IVA" sin descripción
    const deleteQuery = `
      DELETE FROM tax_configs 
      WHERE name = 'IVA' AND (description IS NULL OR description = '')
      RETURNING *;
    `;

    const result = await client.query(deleteQuery);

    if (result.rows.length > 0) {
      console.log('✓ Impuesto duplicado eliminado:');
      console.log(`  Nombre: ${result.rows[0].name}`);
      console.log(`  ID: ${result.rows[0].id}`);
      console.log('');
      console.log('Ahora solo queda el impuesto "IVA 19%" con descripción.');
      console.log('Este impuesto ya está establecido como predeterminado.\n');
    } else {
      console.log('✗ No se encontró el impuesto duplicado para eliminar.\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
cleanupDuplicate();
