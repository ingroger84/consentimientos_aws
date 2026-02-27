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

async function checkPlanPricing() {
  await client.connect();
  
  console.log('📋 ESTRUCTURA DE plan_pricing:\n');
  
  const columns = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'plan_pricing'
    ORDER BY ordinal_position
  `);
  
  columns.rows.forEach(col => {
    console.log(`  ${col.column_name} (${col.data_type})`);
  });
  
  console.log('\n📊 DATOS ACTUALES:\n');
  
  const data = await client.query('SELECT * FROM plan_pricing ORDER BY id');
  
  data.rows.forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });
  
  console.log(`\nTotal: ${data.rows.length} registros`);
  
  await client.end();
}

checkPlanPricing().catch(console.error);
