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

// Límites base de cada plan
const PLAN_LIMITS: Record<string, any> = {
  free: {
    users: 2,
    branches: 1,
    consents: 50,
    services: 3,
    questions: 5,
    storageMb: 100,
  },
  basic: {
    users: 5,
    branches: 2,
    consents: 200,
    services: 10,
    questions: 20,
    storageMb: 500,
  },
  professional: {
    users: 15,
    branches: 5,
    consents: 1000,
    services: 30,
    questions: 50,
    storageMb: 2048,
  },
  enterprise: {
    users: 50,
    branches: 20,
    consents: 5000,
    services: 100,
    questions: 200,
    storageMb: 10240,
  },
  custom: {
    users: 999999,
    branches: 999999,
    consents: 999999,
    services: 999999,
    questions: 999999,
    storageMb: 999999,
  },
};

async function auditCustomLimits() {
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
        max_users,
        max_branches,
        max_consents,
        max_services,
        max_questions,
        storage_limit_mb
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    console.log(`📊 Total de tenants: ${tenants.length}\n`);

    let tenantsWithCustomLimits = 0;
    const customizations: any[] = [];

    console.log('═══════════════════════════════════════════════════════════════\n');

    tenants.forEach((tenant: any) => {
      const planLimits = PLAN_LIMITS[tenant.plan];
      
      if (!planLimits) {
        console.log(`⚠️  ${tenant.name} (${tenant.slug}): Plan desconocido "${tenant.plan}"\n`);
        return;
      }

      const differences: string[] = [];

      // Comparar cada límite
      if (tenant.max_users !== planLimits.users) {
        differences.push(`Usuarios: ${tenant.max_users} (Plan: ${planLimits.users})`);
      }
      if (tenant.max_branches !== planLimits.branches) {
        differences.push(`Sedes: ${tenant.max_branches} (Plan: ${planLimits.branches})`);
      }
      if (tenant.max_consents !== planLimits.consents) {
        differences.push(`Consentimientos: ${tenant.max_consents} (Plan: ${planLimits.consents})`);
      }
      if (tenant.max_services !== planLimits.services) {
        differences.push(`Servicios: ${tenant.max_services} (Plan: ${planLimits.services})`);
      }
      if (tenant.max_questions !== planLimits.questions) {
        differences.push(`Preguntas: ${tenant.max_questions} (Plan: ${planLimits.questions})`);
      }
      if (tenant.storage_limit_mb !== planLimits.storageMb) {
        differences.push(`Storage: ${tenant.storage_limit_mb} MB (Plan: ${planLimits.storageMb} MB)`);
      }

      if (differences.length > 0) {
        tenantsWithCustomLimits++;
        console.log(`🔧 ${tenant.name} (${tenant.slug})`);
        console.log(`   Plan: ${tenant.plan.toUpperCase()}`);
        console.log(`   Límites personalizados:`);
        differences.forEach(diff => {
          console.log(`     - ${diff}`);
        });
        console.log('');

        customizations.push({
          tenant: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          differences,
        });
      }
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Resumen
    console.log('📈 RESUMEN:\n');
    console.log(`Total de tenants: ${tenants.length}`);
    console.log(`Tenants con límites estándar: ${tenants.length - tenantsWithCustomLimits}`);
    console.log(`Tenants con límites personalizados: ${tenantsWithCustomLimits}`);
    console.log(`Porcentaje de personalización: ${((tenantsWithCustomLimits / tenants.length) * 100).toFixed(1)}%\n`);

    if (tenantsWithCustomLimits === 0) {
      console.log('✅ Todos los tenants usan límites estándar de sus planes');
    } else {
      console.log('💡 Considera revisar si las personalizaciones siguen siendo necesarias');
    }

    // Estadísticas por tipo de personalización
    if (customizations.length > 0) {
      console.log('\n📊 ESTADÍSTICAS DE PERSONALIZACIONES:\n');
      
      const stats = {
        users: 0,
        branches: 0,
        consents: 0,
        services: 0,
        questions: 0,
        storage: 0,
      };

      customizations.forEach(c => {
        c.differences.forEach((diff: string) => {
          if (diff.includes('Usuarios')) stats.users++;
          if (diff.includes('Sedes')) stats.branches++;
          if (diff.includes('Consentimientos')) stats.consents++;
          if (diff.includes('Servicios')) stats.services++;
          if (diff.includes('Preguntas')) stats.questions++;
          if (diff.includes('Storage')) stats.storage++;
        });
      });

      console.log(`Usuarios personalizados: ${stats.users}`);
      console.log(`Sedes personalizadas: ${stats.branches}`);
      console.log(`Consentimientos personalizados: ${stats.consents}`);
      console.log(`Servicios personalizados: ${stats.services}`);
      console.log(`Preguntas personalizadas: ${stats.questions}`);
      console.log(`Storage personalizado: ${stats.storage}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

auditCustomLimits();
