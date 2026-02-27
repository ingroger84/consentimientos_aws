/**
 * Script para crear el esquema completo en Supabase
 * Usa TypeORM con synchronize: true para crear todas las tablas
 */

const { DataSource } = require('typeorm');
require('dotenv').config();

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function createSchema() {
  log('\n' + '='.repeat(70), colors.cyan);
  log('🔧 CREANDO ESQUEMA EN SUPABASE', colors.cyan);
  log('='.repeat(70) + '\n', colors.cyan);
  
  log('📋 Configuración:', colors.yellow);
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_DATABASE}`);
  console.log(`  User: ${process.env.DB_USERNAME}\n`);
  
  // Crear DataSource con synchronize: true
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
    entities: ['dist/**/*.entity.js'],
    synchronize: true, // ⚠️ SOLO PARA CREAR ESQUEMA INICIAL
    logging: false,
  });
  
  try {
    log('🔌 Conectando a Supabase...', colors.yellow);
    await AppDataSource.initialize();
    log('✅ Conexión establecida\n', colors.green);
    
    log('🏗️  Creando tablas...', colors.yellow);
    log('   (TypeORM está sincronizando el esquema)\n', colors.yellow);
    
    // TypeORM ya creó las tablas con synchronize: true
    
    // Verificar tablas creadas
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log('✅ Esquema creado exitosamente\n', colors.green);
    log(`📊 Tablas creadas (${tables.length}):`, colors.cyan);
    tables.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });
    
    await AppDataSource.destroy();
    
    log('\n' + '='.repeat(70), colors.cyan);
    log('🎉 ESQUEMA CREADO EXITOSAMENTE', colors.green);
    log('='.repeat(70) + '\n', colors.cyan);
    
    log('📝 Próximos pasos:', colors.yellow);
    log('  1. Ejecutar seed para crear datos iniciales', colors.reset);
    log('  2. Crear usuario super admin', colors.reset);
    log('  3. Probar la aplicación\n', colors.reset);
    
    return true;
    
  } catch (error) {
    log('\n' + '='.repeat(70), colors.cyan);
    log('❌ ERROR AL CREAR ESQUEMA', colors.red);
    log('='.repeat(70) + '\n', colors.cyan);
    console.error(error);
    return false;
  }
}

// Ejecutar
(async () => {
  const success = await createSchema();
  process.exit(success ? 0 : 1);
})();
