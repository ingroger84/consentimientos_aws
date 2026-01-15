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

async function addInvoicePermissions() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const roleRepository = AppDataSource.getRepository(Role);

    // Obtener todos los roles admin_general
    const roles = await roleRepository.find({
      where: {
        type: RoleType.ADMIN_GENERAL
      }
    });

    console.log(`\n📋 Encontrados ${roles.length} roles para actualizar\n`);

    let updated = 0;
    let skipped = 0;

    for (const role of roles) {
      let needsUpdate = false;

      if (!role.permissions.includes('view_invoices')) {
        role.permissions.push('view_invoices');
        needsUpdate = true;
      }

      if (!role.permissions.includes('pay_invoices')) {
        role.permissions.push('pay_invoices');
        needsUpdate = true;
      }

      if (needsUpdate) {
        await roleRepository.save(role);
        console.log(`✅ ${role.name} - Permisos agregados`);
        updated++;
      } else {
        console.log(`⏭️  ${role.name} - Ya tiene los permisos`);
        skipped++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Ya tenían los permisos: ${skipped}`);
    console.log(`   📋 Total procesados: ${roles.length}\n`);

    await AppDataSource.destroy();
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addInvoicePermissions();
