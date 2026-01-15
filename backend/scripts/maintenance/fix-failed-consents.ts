import { DataSource } from 'typeorm';
import { Consent } from './src/consents/entities/consent.entity';

async function fixFailedConsents() {
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

  console.log('🔧 Corrigiendo consentimientos con estado FAILED...\n');

  const consentRepo = dataSource.getRepository(Consent);
  
  // Buscar todos los consentimientos FAILED que tienen PDF generado
  const failedConsents = await consentRepo
    .createQueryBuilder('consent')
    .leftJoinAndSelect('consent.service', 'service')
    .leftJoinAndSelect('consent.branch', 'branch')
    .where('consent.status = :status', { status: 'FAILED' })
    .andWhere('consent.pdfUrl IS NOT NULL')
    .getMany();

  if (failedConsents.length === 0) {
    console.log('✅ No hay consentimientos FAILED para corregir');
  } else {
    console.log(`📋 Se encontraron ${failedConsents.length} consentimiento(s) FAILED:\n`);
    
    for (const consent of failedConsents) {
      console.log(`Corrigiendo: ${consent.clientName} (${consent.clientId})`);
      console.log(`  Servicio: ${consent.service?.name}`);
      console.log(`  Sede: ${consent.branch?.name}`);
      console.log(`  Estado anterior: FAILED`);
      
      // Cambiar estado a SIGNED para permitir reenvío
      consent.status = 'SIGNED' as any;
      await consentRepo.save(consent);
      
      console.log(`  Estado nuevo: SIGNED ✅`);
      console.log('');
    }
    
    console.log('🎉 Corrección completada!');
    console.log('\nAhora puedes:');
    console.log('1. Configurar Gmail en el archivo .env (ver doc/GUIA_RAPIDA_GMAIL.md)');
    console.log('2. Reiniciar el backend');
    console.log('3. Hacer clic en "Reenviar Email" en cada consentimiento');
  }

  await dataSource.destroy();
}

fixFailedConsents().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
