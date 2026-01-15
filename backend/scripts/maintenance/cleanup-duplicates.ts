import { DataSource } from 'typeorm';
import { Branch } from './src/branches/entities/branch.entity';
import { Service } from './src/services/entities/service.entity';
import { Question } from './src/questions/entities/question.entity';

async function cleanup() {
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
  console.log('🔧 Iniciando limpieza de duplicados...\n');

  try {
    // Obtener repositorios
    const branchRepo = dataSource.getRepository(Branch);
    const serviceRepo = dataSource.getRepository(Service);
    const questionRepo = dataSource.getRepository(Question);

    // 1. Limpiar sedes duplicadas
    console.log('📍 Limpiando sedes duplicadas...');
    const branches = await branchRepo.find({ relations: ['tenant'] });
    const branchMap = new Map<string, Branch>();
    const branchesToDelete: string[] = [];

    branches.forEach(branch => {
      const key = `${branch.name}-${branch.tenant?.id || 'null'}`;
      if (branchMap.has(key)) {
        branchesToDelete.push(branch.id);
      } else {
        branchMap.set(key, branch);
      }
    });

    if (branchesToDelete.length > 0) {
      await branchRepo.delete(branchesToDelete);
      console.log(`✅ Eliminadas ${branchesToDelete.length} sedes duplicadas`);
    } else {
      console.log('✅ No hay sedes duplicadas');
    }

    // 2. Limpiar servicios duplicados
    console.log('\n💼 Limpiando servicios duplicados...');
    const services = await serviceRepo.find({ relations: ['tenant'] });
    const serviceMap = new Map<string, Service>();
    const servicesToDelete: string[] = [];

    services.forEach(service => {
      const key = `${service.name}-${service.tenant?.id || 'null'}`;
      if (serviceMap.has(key)) {
        servicesToDelete.push(service.id);
      } else {
        serviceMap.set(key, service);
      }
    });

    if (servicesToDelete.length > 0) {
      await serviceRepo.delete(servicesToDelete);
      console.log(`✅ Eliminados ${servicesToDelete.length} servicios duplicados`);
    } else {
      console.log('✅ No hay servicios duplicados');
    }

    // 3. Limpiar preguntas duplicadas
    console.log('\n❓ Limpiando preguntas duplicadas...');
    const questions = await questionRepo.find({ relations: ['service'] });
    const questionMap = new Map<string, Question>();
    const questionsToDelete: string[] = [];

    questions.forEach(question => {
      const key = `${question.questionText}-${question.service?.id || 'null'}`;
      if (questionMap.has(key)) {
        questionsToDelete.push(question.id);
      } else {
        questionMap.set(key, question);
      }
    });

    if (questionsToDelete.length > 0) {
      await questionRepo.delete(questionsToDelete);
      console.log(`✅ Eliminadas ${questionsToDelete.length} preguntas duplicadas`);
    } else {
      console.log('✅ No hay preguntas duplicadas');
    }

    // Mostrar resumen
    console.log('\n📊 Resumen final:');
    const finalBranches = await branchRepo.count();
    const finalServices = await serviceRepo.count();
    const finalQuestions = await questionRepo.count();

    console.log(`   Sedes: ${finalBranches}`);
    console.log(`   Servicios: ${finalServices}`);
    console.log(`   Preguntas: ${finalQuestions}`);

    console.log('\n🎉 Limpieza completada exitosamente!\n');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

cleanup().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
