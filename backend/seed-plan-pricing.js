const { Client } = require('pg');

const supabaseConfig = {
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const planPricing = [
  // Colombia
  { plan_id: 'free', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 0, price_annual: 0, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'basic', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 49900, price_annual: 499000, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'professional', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 119900, price_annual: 1199000, tax_rate: 19, tax_name: 'IVA' },
  { plan_id: 'enterprise', region: 'CO', region_name: 'Colombia', currency: 'COP', currency_symbol: '$', price_monthly: 299900, price_annual: 2999000, tax_rate: 19, tax_name: 'IVA' },
  
  // Estados Unidos
  { plan_id: 'free', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 0, price_annual: 0, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'basic', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 15, price_annual: 150, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'professional', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 35, price_annual: 350, tax_rate: 0, tax_name: 'Sales Tax' },
  { plan_id: 'enterprise', region: 'US', region_name: 'United States', currency: 'USD', currency_symbol: '$', price_monthly: 85, price_annual: 850, tax_rate: 0, tax_name: 'Sales Tax' },
  
  // México
  { plan_id: 'free', region: 'MX', region_name: 'México', currency: 'MXN', currency_symbol: '$', price_monthly: 0, price_annual: 0, tax_rate: 16, tax_name: 'IVA' },
  { plan_id: 'basic', region: 'MX', region_name: 'México', currency: 'MXN', currency_symbol: '$', price_monthly: 299, price_annual: 2990, tax_rate: 16, tax_name: 'IVA' },
  { plan_id: 'professional', region: 'MX', region_name: 'México', currency: 'MXN', currency_symbol: '$', price_monthly: 699, price_annual: 6990, tax_rate: 16, tax_name: 'IVA' },
  { plan_id: 'enterprise', region: 'MX', region_name: 'México', currency: 'MXN', currency_symbol: '$', price_monthly: 1699, price_annual: 16990, tax_rate: 16, tax_name: 'IVA' },
];

async function seedPlanPricing() {
  const client = new Client(supabaseConfig);
  
  try {
    console.log('\n=== Creando Precios de Planes ===\n');
    await client.connect();
    
    // Limpiar tabla
    await client.query('DELETE FROM plan_pricing');
    console.log('✅ Tabla limpiada');
    console.log('');
    
    // Insertar precios
    for (const pricing of planPricing) {
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
      
      console.log(`✅ ${pricing.plan_id.padEnd(15)} ${pricing.region} - ${pricing.currency_symbol}${pricing.price_monthly}/mes`);
    }
    
    console.log('');
    console.log(`✅ ${planPricing.length} precios creados`);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedPlanPricing();
