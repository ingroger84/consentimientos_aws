import { DataSource, In } from 'typeorm';
import { config } from 'dotenv';
import { Role, RoleType } from '../../src/roles/entities/role.entity';
import { User } from '../../src/users/entities/user.entity';
import { Tenant } from '../../src/tenants/entities/tenant.entity';
import { Branch } from '../../src/branches/entities/branch.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos',
  entities: [Role, User, Tenant, Branch],
  synchronize: false,
});

async function addConfigureEmailPermission() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const roleRepository = AppDataSource.getRepository(Role);

    // Obtener todos los roles admin_general y admin_sede
    const roles = await roleRepository.find({
      where: {
        type: In([RoleType.ADMIN_GENERAL, RoleType.ADMIN_SEDE])
      }
    });

    console.log(`\n📋 Encontrados ${roles.length} roles para actualizar\n`);

    let updated = 0;
    let skipped = 0;

    for (const role of roles) {
      if (role.permissions.includes('configure_email')) {
        console.log(`⏭️  ${role.name} - Ya tiene el permiso`);
        skipped++;
      } else {
        role.permissions.push('configure_email');
        await roleRepository.save(role);
        console.log(`✅ ${role.name} - Permiso agregado`);
        updated++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Ya tenían el permiso: ${skipped}`);
    console.log(`   📋 Total procesados: ${roles.length}\n`);

    await AppDataSource.destroy();
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addConfigureEmailPermission();
