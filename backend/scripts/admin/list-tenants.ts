import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos',
});

async function listTenants() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const tenants = await AppDataSource.query(`
      SELECT id, name, slug, status, "contactEmail"
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    console.log(`📋 Tenants encontrados: ${tenants.length}\n`);
    
    if (tenants.length === 0) {
      console.log('No hay tenants creados.');
    } else {
      tenants.forEach((tenant: any, index: number) => {
        console.log(`${index + 1}. ${tenant.name}`);
        console.log(`   Slug:   ${tenant.slug}`);
        console.log(`   Email:  ${tenant.contactEmail}`);
        console.log(`   Estado: ${tenant.status}`);
        console.log(`   URL:    http://${tenant.slug}.localhost:5173`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

listTenants();
