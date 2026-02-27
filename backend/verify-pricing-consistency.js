const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

// Precios según documentación original (ESTRATEGIA_PRECIOS_MULTI_MERCADO.md - 7 feb 2026)
const PRECIOS_ORIGINALES = {
  CO: {
    free: { monthly: 0, annual: 0 },
    basic: { monthly: 89900, annual: 895404 },
    professional: { monthly: 119900, annual: 1194202 },
    enterprise: { monthly: 149900, annual: 1493004 },
    custom: { monthly: 189900, annual: 1891404 }
  },
  US: {
    free: { monthly: 0, annual: 0 },
    basic: { monthly: 79, annual: 790 },
    professional: { monthly: 119, annual: 1190 },
    enterprise: { monthly: 169, annual: 1690 },
    custom: { monthly: 249, annual: 2490 }
  }
};

async function verifyPricing() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  VERIFICACIÓN DE PRECIOS: ORIGINAL vs ACTUAL              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Obtener precios actuales de Supabase
    const result = await client.query(`
      SELECT plan_id, region, price_monthly, price_annual
      FROM plan_pricing
      ORDER BY region, plan_id
    `);
    
    const preciosActuales = {};
    result.rows.forEach(row => {
      if (!preciosActuales[row.region]) {
        preciosActuales[row.region] = {};
      }
      preciosActuales[row.region][row.plan_id] = {
        monthly: parseFloat(row.price_monthly),
        annual: parseFloat(row.price_annual)
      };
    });
    
    // Comparar precios
    let hayDiferencias = false;
    
    for (const region of ['CO', 'US']) {
      console.log(`\n📊 REGIÓN: ${region === 'CO' ? 'Colombia (COP)' : 'United States (USD)'}`);
      console.log('='.repeat(70));
      console.log(`${'Plan'.padEnd(15)} ${'Original Mensual'.padEnd(20)} ${'Actual Mensual'.padEnd(20)} Estado`);
      console.log('-'.repeat(70));
      
      const planesOriginales = PRECIOS_ORIGINALES[region];
      const planesActuales = preciosActuales[region] || {};
      
      // Verificar cada plan
      for (const planId in planesOriginales) {
        const original = planesOriginales[planId];
        const actual = planesActuales[planId];
        
        if (!actual) {
          console.log(`${planId.padEnd(15)} ${String(original.monthly).padEnd(20)} ${'FALTA'.padEnd(20)} ❌ NO EXISTE`);
          hayDiferencias = true;
        } else {
          const monthlyMatch = original.monthly === actual.monthly;
          const annualMatch = original.annual === actual.annual;
          
          if (monthlyMatch && annualMatch) {
            console.log(`${planId.padEnd(15)} ${String(original.monthly).padEnd(20)} ${String(actual.monthly).padEnd(20)} ✅ CORRECTO`);
          } else {
            console.log(`${planId.padEnd(15)} ${String(original.monthly).padEnd(20)} ${String(actual.monthly).padEnd(20)} ❌ DIFERENTE`);
            if (!monthlyMatch) {
              console.log(`  → Mensual: ${original.monthly} (original) vs ${actual.monthly} (actual)`);
            }
            if (!annualMatch) {
              console.log(`  → Anual: ${original.annual} (original) vs ${actual.annual} (actual)`);
            }
            hayDiferencias = true;
          }
        }
      }
      
      // Verificar si hay planes extras que no deberían estar
      for (const planId in planesActuales) {
        if (!planesOriginales[planId]) {
          console.log(`${planId.padEnd(15)} ${'N/A'.padEnd(20)} ${String(planesActuales[planId].monthly).padEnd(20)} ⚠️  EXTRA (no en original)`);
          hayDiferencias = true;
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (hayDiferencias) {
      console.log('\n❌ HAY DIFERENCIAS entre los precios originales y actuales');
      console.log('\n📋 PRECIOS ORIGINALES (según documentación 7 feb 2026):');
      console.log('\nColombia (COP):');
      console.log('  - Básico:       $89,900/mes  ($895,404/año)');
      console.log('  - Profesional:  $119,900/mes ($1,194,202/año)');
      console.log('  - Empresarial:  $149,900/mes ($1,493,004/año)');
      console.log('  - Custom:       $189,900/mes ($1,891,404/año)');
      console.log('\nUSA (USD):');
      console.log('  - Básico:       $79/mes  ($790/año)');
      console.log('  - Profesional:  $119/mes ($1,190/año)');
      console.log('  - Empresarial:  $169/mes ($1,690/año)');
      console.log('  - Custom:       $249/mes ($2,490/año)');
    } else {
      console.log('\n✅ TODOS LOS PRECIOS COINCIDEN con la documentación original');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyPricing();
