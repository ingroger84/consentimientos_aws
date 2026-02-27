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

async function fixPlanPricing() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');
    
    console.log('📋 PRECIOS ACTUALES:\n');
    const before = await client.query('SELECT region, COUNT(*) as count FROM plan_pricing GROUP BY region ORDER BY region');
    before.rows.forEach(row => {
      console.log(`   ${row.region}: ${row.count} planes`);
    });
    console.log('');
    
    // Eliminar precios de México (MX)
    console.log('🗑️  Eliminando precios de México (MX)...');
    const result = await client.query(`DELETE FROM plan_pricing WHERE region = 'MX'`);
    console.log(`✅ ${result.rowCount} registros eliminados\n`);
    
    console.log('📋 PRECIOS DESPUÉS DE LA CORRECCIÓN:\n');
    const after = await client.query('SELECT region, COUNT(*) as count FROM plan_pricing GROUP BY region ORDER BY region');
    after.rows.forEach(row => {
      console.log(`   ${row.region}: ${row.count} planes`);
    });
    console.log('');
    
    // Mostrar detalle
    console.log('📊 DETALLE DE PRECIOS:\n');
    const detail = await client.query(`
      SELECT plan_id, region, region_name, currency, price_monthly, price_annual
      FROM plan_pricing
      ORDER BY region, plan_id
    `);
    
    detail.rows.forEach(row => {
      console.log(`   ${row.plan_id.padEnd(15)} ${row.region} - ${row.currency} ${row.price_monthly}/mes`);
    });
    
    console.log('\n✅ Corrección completada');
    console.log('✅ Ahora solo hay precios para Colombia (CO) y USA (US)');
    console.log('✅ México (MX) fue eliminado según el plan original\n');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPlanPricing();
