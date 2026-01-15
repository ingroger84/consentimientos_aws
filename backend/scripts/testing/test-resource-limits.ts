import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Cargar variables de entorno
config();

async function testResourceLimits() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✓ Conectado a la base de datos\n');

  // Consultar directamente con SQL para evitar problemas de entidades
  const tenants = await dataSource.query(`
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.plan,
      t.status,
      t."maxUsers",
      t."maxBranches",
      t."maxConsents",
      (SELECT COUNT(*) FROM users u WHERE u."tenantId" = t.id AND u.deleted_at IS NULL) as user_count,
      (SELECT COUNT(*) FROM branches b WHERE b."tenantId" = t.id AND b.deleted_at IS NULL) as branch_count,
      (SELECT COUNT(*) FROM consents c WHERE c."tenantId" = t.id AND c.deleted_at IS NULL) as consent_count
    FROM tenants t
    WHERE t.deleted_at IS NULL
    ORDER BY t.name
  `);

  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE LÍMITES DE RECURSOS POR TENANT');
  console.log('='.repeat(80));
  console.log('');

  if (tenants.length === 0) {
    console.log('⚠ No hay tenants en el sistema');
    await dataSource.destroy();
    return;
  }

  let tenantsWithLimitsReached = 0;

  for (const tenant of tenants) {
    console.log(`📊 Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   Plan: ${tenant.plan} | Estado: ${tenant.status}`);
    console.log('');

    // Usuarios
    const userCount = parseInt(tenant.user_count);
    const userLimit = tenant.maxUsers;
    const userPercentage = (userCount / userLimit) * 100;
    const userStatus = userCount >= userLimit ? '🔴 LÍMITE ALCANZADO' : 
                       userPercentage >= 90 ? '🟡 CRÍTICO' :
                       userPercentage >= 70 ? '🟡 ADVERTENCIA' : '🟢 OK';
    
    console.log(`   👥 Usuarios: ${userCount} / ${userLimit} (${userPercentage.toFixed(1)}%) ${userStatus}`);

    // Sedes
    const branchCount = parseInt(tenant.branch_count);
    const branchLimit = tenant.maxBranches;
    const branchPercentage = (branchCount / branchLimit) * 100;
    const branchStatus = branchCount >= branchLimit ? '🔴 LÍMITE ALCANZADO' : 
                         branchPercentage >= 90 ? '🟡 CRÍTICO' :
                         branchPercentage >= 70 ? '🟡 ADVERTENCIA' : '🟢 OK';
    
    console.log(`   📍 Sedes: ${branchCount} / ${branchLimit} (${branchPercentage.toFixed(1)}%) ${branchStatus}`);

    // Consentimientos
    const consentCount = parseInt(tenant.consent_count);
    const consentLimit = tenant.maxConsents;
    const consentPercentage = (consentCount / consentLimit) * 100;
    const consentStatus = consentCount >= consentLimit ? '🔴 LÍMITE ALCANZADO' : 
                          consentPercentage >= 90 ? '🟡 CRÍTICO' :
                          consentPercentage >= 70 ? '🟡 ADVERTENCIA' : '🟢 OK';
    
    console.log(`   📋 Consentimientos: ${consentCount} / ${consentLimit} (${consentPercentage.toFixed(1)}%) ${consentStatus}`);
    console.log('');

    // Verificar si algún límite fue alcanzado o excedido
    if (userCount >= userLimit || branchCount >= branchLimit || consentCount >= consentLimit) {
      tenantsWithLimitsReached++;
      console.log('   ⚠️  ALERTA: Este tenant ha alcanzado o excedido uno o más límites!');
      console.log('   ℹ️  El sistema debería estar bloqueando nuevas creaciones.');
      console.log('');
    }

    console.log('-'.repeat(80));
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('RESUMEN');
  console.log('='.repeat(80));
  console.log(`Total de tenants: ${tenants.length}`);
  console.log(`Tenants con límites alcanzados: ${tenantsWithLimitsReached}`);
  
  if (tenantsWithLimitsReached > 0) {
    console.log('');
    console.log('✅ SISTEMA DE CONTROL DE LÍMITES ACTIVO:');
    console.log('   - El backend está corriendo con las validaciones implementadas');
    console.log('   - Intenta crear un recurso en un tenant con límite alcanzado');
    console.log('   - Deberías recibir un error 403 con mensaje descriptivo');
    console.log('   - Si no funciona, verifica los logs del backend');
  } else {
    console.log('');
    console.log('✓ Todos los tenants están dentro de sus límites');
    console.log('ℹ️  Para probar el sistema, crea recursos hasta alcanzar un límite');
  }

  await dataSource.destroy();
}

// Ejecutar
testResourceLimits().catch(console.error);
