/**
 * Script para invalidar la sesión del Super Admin
 */

const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres.witvuzaarlqxkiqfiljq',
  password: process.env.DB_PASSWORD || 'DataGree2026!Secure',
  database: process.env.DB_DATABASE || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function invalidateSession() {
  console.log('='.repeat(60));
  console.log('INVALIDAR SESIÓN DEL SUPER ADMIN');
  console.log('='.repeat(60));
  console.log('');

  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');
    console.log('');

    // Buscar sesiones del Super Admin
    const sessions = await AppDataSource.query(`
      SELECT id, "userId", "createdAt", "expiresAt"
      FROM sessions
      WHERE "userId" = (
        SELECT id FROM users WHERE email = 'rcaraballo@innovasystems.com.co'
      )
    `);

    console.log(`📋 Sesiones encontradas: ${sessions.length}`);
    console.log('');

    if (sessions.length === 0) {
      console.log('ℹ️  No hay sesiones activas para invalidar');
    } else {
      // Eliminar todas las sesiones
      const result = await AppDataSource.query(`
        DELETE FROM sessions
        WHERE "userId" = (
          SELECT id FROM users WHERE email = 'rcaraballo@innovasystems.com.co'
        )
      `);

      console.log(`✅ ${sessions.length} sesión(es) invalidada(s)`);
      console.log('');
      console.log('💡 El usuario debe cerrar sesión y volver a iniciar sesión');
      console.log('   para que los nuevos permisos se carguen.');
    }

    console.log('');
    console.log('='.repeat(60));

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

invalidateSession();
