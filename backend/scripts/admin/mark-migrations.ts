import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos',
  synchronize: false,
});

async function markMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida con la base de datos\n');

    // Marcar las migraciones antiguas como ejecutadas
    const migrations = [
      { timestamp: 1704297600000, name: 'AddMultiplePdfUrls' },
      { timestamp: 1704297700000, name: 'AddPhotoUrlToConsents' },
      { timestamp: 1704297800000, name: 'AddClientPhotoToConsents' },
      { timestamp: 1736050000000, name: 'AddTenantSupport1736050000000' },
    ];

    for (const migration of migrations) {
      const exists = await AppDataSource.query(`
        SELECT * FROM migrations WHERE timestamp = $1
      `, [migration.timestamp]);

      if (exists.length === 0) {
        await AppDataSource.query(`
          INSERT INTO migrations (timestamp, name)
          VALUES ($1, $2)
        `, [migration.timestamp, migration.name]);
        console.log(`✅ Migración marcada: ${migration.name}`);
      } else {
        console.log(`⏭️  Migración ya existe: ${migration.name}`);
      }
    }

    console.log('\n✅ Todas las migraciones antiguas han sido marcadas\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

markMigrations();
