import { DataSource } from 'typeorm';
import { Branch } from './src/branches/entities/branch.entity';
import { Service } from './src/services/entities/service.entity';
import { Tenant } from './src/tenants/entities/tenant.entity';

async function checkData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('🔍 Verificando datos...\n');

  try {
    // Verificar tenants
    const tenantRepo = dataSource.getRepository(Tenant);
    const tenants = await tenantRepo.find();
    console.log('🏢 Tenants:');
    tenants.forEach(t => {
      console.log(`   - ${t.name} (${t.slug}) - ID: ${t.id}`);
    });

    // Verificar sedes
    const branchRepo = dataSource.getRepository(Branch);
    const branches = await branchRepo.find({ relations: ['tenant'] });
    console.log('\n📍 Sedes:');
    branches.forEach(b => {
      console.log(`   - ${b.name} - Tenant: ${b.tenant?.name || 'SIN TENANT'} - ID: ${b.id}`);
    });

    // Verificar servicios
    const serviceRepo = dataSource.getRepository(Service);
    const services = await serviceRepo.find({ relations: ['tenant'] });
    console.log('\n💼 Servicios:');
    services.forEach(s => {
      console.log(`   - ${s.name} - Tenant: ${s.tenant?.name || 'SIN TENANT'} - ID: ${s.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkData();
