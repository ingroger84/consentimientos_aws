import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetSuperAdminSettings() {
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

    console.log('========== RESETEANDO SETTINGS DEL SUPER ADMIN ==========\n');

    // Eliminar todos los settings del Super Admin
    const deleteResult = await dataSource.query(`
      DELETE FROM app_settings
      WHERE "tenantId" IS NULL
    `);

    console.log(`✅ Eliminados ${deleteResult[1]} settings del Super Admin\n`);

    // Insertar settings por defecto
    const defaultSettings = [
      { key: 'primaryColor', value: '#3B82F6' },
      { key: 'secondaryColor', value: '#10B981' },
      { key: 'accentColor', value: '#F59E0B' },
      { key: 'textColor', value: '#1F2937' },
      { key: 'linkColor', value: '#3B82F6' },
      { key: 'borderColor', value: '#D1D5DB' },
      { key: 'companyName', value: 'Sistema de Consentimientos' },
      { key: 'companyAddress', value: '' },
      { key: 'companyPhone', value: '' },
      { key: 'companyEmail', value: '' },
      { key: 'companyWebsite', value: '' },
      { key: 'logoSize', value: '60' },
      { key: 'logoPosition', value: 'left' },
      { key: 'watermarkOpacity', value: '0.1' },
      { key: 'footerText', value: '' },
      { key: 'procedureTitle', value: 'CONSENTIMIENTO DEL PROCEDIMIENTO' },
      { key: 'dataTreatmentTitle', value: 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES' },
      { key: 'imageRightsTitle', value: 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES' },
    ];

    console.log('Insertando settings por defecto...\n');

    for (const setting of defaultSettings) {
      await dataSource.query(`
        INSERT INTO app_settings (key, value, "tenantId", created_at, updated_at)
        VALUES ($1, $2, NULL, NOW(), NOW())
      `, [setting.key, setting.value]);
      
      console.log(`✅ ${setting.key}: ${setting.value}`);
    }

    console.log('\n========== SETTINGS RESETEADOS EXITOSAMENTE ==========');
    console.log('El Super Admin ahora tiene los settings por defecto.');
    console.log('No tiene logos personalizados.');
    console.log('companyName: "Sistema de Consentimientos"');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetSuperAdminSettings();
