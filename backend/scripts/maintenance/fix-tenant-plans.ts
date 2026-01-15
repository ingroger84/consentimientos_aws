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

async function fixTenantPlans() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener tenants sin plan
    const tenantsWithoutPlan = await AppDataSource.query(`
      SELECT id, name, slug
      FROM tenants
      WHERE deleted_at IS NULL
      AND (plan IS NULL OR plan = '')
    `);

    if (tenantsWithoutPlan.length === 0) {
      console.log('✅ Todos los tenants ya tienen plan asignado');
      return;
    }

    console.log(`📊 Tenants sin plan: ${tenantsWithoutPlan.length}\n`);

    // Asignar plan Free por defecto a todos los tenants sin plan
    for (const tenant of tenantsWithoutPlan) {
      console.log(`Asignando plan Free a: ${tenant.name} (${tenant.slug})`);
      
      await AppDataSource.query(`
        UPDATE tenants
        SET 
          plan = 'free',
          billing_cycle = 'monthly',
          max_users = 2,
          max_branches = 1,
          max_consents = 50,
          max_services = 3,
          max_questions = 5,
          storage_limit_mb = 100,
          watermark = true,
          customization = false,
          advanced_reports = false,
          api_access = false,
          priority_support = false
        WHERE id = $1
      `, [tenant.id]);
      
      console.log(`   ✅ Plan Free asignado correctamente`);
    }

    console.log(`\n✅ Se asignó plan Free a ${tenantsWithoutPlan.length} tenant(s)`);
    console.log('\n💡 Ahora los usuarios pueden acceder a "Mi Plan" en sus tenants');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixTenantPlans();
