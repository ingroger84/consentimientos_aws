import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkInvoiceItems() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos_db',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Consultar facturas con sus items
    const invoices = await dataSource.query(`
      SELECT 
        id,
        "invoiceNumber",
        "tenantId",
        amount,
        tax,
        total,
        items,
        status,
        "createdAt"
      FROM invoices
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log(`📋 Total de facturas encontradas: ${invoices.length}\n`);

    invoices.forEach((invoice, index) => {
      console.log(`\n--- Factura ${index + 1} ---`);
      console.log(`ID: ${invoice.id}`);
      console.log(`Número: ${invoice.invoiceNumber}`);
      console.log(`Tenant ID: ${invoice.tenantId}`);
      console.log(`Subtotal: $${invoice.amount}`);
      console.log(`IVA: $${invoice.tax}`);
      console.log(`Total: $${invoice.total}`);
      console.log(`Estado: ${invoice.status}`);
      console.log(`Fecha: ${invoice.createdAt}`);
      console.log(`\nItems (tipo: ${typeof invoice.items}):`);
      
      if (invoice.items) {
        console.log(`Items es un: ${Array.isArray(invoice.items) ? 'array' : typeof invoice.items}`);
        console.log(`Cantidad de items: ${Array.isArray(invoice.items) ? invoice.items.length : 'N/A'}`);
        console.log('Contenido de items:');
        console.log(JSON.stringify(invoice.items, null, 2));
      } else {
        console.log('⚠️  Items es NULL o undefined');
      }
    });

    await dataSource.destroy();
    console.log('\n✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkInvoiceItems();
