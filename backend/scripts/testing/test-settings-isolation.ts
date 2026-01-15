import { DataSource, IsNull } from 'typeorm';
import { AppSettings } from './src/settings/entities/app-settings.entity';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testSettingsIsolation() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'consentimientos_db',
    entities: [AppSettings],
    synchronize: false,
  });

  console.log('🔌 Conectando a base de datos...');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_DATABASE}`);
  console.log(`   User: ${process.env.DB_USERNAME}`);
  
  await dataSource.initialize();
  console.log('✅ Conexión a base de datos establecida\n');

  const settingsRepo = dataSource.getRepository(AppSettings);

  // 1. Verificar settings del Super Admin (tenantId = NULL)
  console.log('📊 SETTINGS DEL SUPER ADMIN (tenantId = NULL):');
  const superAdminSettings = await settingsRepo.find({
    where: { tenantId: IsNull() },
  });
  console.log(`   Encontrados: ${superAdminSettings.length} registros`);
  superAdminSettings.forEach(s => {
    console.log(`   - ${s.key}: ${s.value}`);
  });

  // 2. Verificar settings de todos los tenants
  console.log('\n📊 SETTINGS DE TENANTS:');
  const tenantSettings = await settingsRepo
    .createQueryBuilder('settings')
    .where('settings.tenantId IS NOT NULL')
    .orderBy('settings.tenantId')
    .getMany();

  const groupedByTenant: Record<string, AppSettings[]> = {};
  tenantSettings.forEach(s => {
    if (!groupedByTenant[s.tenantId]) {
      groupedByTenant[s.tenantId] = [];
    }
    groupedByTenant[s.tenantId].push(s);
  });

  Object.entries(groupedByTenant).forEach(([tenantId, settings]) => {
    console.log(`\n   Tenant ID: ${tenantId}`);
    console.log(`   Registros: ${settings.length}`);
    settings.forEach(s => {
      console.log(`   - ${s.key}: ${s.value}`);
    });
  });

  // 3. Verificar que no hay duplicados
  console.log('\n🔍 VERIFICACIÓN DE DUPLICADOS:');
  
  // Super Admin
  const superAdminKeys = superAdminSettings.map(s => s.key);
  const superAdminDuplicates = superAdminKeys.filter((key, index) => 
    superAdminKeys.indexOf(key) !== index
  );
  if (superAdminDuplicates.length > 0) {
    console.log(`   ❌ Super Admin tiene keys duplicadas: ${superAdminDuplicates.join(', ')}`);
  } else {
    console.log('   ✅ Super Admin no tiene keys duplicadas');
  }

  // Tenants
  Object.entries(groupedByTenant).forEach(([tenantId, settings]) => {
    const keys = settings.map(s => s.key);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicates.length > 0) {
      console.log(`   ❌ Tenant ${tenantId} tiene keys duplicadas: ${duplicates.join(', ')}`);
    } else {
      console.log(`   ✅ Tenant ${tenantId} no tiene keys duplicadas`);
    }
  });

  await dataSource.destroy();
  console.log('\n✅ Prueba completada');
}

testSettingsIsolation().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
