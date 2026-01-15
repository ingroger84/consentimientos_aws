import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateInvoiceStatus() {
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

    // Actualizar facturas con estado 'cancelled' a 'voided'
    const result = await dataSource.query(`
      UPDATE invoices 
      SET status = 'voided' 
      WHERE status = 'cancelled'
    `);

    console.log(`✅ Actualizado ${result[1]} facturas de 'cancelled' a 'voided'\n`);

    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateInvoiceStatus();
