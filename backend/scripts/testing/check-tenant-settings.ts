import { DataSource } from 'typeorm';
import { AppSettings } from './src/settings/entities/app-settings.entity';
import { Tenant } from './src/tenants/entities/tenant.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'consentimientos',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function checkTenantSettings() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const tenantRepo = dataSource.getRepository(Tenant);
    const settingsRepo = dataSource.getRepository(AppSettings);
    
    // Buscar tenant "demo-medico"
    const tenant = await tenantRepo.findOne({
      where: { slug: 'demo-medico' },
    });

    if (!tenant) {
      console.log('❌ Tenant "demo-medico" NO encontrado');
      await dataSource.destroy();
      process.exit(1);
    }

    console.log('👤 Tenant encontrado:');
    console.log('  ID:', tenant.id);
    console.log('  Nombre:', tenant.name);
    console.log('  Slug:', tenant.slug);
    console.log('  Email:', tenant.contactEmail);

    // Buscar settings del tenant
    console.log('\n📋 Settings del tenant:');
    const tenantSettings = await settingsRepo.find({
      where: { tenantId: tenant.id },
    });

    if (tenantSettings.length === 0) {
      console.log('  ❌ NO hay settings para este tenant');
    } else {
      console.log(`  ✅ Encontrados ${tenantSettings.length} settings:`);
      tenantSettings.forEach(setting => {
        console.log(`    - ${setting.key}: ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
      });
    }

    // Buscar settings del Super Admin (tenantId = null)
    console.log('\n📋 Settings del Super Admin (tenantId = NULL):');
    const superAdminSettings = await settingsRepo.find({
      where: { tenantId: null as any },
    });

    if (superAdminSettings.length === 0) {
      console.log('  ❌ NO hay settings para Super Admin');
    } else {
      console.log(`  ✅ Encontrados ${superAdminSettings.length} settings:`);
      superAdminSettings.forEach(setting => {
        console.log(`    - ${setting.key}: ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
      });
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTenantSettings();
