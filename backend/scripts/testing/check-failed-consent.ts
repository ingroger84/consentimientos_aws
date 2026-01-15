import { DataSource } from 'typeorm';
import { Consent } from './src/consents/entities/consent.entity';

async function checkFailedConsent() {
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

  console.log('🔍 Buscando consentimiento de John Doe con estado FAILED...\n');

  const consentRepo = dataSource.getRepository(Consent);
  
  const failedConsents = await consentRepo
    .createQueryBuilder('consent')
    .leftJoinAndSelect('consent.service', 'service')
    .leftJoinAndSelect('consent.branch', 'branch')
    .leftJoinAndSelect('consent.tenant', 'tenant')
    .where('consent.clientName LIKE :name', { name: '%John Doe%' })
    .andWhere('consent.status = :status', { status: 'FAILED' })
    .getMany();

  if (failedConsents.length === 0) {
    console.log('❌ No se encontraron consentimientos de John Doe con estado FAILED');
  } else {
    console.log(`✅ Se encontraron ${failedConsents.length} consentimiento(s) FAILED:\n`);
    
    failedConsents.forEach((consent, index) => {
      console.log(`--- Consentimiento ${index + 1} ---`);
      console.log('ID:', consent.id);
      console.log('Cliente:', consent.clientName);
      console.log('Email:', consent.clientEmail);
      console.log('Cédula:', consent.clientId);
      console.log('Servicio:', consent.service?.name || 'N/A');
      console.log('Sede:', consent.branch?.name || 'N/A');
      console.log('Tenant:', consent.tenant?.name || 'Super Admin');
      console.log('Estado:', consent.status);
      console.log('PDF URL:', consent.pdfUrl || 'No generado');
      console.log('Fecha de firma:', consent.signedAt || 'No firmado');
      console.log('Fecha creación:', consent.createdAt);
      console.log('Fecha actualización:', consent.updatedAt);
      console.log('');
    });
  }

  await dataSource.destroy();
}

checkFailedConsent().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
