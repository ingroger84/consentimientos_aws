import { DataSource } from 'typeorm';

async function deleteOld() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('🗑️ Eliminando datos antiguos...\n');

  try {
    // Eliminar sedes sin tenant
    console.log('📍 Eliminando sedes sin tenant...');
    const result1 = await dataSource.query('DELETE FROM branches WHERE "tenantId" IS NULL');
    console.log(`✅ Eliminadas ${result1[1]} sedes`);

    // Eliminar servicios sin tenant
    console.log('\n💼 Eliminando servicios sin tenant...');
    const result2 = await dataSource.query('DELETE FROM services WHERE "tenantId" IS NULL');
    console.log(`✅ Eliminados ${result2[1]} servicios`);

    // Verificar
    console.log('\n📊 Verificando...');
    const branches = await dataSource.query('SELECT COUNT(*) FROM branches WHERE deleted_at IS NULL');
    const services = await dataSource.query('SELECT COUNT(*) FROM services WHERE deleted_at IS NULL');
    
    console.log(`   Sedes: ${branches[0].count}`);
    console.log(`   Servicios: ${services[0].count}`);

    console.log('\n🎉 Limpieza completada!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

deleteOld().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
