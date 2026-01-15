import { DataSource } from 'typeorm';
import { Role, RoleType } from './src/roles/entities/role.entity';
import { ROLE_PERMISSIONS } from './src/auth/constants/permissions';

async function updateOperadorPermissions() {
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

  console.log('🔄 Actualizando permisos del rol Operador...\n');

  const roleRepo = dataSource.getRepository(Role);
  
  // Buscar el rol Operador
  const operadorRole = await roleRepo.findOne({ 
    where: { type: RoleType.OPERADOR } 
  });

  if (!operadorRole) {
    console.log('❌ No se encontró el rol Operador');
    await dataSource.destroy();
    return;
  }

  console.log('📋 Permisos actuales del Operador:');
  console.log(operadorRole.permissions);
  console.log('');

  // Actualizar con los permisos definidos en ROLE_PERMISSIONS
  operadorRole.permissions = [...ROLE_PERMISSIONS.OPERADOR];
  
  await roleRepo.save(operadorRole);

  console.log('✅ Permisos actualizados del Operador:');
  console.log(operadorRole.permissions);
  console.log('');

  console.log('🎉 Actualización completada!\n');
  console.log('Los usuarios con rol Operador ahora tienen los siguientes permisos:');
  operadorRole.permissions.forEach(permission => {
    console.log(`  - ${permission}`);
  });

  await dataSource.destroy();
}

updateOperadorPermissions().catch((error) => {
  console.error('❌ Error al actualizar permisos:', error);
  process.exit(1);
});
