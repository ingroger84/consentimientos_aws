import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'consentimientos',
  synchronize: false,
});

async function checkTenantPlan() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener todos los tenants
    const tenants = await AppDataSource.query(`
      SELECT 
        id,
        name,
        slug,
        plan,
        billing_cycle,
        max_users,
        max_branches,
        max_consents,
        max_services,
        max_questions,
        storage_limit_mb,
        status
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total de tenants activos: ${tenants.length}\n`);

    if (tenants.length === 0) {
      console.log('⚠️  No hay tenants en la base de datos');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════════');
    tenants.forEach((tenant: any, index: number) => {
      console.log(`\n${index + 1}. ${tenant.name} (${tenant.slug})`);
      console.log('   ─────────────────────────────────────────────────────────');
      console.log(`   ID:              ${tenant.id}`);
      console.log(`   Plan:            ${tenant.plan || '❌ NO ASIGNADO'}`);
      console.log(`   Ciclo:           ${tenant.billing_cycle || 'N/A'}`);
      console.log(`   Estado:          ${tenant.status}`);
      console.log(`   Límites:`);
      console.log(`     - Usuarios:    ${tenant.max_users || 'N/A'}`);
      console.log(`     - Sedes:       ${tenant.max_branches || 'N/A'}`);
      console.log(`     - Consents:    ${tenant.max_consents || 'N/A'}`);
      console.log(`     - Servicios:   ${tenant.max_services || 'N/A'}`);
      console.log(`     - Preguntas:   ${tenant.max_questions || 'N/A'}`);
      console.log(`     - Storage:     ${tenant.storage_limit_mb || 'N/A'} MB`);
      
      if (!tenant.plan) {
        console.log(`   ⚠️  PROBLEMA: Este tenant NO tiene plan asignado`);
      }
    });
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    // Verificar si hay tenants sin plan
    const tenantsWithoutPlan = tenants.filter((t: any) => !t.plan);
    if (tenantsWithoutPlan.length > 0) {
      console.log(`\n⚠️  ATENCIÓN: ${tenantsWithoutPlan.length} tenant(s) sin plan asignado:`);
      tenantsWithoutPlan.forEach((t: any) => {
        console.log(`   - ${t.name} (${t.slug})`);
      });
      console.log('\n💡 Solución: Ejecuta el script fix-tenant-plans.ts para asignar planes');
    } else {
      console.log('✅ Todos los tenants tienen plan asignado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkTenantPlan();
