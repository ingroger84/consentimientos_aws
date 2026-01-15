import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function runFix() {
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
  console.log('🔧 Ejecutando script de corrección...\n');

  try {
    const sqlFile = fs.readFileSync(path.join(__dirname, 'fix-duplicates.sql'), 'utf8');
    const statements = sqlFile.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
        const result = await dataSource.query(statement);
        if (Array.isArray(result) && result.length > 0) {
          console.log('Resultado:', result);
        }
      }
    }

    console.log('\n🎉 Script ejecutado exitosamente!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runFix().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
