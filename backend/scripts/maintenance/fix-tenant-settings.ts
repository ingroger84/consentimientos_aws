import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos',
});

async function fixTenantSettings() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener el tenant
    const tenants = await AppDataSource.query(`
      SELECT id, name, slug FROM tenants WHERE slug = 'demo' AND deleted_at IS NULL
    `);

    if (tenants.length === 0) {
      console.log('❌ No se encontró el tenant demo');
      return;
    }

    const tenant = tenants[0];
    console.log(`📋 Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   ID: ${tenant.id}\n`);

    // Eliminar TODOS los settings del tenant
    const deleteResult = await AppDataSource.query(`
      DELETE FROM app_settings WHERE "tenantId" = $1
    `, [tenant.id]);

    console.log(`🗑️  Eliminados ${deleteResult[1]} registros de configuración del tenant\n`);

    // Insertar solo los settings iniciales del tenant
    const initialSettings = [
      { key: 'companyName', value: 'Demo' },
      { key: 'companyAddress', value: '' },
      { key: 'companyPhone', value: '3000000000' },
      { key: 'companyEmail', value: 'demo@demo.com' },
      { key: 'companyWebsite', value: '' },
    ];

    console.log('📝 Insertando configuración inicial del tenant...\n');

    for (const setting of initialSettings) {
      await AppDataSource.query(`
        INSERT INTO app_settings (key, value, "tenantId", created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
      `, [setting.key, setting.value, tenant.id]);
      
      console.log(`   ✅ ${setting.key}: ${setting.value}`);
    }

    console.log('\n✅ Configuración del tenant corregida exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixTenantSettings();
