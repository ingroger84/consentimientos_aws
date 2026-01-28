const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const settings = [
  // Información de la empresa
  { key: 'companyName', value: 'Sistema de Consentimientos' },
  { key: 'companyAddress', value: 'Dirección del Super Admin' },
  { key: 'companyPhone', value: '+57 300 123 4567' },
  { key: 'companyEmail', value: 'admin@sistema.com' },
  { key: 'companyWebsite', value: 'https://sistema.com' },
  
  // Colores principales
  { key: 'primaryColor', value: '#3B82F6' },
  { key: 'secondaryColor', value: '#10B981' },
  { key: 'accentColor', value: '#F59E0B' },
  
  // Colores adicionales
  { key: 'textColor', value: '#1F2937' },
  { key: 'linkColor', value: '#3B82F6' },
  { key: 'borderColor', value: '#D1D5DB' },
  
  // Configuración de logo
  { key: 'logoSize', value: '60' },
  { key: 'logoPosition', value: 'center' },
  { key: 'watermarkOpacity', value: '0.1' },
  
  // Textos personalizables
  { key: 'footerText', value: 'Sistema de Consentimientos - Administración' },
  { key: 'procedureTitle', value: 'CONSENTIMIENTO DEL PROCEDIMIENTO' },
  { key: 'dataTreatmentTitle', value: 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES' },
  { key: 'imageRightsTitle', value: 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES' },
];

async function setupSuperAdminSettings() {
  const client = await pool.connect();
  
  try {
    console.log('========================================');
    console.log('  Configurar Settings del Super Admin  ');
    console.log('========================================');
    console.log('');
    
    // Verificar settings existentes
    console.log('Verificando settings existentes del Super Admin...');
    const existingResult = await client.query(
      'SELECT COUNT(*) as count FROM app_settings WHERE "tenantId" IS NULL'
    );
    const existingCount = parseInt(existingResult.rows[0].count);
    console.log(`  Encontrados: ${existingCount} settings`);
    console.log('');
    
    // Eliminar settings existentes
    if (existingCount > 0) {
      console.log('Eliminando settings existentes...');
      await client.query('DELETE FROM app_settings WHERE "tenantId" IS NULL');
      console.log('  Settings eliminados');
      console.log('');
    }
    
    // Insertar nuevos settings
    console.log('Insertando nuevos settings...');
    for (const setting of settings) {
      await client.query(
        `INSERT INTO app_settings (key, value, "tenantId", created_at, updated_at) 
         VALUES ($1, $2, NULL, NOW(), NOW())`,
        [setting.key, setting.value]
      );
      console.log(`  ✓ ${setting.key} = ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
    }
    console.log('');
    
    // Verificar que se crearon correctamente
    const finalResult = await client.query(
      'SELECT COUNT(*) as count FROM app_settings WHERE "tenantId" IS NULL'
    );
    const finalCount = parseInt(finalResult.rows[0].count);
    
    console.log('========================================');
    console.log('  Settings configurados exitosamente  ');
    console.log('========================================');
    console.log('');
    console.log(`Total de settings creados: ${finalCount}`);
    console.log('');
    console.log('Próximos pasos:');
    console.log('1. Recarga la página de login en localhost:5173');
    console.log('2. Deberías ver "Sistema de Consentimientos" como nombre');
    console.log('3. Si quieres personalizar, ve a Configuración después de iniciar sesión');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupSuperAdminSettings();
