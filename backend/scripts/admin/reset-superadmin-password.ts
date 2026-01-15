import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
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

async function resetSuperAdminPassword() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const userRepo = dataSource.getRepository(User);
    
    // Buscar Super Admin
    const superAdmin = await userRepo.findOne({
      where: { email: 'superadmin@sistema.com' },
    });

    if (!superAdmin) {
      console.log('❌ Super Admin NO encontrado');
      await dataSource.destroy();
      process.exit(1);
    }

    console.log('👤 Super Admin encontrado:');
    console.log('  ID:', superAdmin.id);
    console.log('  Nombre:', superAdmin.name);
    console.log('  Email:', superAdmin.email);
    console.log('  Password actual:', superAdmin.password ? 'Existe' : '❌ NULL');

    // Generar nuevo hash de contraseña
    const newPassword = 'superadmin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('\n🔐 Actualizando contraseña...');
    
    // Actualizar contraseña
    superAdmin.password = hashedPassword;
    await userRepo.save(superAdmin);

    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('\n📧 Credenciales:');
    console.log('  Email:', superAdmin.email);
    console.log('  Password:', newPassword);
    console.log('\n🌐 Acceso:');
    console.log('  URL: http://admin.localhost:5173');
    console.log('  o');
    console.log('  URL: http://localhost:5173');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSuperAdminPassword();
