import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkTenantDemo() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar tenant "demo" incluyendo eliminados
    const tenants = await dataSource.query(`
      SELECT id, name, slug, status, deleted_at
      FROM tenants
      WHERE slug = 'demo'
    `);

    console.log('========== TENANT "demo" ==========\n');
    
    if (tenants.length === 0) {
      console.log('❌ No se encontró ningún tenant con slug "demo"');
    } else {
      tenants.forEach((tenant: any) => {
        console.log(`ID: ${tenant.id}`);
        console.log(`Name: ${tenant.name}`);
        console.log(`Slug: ${tenant.slug}`);
        console.log(`Status: ${tenant.status}`);
        console.log(`Deleted At: ${tenant.deleted_at || 'NULL (no eliminado)'}`);
        console.log('');
      });
    }

    // Listar todos los tenants activos
    const activeTenants = await dataSource.query(`
      SELECT id, name, slug, status
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    console.log('========== TENANTS ACTIVOS ==========\n');
    activeTenants.forEach((tenant: any) => {
      console.log(`${tenant.name} (${tenant.slug}) - ${tenant.status}`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTenantDemo();
