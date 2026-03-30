require('dotenv').config();
const { Client } = require('pg');

async function invalidateSuperAdminSessions() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'rcaraballo@innovasystems.com.co';
    console.log(`Invalidando sesiones de: ${superAdminEmail}\n`);

    // 1. Buscar el usuario
    const userResult = await client.query(`
      SELECT id, email FROM users WHERE email = $1
    `, [superAdminEmail]);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log(`Usuario encontrado: ${user.id}\n`);

    // 2. Ver sesiones actuales
    const sessionsResult = await client.query(`
      SELECT 
        id,
        "userId",
        "expiresAt",
        "createdAt"
      FROM user_sessions
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `, [user.id]);

    console.log(`=== SESIONES ACTUALES (${sessionsResult.rows.length}) ===\n`);
    sessionsResult.rows.forEach((session, index) => {
      const isExpired = new Date(session.expiresAt) < new Date();
      console.log(`${index + 1}. ${session.id.substring(0, 16)}...`);
      console.log(`   Creada: ${session.createdAt}`);
      console.log(`   Expira: ${session.expiresAt}`);
      console.log(`   Estado: ${isExpired ? '❌ Expirada' : '✓ Activa'}`);
    });
    console.log('');

    // 3. Eliminar TODAS las sesiones del usuario
    const deleteResult = await client.query(`
      DELETE FROM user_sessions
      WHERE "userId" = $1
    `, [user.id]);

    console.log(`✓ ${deleteResult.rowCount} sesión(es) eliminada(s)\n`);

    // 4. Verificar que no queden sesiones
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM user_sessions
      WHERE "userId" = $1
    `, [user.id]);

    console.log(`Sesiones restantes: ${verifyResult.rows[0].count}\n`);

    console.log('✓ Sesiones invalidadas exitosamente');
    console.log('\n=== INSTRUCCIONES PARA EL USUARIO ===\n');
    console.log('1. Cerrar TODAS las pestañas del navegador con el sistema');
    console.log('2. Abrir una nueva ventana de incógnito (Ctrl+Shift+N)');
    console.log('3. Ir a: https://archivoenlinea.com/login');
    console.log('4. Iniciar sesión con: ' + superAdminEmail);
    console.log('5. Verificar que ahora puede ver los tenants');
    console.log('');
    console.log('⚠️  Si el problema persiste, limpiar cookies del navegador:');
    console.log('   - Chrome: Configuración > Privacidad > Borrar datos de navegación');
    console.log('   - Seleccionar "Cookies" y "Archivos en caché"');
    console.log('   - Período: "Desde siempre"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

invalidateSuperAdminSessions();
