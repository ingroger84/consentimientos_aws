import { DataSource } from 'typeorm';
import { Branch } from './src/branches/entities/branch.entity';
import { Service } from './src/services/entities/service.entity';

async function deleteOldData() {
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
  console.log('🗑️ Eliminando datos antiguos sin tenant...\n');

  try {
    const branchRepo = dataSource.getRepository(Branch);
    const serviceRepo = dataSource.getRepository(Service);

    // Eliminar sedes sin tenant
    console.log('📍 Eliminando sedes sin tenant...');
    const branchesWithoutTenant = await branchRepo
      .createQueryBuilder('branch')
      .where('branch.tenantId IS NULL')
      .getMany();
    
    if (branchesWithoutTenant.length > 0) {
      await branchRepo.remove(branchesWithoutTenant);
      console.log(`✅ Eliminadas ${branchesWithoutTenant.length} sedes sin tenant`);
      branchesWithoutTenant.forEach(b => {
        console.log(`   - ${b.name}`);
      });
    } else {
      console.log('✅ No hay sedes sin tenant');
    }

    // Eliminar servicios sin tenant
    console.log('\n💼 Eliminando servicios sin tenant...');
    const servicesWithoutTenant = await serviceRepo
      .createQueryBuilder('service')
      .where('service.tenantId IS NULL')
      .getMany();
    
    if (servicesWithoutTenant.length > 0) {
      await serviceRepo.remove(servicesWithoutTenant);
      console.log(`✅ Eliminados ${servicesWithoutTenant.length} servicios sin tenant`);
      servicesWithoutTenant.forEach(s => {
        console.log(`   - ${s.name}`);
      });
    } else {
      console.log('✅ No hay servicios sin tenant');
    }

    // Mostrar resumen final
    console.log('\n📊 Resumen final:');
    const finalBranches = await branchRepo.count();
    const finalServices = await serviceRepo.count();

    console.log(`   Sedes: ${finalBranches}`);
    console.log(`   Servicios: ${finalServices}`);

    console.log('\n🎉 Limpieza completada exitosamente!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

deleteOldData().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
