const { Client } = require('pg');
require('dotenv').config();

async function checkSettings() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'consentimientos_db',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Ver todos los settings de companyName
    console.log('📊 SETTINGS DE companyName:');
    const result1 = await client.query(`
      SELECT 
        CASE 
          WHEN "tenantId" IS NULL THEN 'SUPER ADMIN'
          ELSE 'TENANT: ' || "tenantId"
        END as owner,
        key,
        value,
        "tenantId"
      FROM app_settings
      WHERE key = 'companyName'
      ORDER BY "tenantId" NULLS FIRST
    `);
    console.table(result1.rows);

    // 2. Contar settings por tenant
    console.log('\n📊 RESUMEN DE SETTINGS POR OWNER:');
    const result2 = await client.query(`
      SELECT 
        CASE 
          WHEN "tenantId" IS NULL THEN 'SUPER ADMIN'
          ELSE 'TENANT: ' || "tenantId"
        END as owner,
        COUNT(*) as total_settings
      FROM app_settings
      GROUP BY "tenantId"
      ORDER BY "tenantId" NULLS FIRST
    `);
    console.table(result2.rows);

    // 3. Ver todos los tenants
    console.log('\n📊 TENANTS EXISTENTES:');
    const result3 = await client.query(`
      SELECT id, name, slug, "contactEmail"
      FROM tenants
      WHERE "deletedAt" IS NULL
      ORDER BY "createdAt"
    `);
    console.table(result3.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSettings();
