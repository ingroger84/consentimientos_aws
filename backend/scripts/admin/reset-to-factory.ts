import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleType } from './src/roles/entities/role.entity';
import { User } from './src/users/entities/user.entity';

async function resetToFactory() {
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
  console.log('🏭 Reseteando base de datos a estado de fábrica...\n');

  try {
    // 1. Eliminar todos los consentimientos
    console.log('📄 Eliminando consentimientos...');
    await dataSource.query('DELETE FROM answers');
    await dataSource.query('DELETE FROM consents');
    const consentsCount = await dataSource.query('SELECT COUNT(*) FROM consents');
    console.log(`✅ Consentimientos eliminados. Restantes: ${consentsCount[0].count}`);

    // 2. Eliminar todas las preguntas
    console.log('\n❓ Eliminando preguntas...');
    await dataSource.query('DELETE FROM questions');
    const questionsCount = await dataSource.query('SELECT COUNT(*) FROM questions');
    console.log(`✅ Preguntas eliminadas. Restantes: ${questionsCount[0].count}`);

    // 3. Eliminar todos los servicios
    console.log('\n💼 Eliminando servicios...');
    await dataSource.query('DELETE FROM services');
    const servicesCount = await dataSource.query('SELECT COUNT(*) FROM services');
    console.log(`✅ Servicios eliminados. Restantes: ${servicesCount[0].count}`);

    // 4. Eliminar relación usuarios-sedes
    console.log('\n🔗 Eliminando relaciones usuarios-sedes...');
    try {
      await dataSource.query('DELETE FROM user_branches');
      console.log('✅ Relaciones eliminadas');
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('⚠️ Tabla de relaciones no encontrada (puede no existir)');
      } else {
        throw error;
      }
    }

    // 5. Eliminar todas las sedes
    console.log('\n🏢 Eliminando sedes...');
    await dataSource.query('DELETE FROM branches');
    const branchesCount = await dataSource.query('SELECT COUNT(*) FROM branches');
    console.log(`✅ Sedes eliminadas. Restantes: ${branchesCount[0].count}`);

    // 6. Eliminar todos los usuarios excepto super admin
    console.log('\n👥 Eliminando usuarios (excepto super admin)...');
    const roleRepo = dataSource.getRepository(Role);
    const superAdminRole = await roleRepo.findOne({ where: { type: RoleType.SUPER_ADMIN } });
    
    if (superAdminRole) {
      await dataSource.query(
        'DELETE FROM users WHERE "roleId" != $1',
        [superAdminRole.id]
      );
    } else {
      console.log('⚠️ No se encontró el rol super_admin');
    }
    
    const usersCount = await dataSource.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Usuarios eliminados. Restantes: ${usersCount[0].count}`);

    // 7. Eliminar todos los tenants
    console.log('\n🏢 Eliminando tenants...');
    await dataSource.query('DELETE FROM tenants');
    const tenantsCount = await dataSource.query('SELECT COUNT(*) FROM tenants');
    console.log(`✅ Tenants eliminados. Restantes: ${tenantsCount[0].count}`);

    // 8. Verificar/Crear rol Super Admin si no existe
    console.log('\n🛡️ Verificando rol Super Admin...');
    let superAdmin = await roleRepo.findOne({ where: { type: RoleType.SUPER_ADMIN } });
    
    if (!superAdmin) {
      console.log('Creando rol Super Admin...');
      superAdmin = roleRepo.create({
        name: 'Super Administrador',
        type: RoleType.SUPER_ADMIN,
        description: 'Acceso total al sistema multi-tenant',
        permissions: [
          'view_dashboard',
          'view_consents',
          'create_consents',
          'edit_consents',
          'delete_consents',
          'view_users',
          'create_users',
          'edit_users',
          'delete_users',
          'change_passwords',
          'view_roles',
          'edit_roles',
          'view_branches',
          'create_branches',
          'edit_branches',
          'delete_branches',
          'view_services',
          'create_services',
          'edit_services',
          'delete_services',
          'view_questions',
          'create_questions',
          'edit_questions',
          'delete_questions',
          'view_settings',
          'edit_settings',
          'manage_tenants',
          'view_global_stats',
        ],
      });
      await roleRepo.save(superAdmin);
      console.log('✅ Rol Super Admin creado');
    } else {
      console.log('✅ Rol Super Admin ya existe');
    }

    // 9. Verificar/Crear usuario Super Admin
    console.log('\n👤 Verificando usuario Super Admin...');
    const userRepo = dataSource.getRepository(User);
    let superAdminUser = await userRepo.findOne({ 
      where: { email: 'superadmin@sistema.com' },
      relations: ['role']
    });

    if (!superAdminUser) {
      console.log('Creando usuario Super Admin...');
      superAdminUser = userRepo.create({
        name: 'Super Admin',
        email: 'superadmin@sistema.com',
        password: await bcrypt.hash('superadmin123', 10),
        role: superAdmin,
        branches: [],
      });
      await userRepo.save(superAdminUser);
      console.log('✅ Usuario Super Admin creado');
    } else {
      // Actualizar contraseña por si acaso
      superAdminUser.password = await bcrypt.hash('superadmin123', 10);
      superAdminUser.role = superAdmin;
      await userRepo.save(superAdminUser);
      console.log('✅ Usuario Super Admin actualizado');
    }

    // 10. Limpiar archivos subidos (opcional)
    console.log('\n📁 Nota: Los archivos en /uploads no se eliminan automáticamente');
    console.log('   Si deseas limpiarlos, elimina manualmente la carpeta backend/uploads');

    // Resumen final
    console.log('\n📊 Estado final de la base de datos:');
    const finalStats = await dataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as tenants,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM branches) as branches,
        (SELECT COUNT(*) FROM services) as services,
        (SELECT COUNT(*) FROM questions) as questions,
        (SELECT COUNT(*) FROM consents) as consents
    `);
    
    console.log(`   Tenants: ${finalStats[0].tenants}`);
    console.log(`   Usuarios: ${finalStats[0].users}`);
    console.log(`   Roles: ${finalStats[0].roles}`);
    console.log(`   Sedes: ${finalStats[0].branches}`);
    console.log(`   Servicios: ${finalStats[0].services}`);
    console.log(`   Preguntas: ${finalStats[0].questions}`);
    console.log(`   Consentimientos: ${finalStats[0].consents}`);

    console.log('\n🎉 Base de datos reseteada a estado de fábrica!\n');
    console.log('📧 Credenciales Super Admin:');
    console.log('   Email: superadmin@sistema.com');
    console.log('   Password: superadmin123\n');
    console.log('💡 Ahora puedes crear tus propios tenants desde la interfaz web.\n');

  } catch (error) {
    console.error('❌ Error durante el reseteo:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

resetToFactory().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
