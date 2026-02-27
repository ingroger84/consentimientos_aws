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

// Precios CORRECTOS según documentación original (ESTRATEGIA_PRECIOS_MULTI_MERCADO.md - 7 feb 2026)
const PRECIOS_CORRECTOS = [
  // Colombia (COP)
  { plan_id: 'free', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 0, price_annual: 0, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'basic', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 89900, price_annual: 895404, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'professional', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 119900, price_annual: 1194202, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'enterprise', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 149900, price_annual: 1493004, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'custom', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 189900, price_annual: 1891404, tax_rate: 19, tax_name: 'IVA' },
  
  // Estados Unidos (USD)
  { plan_id: 'free', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 0, price_annual: 0, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'basic', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 79, price_annual: 790, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'professional', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 119, price_annual: 1190, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'enterprise', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 169, price_annual: 1690, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'custom', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 249, price_annual: 2490, tax_rate: 0, tax_name: 'Sales Tax' },
];

async function fixPricing() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CORRECCIÓN DE PRECIOS A VALORES ORIGINALES              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Mostrar precios actuales
    console.log('📋 PRECIOS ACTUALES (INCORRECTOS):\n');
    const before = await client.query('SELECT plan_id, region, price_monthly, price_annual FROM plan_pricing ORDER BY region, plan_id');
    before.rows.forEach(row => {
      console.log(`   ${row.plan_id.padEnd(15)} ${row.region} - $${row.price_monthly}/mes ($${row.price_annual}/año)`);
    });
    console.log('');
    
    // Eliminar todos los precios actuales
    console.log('🗑️  Eliminando precios incorrectos...');
    await client.query('DELETE FROM plan_pricing');
    console.log('✅ Precios eliminados\n');
    
    // Insertar precios correctos
    console.log('💾 Insertando precios CORRECTOS según documentación original...\n');
    
    for (const pricing of PRECIOS_CORRECTOS) {
      await client.query(`
        INSERT INTO plan_pricing (
          plan_id, region, region_name, currency, currency_symbol,
          price_monthly, price_annual, tax_rate, tax_name, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      `, [
        pricing.plan_id,
        pricing.region,
        pricing.region_name,
        pricing.currency,
        pricing.currency_symbol,
        pricing.price_monthly,
        pricing.price_annual,
        pricing.tax_rate,
        pricing.tax_name
      ]);
      
      console.log(`   ✅ ${pricing.plan_id.padEnd(15)} ${pricing.region} - ${pricing.currency_symbol}${pricing.price_monthly}/mes`);
    }
    
    console.log('');
    console.log('📊 PRECIOS CORREGIDOS:\n');
    
    const after = await client.query('SELECT plan_id, region, price_monthly, price_annual FROM plan_pricing ORDER BY region, plan_id');
    after.rows.forEach(row => {
      console.log(`   ${row.plan_id.padEnd(15)} ${row.region} - $${row.price_monthly}/mes ($${row.price_annual}/año)`);
    });
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PRECIOS CORREGIDOS EXITOSAMENTE                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 RESUMEN DE CAMBIOS:\n');
    console.log('Colombia (COP):');
    console.log('  ✅ Básico:       $49,900  → $89,900/mes');
    console.log('  ✅ Profesional:  $119,900 (anual corregido)');
    console.log('  ✅ Empresarial:  $299,900 → $149,900/mes');
    console.log('  ✅ Custom:       AGREGADO $189,900/mes');
    console.log('');
    console.log('USA (USD):');
    console.log('  ✅ Básico:       $15  → $79/mes');
    console.log('  ✅ Profesional:  $35  → $119/mes');
    console.log('  ✅ Empresarial:  $85  → $169/mes');
    console.log('  ✅ Custom:       AGREGADO $249/mes');
    console.log('');
    console.log('Total: 8 → 10 registros (agregado plan "custom" para ambas regiones)');
    console.log('');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixPricing();
