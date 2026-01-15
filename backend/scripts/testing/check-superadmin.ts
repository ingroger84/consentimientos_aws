import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
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

async function checkSuperAdmin() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const userRepo = dataSource.getRepository(User);
    
    // Buscar Super Admin
    const superAdmin = await userRepo.findOne({
      where: { email: 'superadmin@sistema.com' },
      relations: ['role', 'tenant'],
      select: ['id', 'name', 'email', 'isActive', 'password', 'deletedAt'],
    });

    if (superAdmin) {
      console.log('👤 Super Admin encontrado:');
      console.log('  ID:', superAdmin.id);
      console.log('  Nombre:', superAdmin.name);
      console.log('  Email:', superAdmin.email);
      console.log('  Activo:', superAdmin.isActive);
      console.log('  Tenant ID:', superAdmin.tenant?.id || 'NULL (Super Admin)');
      console.log('  Rol:', superAdmin.role?.name || 'Sin rol');
      console.log('  Eliminado:', superAdmin.deletedAt ? 'SÍ' : 'NO');
      
      // Verificar password hash
      console.log('\n🔐 Password Hash:');
      if (superAdmin.password) {
        console.log('  ', superAdmin.password.substring(0, 20) + '...');
      } else {
        console.log('  ❌ PASSWORD ES NULL O UNDEFINED');
      }
    } else {
      console.log('❌ Super Admin NO encontrado');
      console.log('\n📋 Usuarios en la base de datos:');
      
      const allUsers = await userRepo.find({
        relations: ['role', 'tenant'],
        withDeleted: true,
      });
      
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log('   Email:', user.email);
        console.log('   Tenant:', user.tenant?.id || 'NULL (Super Admin)');
        console.log('   Eliminado:', user.deletedAt ? 'SÍ' : 'NO');
      });
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSuperAdmin();
