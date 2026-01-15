import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkSuperAdminSettings() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener settings del Super Admin (tenantId IS NULL)
    const superAdminSettings = await dataSource.query(`
      SELECT key, value, "tenantId"
      FROM app_settings
      WHERE "tenantId" IS NULL
      ORDER BY key
    `);

    console.log('========== SETTINGS DEL SUPER ADMIN (tenantId IS NULL) ==========');
    console.log(`Total de registros: ${superAdminSettings.length}\n`);

    superAdminSettings.forEach((setting: any) => {
      console.log(`${setting.key}: ${setting.value}`);
    });

    console.log('\n========== SETTINGS DE TENANTS ==========');
    
    // Obtener settings de tenants
    const tenantSettings = await dataSource.query(`
      SELECT DISTINCT t.name, t.slug, COUNT(s.id) as settings_count
      FROM tenants t
      LEFT JOIN app_settings s ON s."tenantId" = t.id
      GROUP BY t.id, t.name, t.slug
      ORDER BY t.name
    `);

    tenantSettings.forEach((tenant: any) => {
      console.log(`${tenant.name} (${tenant.slug}): ${tenant.settings_count} settings`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSuperAdminSettings();
