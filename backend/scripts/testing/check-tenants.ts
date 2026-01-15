import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos',
  synchronize: false,
});

async function checkTenants() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida con la base de datos\n');

    const tenants = await AppDataSource.query(`
      SELECT id, name, slug, status, plan, "created_at", "deleted_at"
      FROM tenants
      ORDER BY created_at DESC
    `);

    console.log('📊 TENANTS EXISTENTES:');
    console.log('='.repeat(80));
    
    if (tenants.length === 0) {
      console.log('No hay tenants en la base de datos.');
    } else {
      tenants.forEach((tenant: any, index: number) => {
        console.log(`\n${index + 1}. ${tenant.name}`);
        console.log(`   Slug: ${tenant.slug}`);
        console.log(`   Status: ${tenant.status}`);
        console.log(`   Plan: ${tenant.plan}`);
        console.log(`   Creado: ${new Date(tenant.created_at).toLocaleString()}`);
        console.log(`   Eliminado: ${tenant.deleted_at ? new Date(tenant.deleted_at).toLocaleString() : 'No'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${tenants.length} tenant(s)\n`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTenants();
