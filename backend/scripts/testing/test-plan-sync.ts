import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PlansService } from './src/plans/plans.service';
import { TenantsService } from './src/tenants/tenants.service';

async function testPlanSync() {
  console.log('🔍 Iniciando prueba de sincronización de planes...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const plansService = app.get(PlansService);
  const tenantsService = app.get(TenantsService);

  try {
    // 1. Obtener el plan básico actual
    console.log('📋 1. Obteniendo configuración actual del Plan Básico...');
    const basicPlan = plansService.findOne('basic');
    console.log('   Plan Básico actual:');
    console.log('   - Usuarios:', basicPlan.limits.users);
    console.log('   - Sedes:', basicPlan.limits.branches);
    console.log('   - Consentimientos:', basicPlan.limits.consents);
    console.log('   - Servicios:', basicPlan.limits.services);
    console.log('   - Preguntas:', basicPlan.limits.questions);
    console.log('   - Storage:', basicPlan.limits.storageMb, 'MB\n');

    // 2. Buscar tenants con plan básico
    console.log('🔍 2. Buscando tenants con Plan Básico...');
    const tenantsWithBasic = await tenantsService.findByPlan('basic');
    console.log(`   Encontrados ${tenantsWithBasic.length} tenants con Plan Básico:\n`);
    
    if (tenantsWithBasic.length === 0) {
      console.log('   ⚠️  No hay tenants con Plan Básico para probar la sincronización.');
      console.log('   💡 Crea un tenant con Plan Básico desde el Super Admin Dashboard.\n');
      await app.close();
      return;
    }

    // Mostrar límites actuales de cada tenant
    for (const tenant of tenantsWithBasic) {
      console.log(`   📊 ${tenant.name}:`);
      console.log(`      - Usuarios: ${tenant.maxUsers}`);
      console.log(`      - Sedes: ${tenant.maxBranches}`);
      console.log(`      - Consentimientos: ${tenant.maxConsents}`);
      console.log(`      - Servicios: ${tenant.maxServices}`);
      console.log(`      - Preguntas: ${tenant.maxQuestions}`);
      console.log(`      - Storage: ${tenant.storageLimitMb} MB\n`);
    }

    // 3. Simular actualización del plan
    console.log('✏️  3. Simulando actualización del Plan Básico...');
    console.log('   Nuevos límites:');
    console.log('   - Usuarios: 10 (antes: 5)');
    console.log('   - Sedes: 3 (antes: 2)');
    console.log('   - Consentimientos: 300 (antes: 200)\n');

    const updatedPlan = await plansService.update('basic', {
      limits: {
        users: 10,
        branches: 3,
        consents: 300,
        services: basicPlan.limits.services,
        questions: basicPlan.limits.questions,
        storageMb: basicPlan.limits.storageMb,
      },
    });

    console.log('✅ Plan actualizado exitosamente!\n');

    // 4. Verificar que los tenants se actualizaron
    console.log('🔄 4. Verificando sincronización de tenants...');
    const updatedTenants = await tenantsService.findByPlan('basic');
    
    let allSynced = true;
    for (const tenant of updatedTenants) {
      const synced = 
        tenant.maxUsers === 10 &&
        tenant.maxBranches === 3 &&
        tenant.maxConsents === 300;

      console.log(`   ${synced ? '✅' : '❌'} ${tenant.name}:`);
      console.log(`      - Usuarios: ${tenant.maxUsers} ${tenant.maxUsers === 10 ? '✓' : '✗'}`);
      console.log(`      - Sedes: ${tenant.maxBranches} ${tenant.maxBranches === 3 ? '✓' : '✗'}`);
      console.log(`      - Consentimientos: ${tenant.maxConsents} ${tenant.maxConsents === 300 ? '✓' : '✗'}\n`);

      if (!synced) allSynced = false;
    }

    // 5. Resultado final
    console.log('\n' + '='.repeat(60));
    if (allSynced) {
      console.log('🎉 ¡PRUEBA EXITOSA! Todos los tenants se sincronizaron correctamente.');
    } else {
      console.log('❌ PRUEBA FALLIDA: Algunos tenants no se sincronizaron.');
    }
    console.log('='.repeat(60) + '\n');

    // 6. Restaurar valores originales
    console.log('🔄 Restaurando valores originales del Plan Básico...');
    await plansService.update('basic', {
      limits: {
        users: 5,
        branches: 2,
        consents: 200,
        services: basicPlan.limits.services,
        questions: basicPlan.limits.questions,
        storageMb: basicPlan.limits.storageMb,
      },
    });
    console.log('✅ Valores restaurados.\n');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack:', error.stack);
  } finally {
    await app.close();
  }
}

testPlanSync();
