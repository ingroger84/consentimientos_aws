import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixQuestionsTenant() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'consentimientos',
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  });

  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos');

  try {
    // Asignar tenantId a preguntas basándose en el servicio
    const result = await dataSource.query(`
      UPDATE questions q
      SET "tenantId" = s."tenantId"
      FROM services s
      WHERE q."serviceId" = s.id
      AND q."tenantId" IS NULL
      AND s."tenantId" IS NOT NULL
    `);

    console.log(`✅ Actualizadas ${result[1]} preguntas con tenantId desde servicios`);

    // Mostrar resumen
    const summary = await dataSource.query(`
      SELECT 
        CASE 
          WHEN q."tenantId" IS NULL THEN 'Sin tenant (Super Admin)'
          ELSE t.name
        END as tenant_name,
        COUNT(*) as total_preguntas
      FROM questions q
      LEFT JOIN tenants t ON q."tenantId" = t.id
      WHERE q."deleted_at" IS NULL
      GROUP BY q."tenantId", t.name
      ORDER BY tenant_name
    `);

    console.log('\n📊 Resumen de preguntas por tenant:');
    summary.forEach((row: any) => {
      console.log(`  - ${row.tenant_name}: ${row.total_preguntas} preguntas`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
    console.log('\n✅ Desconectado de la base de datos');
  }
}

fixQuestionsTenant();
