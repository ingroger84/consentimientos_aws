const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

async function checkTenantStates() {
  console.log('='.repeat(60));
  console.log('VERIFICACIÓN DE ESTADOS DE TENANTS');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Obtener todos los tenants con sus estados
    const result = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        status,
        plan,
        trial_ends_at,
        subscription_ends_at,
        created_at
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    console.log(`Total de tenants activos: ${result.rows.length}`);
    console.log('');

    // Agrupar por estado
    const byStatus = result.rows.reduce((acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1;
      return acc;
    }, {});

    console.log('DISTRIBUCIÓN POR ESTADO:');
    console.log('-'.repeat(60));
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status.toUpperCase().padEnd(15)} : ${count} tenant(s)`);
    });
    console.log('');

    // Mostrar detalles de cada tenant
    console.log('DETALLES DE TENANTS:');
    console.log('-'.repeat(60));
    
    result.rows.forEach((tenant, index) => {
      console.log(`\n${index + 1}. ${tenant.name} (${tenant.slug})`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Estado: ${tenant.status.toUpperCase()}`);
      console.log(`   Plan: ${tenant.plan}`);
      
      if (tenant.trial_ends_at) {
        const trialDate = new Date(tenant.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((trialDate - now) / (1000 * 60 * 60 * 24));
        console.log(`   Trial termina: ${trialDate.toLocaleDateString('es-ES')} (${daysRemaining} días)`);
      }
      
      if (tenant.subscription_ends_at) {
        const subDate = new Date(tenant.subscription_ends_at);
        console.log(`   Suscripción termina: ${subDate.toLocaleDateString('es-ES')}`);
      }
      
      console.log(`   Creado: ${new Date(tenant.created_at).toLocaleDateString('es-ES')}`);
    });

    console.log('');
    console.log('='.repeat(60));
    console.log('VERIFICACIÓN DE CONSISTENCIA');
    console.log('='.repeat(60));
    console.log('');

    // Verificar tenants con estado incorrecto
    const now = new Date();
    const inconsistencies = [];

    result.rows.forEach(tenant => {
      const trialDate = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
      const subDate = tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at) : null;

      // Verificar si el estado es consistente con las fechas
      if (tenant.status === 'trial' && trialDate && trialDate < now) {
        inconsistencies.push({
          tenant: tenant.name,
          issue: 'Estado TRIAL pero trial expirado',
          suggestion: 'Debería ser EXPIRED o SUSPENDED',
        });
      }

      if (tenant.status === 'active' && subDate && subDate < now) {
        inconsistencies.push({
          tenant: tenant.name,
          issue: 'Estado ACTIVE pero suscripción expirada',
          suggestion: 'Debería ser EXPIRED o SUSPENDED',
        });
      }

      if (tenant.status === 'trial' && !trialDate) {
        inconsistencies.push({
          tenant: tenant.name,
          issue: 'Estado TRIAL pero sin fecha de fin de trial',
          suggestion: 'Establecer trial_ends_at',
        });
      }

      if (tenant.plan === 'free' && tenant.status === 'suspended') {
        inconsistencies.push({
          tenant: tenant.name,
          issue: 'Plan FREE pero estado SUSPENDED',
          suggestion: 'Los planes FREE no deberían suspenderse',
        });
      }
    });

    if (inconsistencies.length > 0) {
      console.log('⚠️  INCONSISTENCIAS DETECTADAS:');
      console.log('-'.repeat(60));
      inconsistencies.forEach((inc, index) => {
        console.log(`\n${index + 1}. ${inc.tenant}`);
        console.log(`   Problema: ${inc.issue}`);
        console.log(`   Sugerencia: ${inc.suggestion}`);
      });
    } else {
      console.log('✅ No se detectaron inconsistencias');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('ESTADOS POSIBLES EN EL SISTEMA:');
    console.log('='.repeat(60));
    console.log('');
    console.log('  1. ACTIVE     - Tenant activo con suscripción válida');
    console.log('  2. TRIAL      - Tenant en período de prueba');
    console.log('  3. SUSPENDED  - Tenant suspendido (pago pendiente, etc.)');
    console.log('  4. EXPIRED    - Tenant con trial o suscripción expirada');
    console.log('');

  } catch (error) {
    console.error('Error al verificar estados:', error);
  } finally {
    await pool.end();
  }
}

checkTenantStates();
