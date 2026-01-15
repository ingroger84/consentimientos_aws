import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'consentimientos',
});

async function addPasswordResetFields() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Agregar columnas si no existen
    await AppDataSource.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
    `);
    console.log('✅ Columnas agregadas');

    // Crear índice si no existe
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS IDX_users_reset_password_token 
      ON users(reset_password_token);
    `);
    console.log('✅ Índice creado');

    // Marcar migración como ejecutada
    await AppDataSource.query(`
      INSERT INTO migrations (timestamp, name)
      VALUES (1736260000000, 'AddPasswordResetToUser1736260000000')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Migración marcada como ejecutada');

    console.log('\n✅ Campos de reset de contraseña agregados exitosamente');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPasswordResetFields();
