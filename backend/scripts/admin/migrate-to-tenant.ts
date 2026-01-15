import { DataSource } from 'typeorm';
import { Branch } from './src/branches/entities/branch.entity';
import { Service } from './src/services/entities/service.entity';
import { Consent } from './src/consents/entities/consent.entity';
import { User } from './src/users/entities/user.entity';
import { Tenant } from './src/tenants/entities/tenant.entity';

async function migrateToTenant() {
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
  console.log('🔄 Migrando datos al sistema multi-tenant...\n');

  try {
    const branchRepo = dataSource.getRepository(Branch);
    const serviceRepo = dataSource.getRepository(Service);
    const consentRepo = dataSource.getRepository(Consent);
    const userRepo = dataSource.getRepository(User);
    const tenantRepo = dataSource.getRepository(Tenant);

    // Obtener el tenant demo
    const demoTenant = await tenantRepo.findOne({ where: { slug: 'clinica-demo' } });
    if (!demoTenant) {
      throw new Error('No se encontró el tenant demo');
    }
    console.log(`✅ Tenant encontrado: ${demoTenant.name}\n`);

    // 1. Obtener sedes con y sin tenant
    const branchesWithTenant = await branchRepo.find({ 
      where: { tenant: { id: demoTenant.id } } 
    });
    const branchesWithoutTenant = await branchRepo
      .createQueryBuilder('branch')
      .where('branch.tenantId IS NULL')
      .getMany();

    console.log('📍 Sedes:');
    console.log(`   Con tenant: ${branchesWithTenant.length}`);
    console.log(`   Sin tenant: ${branchesWithoutTenant.length}`);

    // Crear mapeo de sedes antiguas a nuevas
    const branchMapping = new Map<string, string>();
    branchesWithoutTenant.forEach(oldBranch => {
      const newBranch = branchesWithTenant.find(b => b.name === oldBranch.name);
      if (newBranch) {
        branchMapping.set(oldBranch.id, newBranch.id);
        console.log(`   Mapeo: ${oldBranch.name} -> ${newBranch.name}`);
      }
    });

    // 2. Obtener servicios con y sin tenant
    const servicesWithTenant = await serviceRepo.find({ 
      where: { tenant: { id: demoTenant.id } } 
    });
    const servicesWithoutTenant = await serviceRepo
      .createQueryBuilder('service')
      .where('service.tenantId IS NULL')
      .getMany();

    console.log('\n💼 Servicios:');
    console.log(`   Con tenant: ${servicesWithTenant.length}`);
    console.log(`   Sin tenant: ${servicesWithoutTenant.length}`);

    // Crear mapeo de servicios antiguos a nuevos
    const serviceMapping = new Map<string, string>();
    servicesWithoutTenant.forEach(oldService => {
      const newService = servicesWithTenant.find(s => s.name === oldService.name);
      if (newService) {
        serviceMapping.set(oldService.id, newService.id);
        console.log(`   Mapeo: ${oldService.name} -> ${newService.name}`);
      }
    });

    // 3. Actualizar consentimientos
    console.log('\n📄 Actualizando consentimientos...');
    const consents = await consentRepo.find({ relations: ['branch', 'service'] });
    let updatedConsents = 0;

    for (const consent of consents) {
      let needsUpdate = false;

      // Actualizar branch si es necesario
      if (consent.branch && branchMapping.has(consent.branch.id)) {
        const newBranchId = branchMapping.get(consent.branch.id)!;
        const newBranch = await branchRepo.findOne({ where: { id: newBranchId } });
        if (newBranch) {
          consent.branch = newBranch;
          needsUpdate = true;
        }
      }

      // Actualizar service si es necesario
      if (consent.service && serviceMapping.has(consent.service.id)) {
        const newServiceId = serviceMapping.get(consent.service.id)!;
        const newService = await serviceRepo.findOne({ where: { id: newServiceId } });
        if (newService) {
          consent.service = newService;
          needsUpdate = true;
        }
      }

      // Agregar tenant si no tiene
      if (!consent.tenant) {
        consent.tenant = demoTenant;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await consentRepo.save(consent);
        updatedConsents++;
      }
    }

    console.log(`✅ Actualizados ${updatedConsents} consentimientos`);

    // 4. Actualizar usuarios sin tenant
    console.log('\n👥 Actualizando usuarios...');
    const usersWithoutTenant = await userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.tenantId IS NULL')
      .andWhere('role.type != :superAdmin', { superAdmin: 'super_admin' })
      .getMany();

    for (const user of usersWithoutTenant) {
      user.tenant = demoTenant;
      await userRepo.save(user);
    }

    console.log(`✅ Actualizados ${usersWithoutTenant.length} usuarios`);

    // 5. Ahora sí, eliminar datos antiguos
    console.log('\n🗑️ Eliminando datos antiguos...');
    
    if (branchesWithoutTenant.length > 0) {
      await branchRepo.remove(branchesWithoutTenant);
      console.log(`✅ Eliminadas ${branchesWithoutTenant.length} sedes antiguas`);
    }

    if (servicesWithoutTenant.length > 0) {
      await serviceRepo.remove(servicesWithoutTenant);
      console.log(`✅ Eliminados ${servicesWithoutTenant.length} servicios antiguos`);
    }

    // Resumen final
    console.log('\n📊 Resumen final:');
    const finalBranches = await branchRepo.count();
    const finalServices = await serviceRepo.count();
    const finalConsents = await consentRepo.count();
    const finalUsers = await userRepo.count();

    console.log(`   Sedes: ${finalBranches}`);
    console.log(`   Servicios: ${finalServices}`);
    console.log(`   Consentimientos: ${finalConsents}`);
    console.log(`   Usuarios: ${finalUsers}`);

    console.log('\n🎉 Migración completada exitosamente!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

migrateToTenant().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
