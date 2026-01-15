import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleType } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Service } from '../services/entities/service.entity';
import { Question, QuestionType } from '../questions/entities/question.entity';
import { Tenant, TenantStatus, TenantPlan } from '../tenants/entities/tenant.entity';
import { ROLE_PERMISSIONS } from '../auth/constants/permissions';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();

  console.log('🌱 Iniciando seed...');

  // Create Roles
  const roleRepo = dataSource.getRepository(Role);
  
  // Verificar si ya existen roles
  const existingRoles = await roleRepo.count();
  let superAdminRole, adminGeneralRole, adminSedeRole, operadorRole;
  
  if (existingRoles === 0) {
    console.log('Creando roles...');
    
    // Rol Super Admin (no pertenece a ningún tenant)
    superAdminRole = roleRepo.create({
      name: 'Super Administrador',
      type: 'super_admin' as RoleType,
      description: 'Acceso total al sistema multi-tenant',
      permissions: [...ROLE_PERMISSIONS.SUPER_ADMIN],
    });

    adminGeneralRole = roleRepo.create({
      name: 'Administrador General',
      type: RoleType.ADMIN_GENERAL,
      description: 'Acceso completo al sistema del tenant',
      permissions: [...ROLE_PERMISSIONS.ADMIN_GENERAL],
    });

    adminSedeRole = roleRepo.create({
      name: 'Administrador de Sede',
      type: RoleType.ADMIN_SEDE,
      description: 'Gestión de su sede',
      permissions: [...ROLE_PERMISSIONS.ADMIN_SEDE],
    });

    operadorRole = roleRepo.create({
      name: 'Operador',
      type: RoleType.OPERADOR,
      description: 'Crear consentimientos',
      permissions: [...ROLE_PERMISSIONS.OPERADOR],
    });

    await roleRepo.save([superAdminRole, adminGeneralRole, adminSedeRole, operadorRole]);
    console.log('✅ Roles creados');
  } else {
    console.log('Roles ya existen, obteniendo...');
    superAdminRole = await roleRepo.findOne({ where: { type: RoleType.SUPER_ADMIN } });
    adminGeneralRole = await roleRepo.findOne({ where: { type: RoleType.ADMIN_GENERAL } });
    adminSedeRole = await roleRepo.findOne({ where: { type: RoleType.ADMIN_SEDE } });
    operadorRole = await roleRepo.findOne({ where: { type: RoleType.OPERADOR } });
    
    // Si no existe el rol super_admin, crearlo
    if (!superAdminRole) {
      console.log('Creando rol Super Admin...');
      superAdminRole = roleRepo.create({
        name: 'Super Administrador',
        type: 'super_admin' as RoleType,
        description: 'Acceso total al sistema multi-tenant',
        permissions: [...ROLE_PERMISSIONS.SUPER_ADMIN],
      });
      await roleRepo.save(superAdminRole);
      console.log('✅ Rol Super Admin creado');
    }
    
    console.log('Roles cargados:', {
      superAdmin: !!superAdminRole,
      adminGeneral: !!adminGeneralRole,
      adminSede: !!adminSedeRole,
      operador: !!operadorRole,
    });
  }

  // Create Tenant de ejemplo
  const tenantRepo = dataSource.getRepository(Tenant);
  
  let demoTenant = await tenantRepo.findOne({ where: { slug: 'clinica-demo' } });
  
  if (!demoTenant) {
    console.log('Creando tenant demo...');
    demoTenant = tenantRepo.create({
      name: 'Clínica Demo',
      slug: 'clinica-demo',
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.PROFESSIONAL,
      contactName: 'Admin Demo',
      contactEmail: 'admin@clinicademo.com',
      contactPhone: '+57 300 123 4567',
      maxUsers: 50,
      maxConsents: 5000,
      maxBranches: 20,
    });

    await tenantRepo.save(demoTenant);
    console.log('✅ Tenant creado');
  } else {
    console.log('Tenant demo ya existe');
  }

  // Create Branches (asociadas al tenant)
  const branchRepo = dataSource.getRepository(Branch);
  
  let branch1 = await branchRepo.findOne({ where: { name: 'Sede Principal', tenant: { id: demoTenant.id } } });
  let branch2 = await branchRepo.findOne({ where: { name: 'Sede Norte', tenant: { id: demoTenant.id } } });
  
  if (!branch1 || !branch2) {
    console.log('Creando sedes...');
    
    if (!branch1) {
      branch1 = branchRepo.create({
        name: 'Sede Principal',
        address: 'Calle 123 #45-67, Bogotá',
        phone: '+57 1 234 5678',
        email: 'principal@consentimientos.com',
        tenant: demoTenant,
      });
    }

    if (!branch2) {
      branch2 = branchRepo.create({
        name: 'Sede Norte',
        address: 'Carrera 45 #123-45, Bogotá',
        phone: '+57 1 345 6789',
        email: 'norte@consentimientos.com',
        tenant: demoTenant,
      });
    }

    await branchRepo.save([branch1, branch2]);
    console.log('✅ Sedes creadas');
  } else {
    console.log('Sedes ya existen');
  }

  // Create Users
  const userRepo = dataSource.getRepository(User);
  
  if (!superAdminRole || !adminGeneralRole || !operadorRole) {
    throw new Error('Los roles no se pudieron cargar correctamente');
  }
  
  // Super Admin (sin tenant)
  let superAdminUser = await userRepo.findOne({ where: { email: 'superadmin@sistema.com' } });
  
  if (!superAdminUser) {
    console.log('Creando super admin...');
    superAdminUser = userRepo.create({
      name: 'Super Admin',
      email: 'superadmin@sistema.com',
      password: await bcrypt.hash('superadmin123', 10),
      role: superAdminRole,
      branches: [],
    });
    await userRepo.save(superAdminUser);
    console.log('✅ Super Admin creado');
  } else {
    console.log('Super Admin ya existe');
  }

  // Admin del tenant
  let adminUser = await userRepo.findOne({ where: { email: 'admin@consentimientos.com' } });
  
  if (!adminUser) {
    console.log('Creando admin del tenant...');
    adminUser = userRepo.create({
      name: 'Admin Sistema',
      email: 'admin@consentimientos.com',
      password: await bcrypt.hash('admin123', 10),
      role: adminGeneralRole,
      tenant: demoTenant,
      branches: [branch1, branch2],
    });
    await userRepo.save(adminUser);
    console.log('✅ Admin del tenant creado');
  } else {
    console.log('Admin del tenant ya existe');
  }

  let operadorUser = await userRepo.findOne({ where: { email: 'operador@consentimientos.com' } });
  
  if (!operadorUser) {
    console.log('Creando operador...');
    operadorUser = userRepo.create({
      name: 'Operador Sede',
      email: 'operador@consentimientos.com',
      password: await bcrypt.hash('operador123', 10),
      role: operadorRole,
      tenant: demoTenant,
      branches: [branch1],
    });
    await userRepo.save(operadorUser);
    console.log('✅ Operador creado');
  } else {
    console.log('Operador ya existe');
  }

  // Create Services (asociados al tenant)
  const serviceRepo = dataSource.getRepository(Service);
  
  let service1 = await serviceRepo.findOne({ where: { name: 'Procedimiento Estético', tenant: { id: demoTenant.id } } });
  let service2 = await serviceRepo.findOne({ where: { name: 'Tratamiento Médico', tenant: { id: demoTenant.id } } });
  
  if (!service1 || !service2) {
    console.log('Creando servicios...');
    
    if (!service1) {
      service1 = serviceRepo.create({
        name: 'Procedimiento Estético',
        description: 'Consentimiento para procedimientos estéticos',
        tenant: demoTenant,
      });
    }

    if (!service2) {
      service2 = serviceRepo.create({
        name: 'Tratamiento Médico',
        description: 'Consentimiento para tratamientos médicos',
        tenant: demoTenant,
      });
    }

    await serviceRepo.save([service1, service2]);
    console.log('✅ Servicios creados');
  } else {
    console.log('Servicios ya existen');
  }

  // Create Questions
  const questionRepo = dataSource.getRepository(Question);
  
  const existingQuestions = await questionRepo.count();
  
  if (existingQuestions === 0) {
    console.log('Creando preguntas...');
    
    const questions = [
      questionRepo.create({
        questionText: '¿Tiene alergias a medicamentos?',
        type: QuestionType.YES_NO,
        isRequired: true,
        isCritical: true,
        order: 1,
        service: service1,
      }),
      questionRepo.create({
        questionText: 'Si respondió sí, especifique cuáles:',
        type: QuestionType.TEXT,
        isRequired: false,
        isCritical: false,
        order: 2,
        service: service1,
      }),
      questionRepo.create({
        questionText: '¿Está embarazada o en período de lactancia?',
        type: QuestionType.YES_NO,
        isRequired: true,
        isCritical: true,
        order: 3,
        service: service1,
      }),
      questionRepo.create({
        questionText: '¿Tiene alguna condición médica preexistente?',
        type: QuestionType.YES_NO,
        isRequired: true,
        isCritical: true,
        order: 1,
        service: service2,
      }),
    ];

    await questionRepo.save(questions);
    console.log('✅ Preguntas creadas');
  } else {
    console.log('Preguntas ya existen');
  }

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📧 Credenciales de prueba:');
  console.log('   Super Admin: superadmin@sistema.com / superadmin123');
  console.log('   Admin: admin@consentimientos.com / admin123');
  console.log('   Operador: operador@consentimientos.com / operador123\n');
  console.log('🏢 Tenant Demo: Clínica Demo (clinica-demo)\n');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
