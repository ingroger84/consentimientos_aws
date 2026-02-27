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

// Precios CORRECTOS según documentación original
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
    
    // Eliminar TODOS los precios
    console.log('🗑️  Limpiando tabla plan_pricing...');
    await client.query('DELETE FROM plan_pricing');
    console.log('✅ Tabla limpiada\n');
    
    // Insertar precios correctos
    console.log('💾 Insertando precios correctos...\n');
    
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
      
      console.log(`   ✅ ${pricing.plan_id.padEnd(15)} ${pricing.region} - $${pricing.price_monthly}/mes ($${pricing.price_annual}/año)`);
    }
    
    console.log('\n✅ Precios insertados correctamente\n');
    
    // Verificar
    const result = await client.query('SELECT plan_id, region, price_monthly, price_annual FROM plan_pricing ORDER BY region, plan_id');
    
    console.log('📊 VERIFICACIÓN FINAL:\n');
    console.log('Colombia (COP):');
    result.rows.filter(r => r.region === 'CO').forEach(row => {
      console.log(`   ${row.plan_id.padEnd(15)} $${row.price_monthly}/mes ($${row.price_annual}/año)`);
    });
    
    console.log('\nUSA (USD):');
    result.rows.filter(r => r.region === 'US').forEach(row => {
      console.log(`   ${row.plan_id.padEnd(15)} $${row.price_monthly}/mes ($${row.price_annual}/año)`);
    });
    
    console.log(`\nTotal: ${result.rows.length} registros`);
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixPricing();
