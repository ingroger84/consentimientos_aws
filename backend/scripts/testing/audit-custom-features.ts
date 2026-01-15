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

// Features base de cada plan
const PLAN_FEATURES: Record<string, any> = {
  free: {
    watermark: true,
    customization: false,
    advancedReports: false,
    apiAccess: false,
    prioritySupport: false,
  },
  basic: {
    watermark: false,
    customization: true,
    advancedReports: false,
    apiAccess: false,
    prioritySupport: false,
  },
  professional: {
    watermark: false,
    customization: true,
    advancedReports: true,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    watermark: false,
    customization: true,
    advancedReports: true,
    apiAccess: true,
    prioritySupport: true,
  },
  custom: {
    watermark: false,
    customization: true,
    advancedReports: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

const FEATURE_NAMES: Record<string, string> = {
  watermark: 'Marca de agua',
  customization: 'Personalización',
  advancedReports: 'Reportes avanzados',
  apiAccess: 'Acceso API',
  prioritySupport: 'Soporte prioritario',
};

async function auditCustomFeatures() {
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
        features
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    console.log(`📊 Total de tenants: ${tenants.length}\n`);

    let tenantsWithCustomFeatures = 0;
    const customizations: any[] = [];

    console.log('═══════════════════════════════════════════════════════════════\n');

    tenants.forEach((tenant: any) => {
      const planFeatures = PLAN_FEATURES[tenant.plan];
      
      if (!planFeatures) {
        console.log(`⚠️  ${tenant.name} (${tenant.slug}): Plan desconocido "${tenant.plan}"\n`);
        return;
      }

      const tenantFeatures = tenant.features || {};
      const differences: string[] = [];

      // Comparar cada feature
      Object.keys(planFeatures).forEach(featureKey => {
        const planValue = planFeatures[featureKey];
        const tenantValue = tenantFeatures[featureKey] ?? planValue;
        
        if (tenantValue !== planValue) {
          const featureName = FEATURE_NAMES[featureKey] || featureKey;
          const status = tenantValue ? '✅ Habilitada' : '❌ Deshabilitada';
          const planStatus = planValue ? '✅' : '❌';
          differences.push(`${featureName}: ${status} (Plan: ${planStatus})`);
        }
      });

      if (differences.length > 0) {
        tenantsWithCustomFeatures++;
        console.log(`🔧 ${tenant.name} (${tenant.slug})`);
        console.log(`   Plan: ${tenant.plan.toUpperCase()}`);
        console.log(`   Características personalizadas:`);
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
    console.log(`Tenants con características estándar: ${tenants.length - tenantsWithCustomFeatures}`);
    console.log(`Tenants con características personalizadas: ${tenantsWithCustomFeatures}`);
    console.log(`Porcentaje de personalización: ${((tenantsWithCustomFeatures / tenants.length) * 100).toFixed(1)}%\n`);

    if (tenantsWithCustomFeatures === 0) {
      console.log('✅ Todos los tenants usan características estándar de sus planes');
    } else {
      console.log('💡 Considera revisar si las personalizaciones siguen siendo necesarias');
    }

    // Estadísticas por tipo de personalización
    if (customizations.length > 0) {
      console.log('\n📊 ESTADÍSTICAS DE PERSONALIZACIONES:\n');
      
      const stats: Record<string, number> = {
        watermark: 0,
        customization: 0,
        advancedReports: 0,
        apiAccess: 0,
        prioritySupport: 0,
      };

      customizations.forEach(c => {
        c.differences.forEach((diff: string) => {
          Object.keys(FEATURE_NAMES).forEach(key => {
            if (diff.includes(FEATURE_NAMES[key])) {
              stats[key]++;
            }
          });
        });
      });

      Object.keys(stats).forEach(key => {
        if (stats[key] > 0) {
          console.log(`${FEATURE_NAMES[key]} personalizada: ${stats[key]} tenant(s)`);
        }
      });
    }

    // Análisis de features habilitadas vs deshabilitadas
    if (customizations.length > 0) {
      console.log('\n📊 ANÁLISIS DE CAMBIOS:\n');
      
      let enabled = 0;
      let disabled = 0;

      customizations.forEach(c => {
        c.differences.forEach((diff: string) => {
          if (diff.includes('✅ Habilitada')) {
            enabled++;
          } else if (diff.includes('❌ Deshabilitada')) {
            disabled++;
          }
        });
      });

      console.log(`Features habilitadas (upgrade): ${enabled}`);
      console.log(`Features deshabilitadas (downgrade): ${disabled}`);
      console.log(`\nTendencia: ${enabled > disabled ? '📈 Más upgrades' : disabled > enabled ? '📉 Más downgrades' : '⚖️ Equilibrado'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

auditCustomFeatures();
