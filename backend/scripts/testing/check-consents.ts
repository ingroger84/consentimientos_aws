import { DataSource } from 'typeorm';

async function checkConsents() {
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
  console.log('🔍 Verificando consentimientos...\n');

  try {
    // Consentimientos con sedes antiguas
    const consentsWithOldBranches = await dataSource.query(`
      SELECT c.id, c.client_name, b.name as branch_name, b."tenantId"
      FROM consents c
      LEFT JOIN branches b ON c."branchId" = b.id
      WHERE b."tenantId" IS NULL
    `);

    console.log(`📄 Consentimientos con sedes antiguas: ${consentsWithOldBranches.length}`);
    consentsWithOldBranches.forEach((c: any) => {
      console.log(`   - ${c.client_name} - Sede: ${c.branch_name}`);
    });

    // Consentimientos con servicios antiguos
    const consentsWithOldServices = await dataSource.query(`
      SELECT c.id, c.client_name, s.name as service_name, s."tenantId"
      FROM consents c
      LEFT JOIN services s ON c."serviceId" = s.id
      WHERE s."tenantId" IS NULL
    `);

    console.log(`\n💼 Consentimientos con servicios antiguos: ${consentsWithOldServices.length}`);
    consentsWithOldServices.forEach((c: any) => {
      console.log(`   - ${c.client_name} - Servicio: ${c.service_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkConsents();
