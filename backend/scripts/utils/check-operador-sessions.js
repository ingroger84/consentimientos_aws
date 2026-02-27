require('dotenv').config();
const { Client } = require('pg');

async function checkOperadorSessions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'consentimientos',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Buscar el usuario operador1
    console.log('=== BUSCANDO USUARIO ===');
    const userResult = await client.query(`
      SELECT id, email, name, created_at
      FROM users
      WHERE email = 'operador1@demo-clinica.com'
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario operador1@demo-medico.com no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('Usuario encontrado:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Nombre: ${user.name}`);
    console.log(`  Creado: ${user.created_at}\n`);

    // Buscar todas las sesiones del usuario
    console.log('=== SESIONES DEL USUARIO ===');
    const sessionsResult = await client.query(`
      SELECT 
        id,
        "userId",
        "sessionToken",
        "isActive",
        "userAgent",
        "ipAddress",
        "createdAt",
        "lastActivityAt",
        "expiresAt"
      FROM user_sessions
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `, [user.id]);

    if (sessionsResult.rows.length === 0) {
      console.log('❌ No se encontraron sesiones para este usuario');
      console.log('\nEsto es ANORMAL si el usuario ha intentado iniciar sesión.');
      console.log('Posibles causas:');
      console.log('  1. La tabla user_sessions no existe');
      console.log('  2. El servicio de sesión no está funcionando');
      console.log('  3. Hay un error en el proceso de login\n');
    } else {
      console.log(`Total de sesiones: ${sessionsResult.rows.length}\n`);
      
      sessionsResult.rows.forEach((session, index) => {
        console.log(`Sesión ${index + 1}:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  Estado: ${session.isActive ? '✓ ACTIVA' : '✗ INACTIVA'}`);
        console.log(`  Token (primeros 20 chars): ${session.sessionToken.substring(0, 20)}...`);
        console.log(`  User Agent: ${session.userAgent || 'N/A'}`);
        console.log(`  IP: ${session.ipAddress || 'N/A'}`);
        console.log(`  Creada: ${session.createdAt}`);
        console.log(`  Última actividad: ${session.lastActivityAt}`);
        console.log(`  Expira: ${session.expiresAt}`);
        
        // Verificar si está expirada
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < now) {
          console.log(`  ⚠️  EXPIRADA (hace ${Math.round((now - expiresAt) / 1000 / 60)} minutos)`);
        } else {
          console.log(`  ✓ Válida (expira en ${Math.round((expiresAt - now) / 1000 / 60)} minutos)`);
        }
        console.log('');
      });

      // Resumen
      const activeSessions = sessionsResult.rows.filter(s => s.isActive);
      const expiredSessions = sessionsResult.rows.filter(s => new Date(s.expiresAt) < new Date());
      
      console.log('=== RESUMEN ===');
      console.log(`Sesiones activas: ${activeSessions.length}`);
      console.log(`Sesiones inactivas: ${sessionsResult.rows.length - activeSessions.length}`);
      console.log(`Sesiones expiradas: ${expiredSessions.length}`);
      
      if (activeSessions.length === 0) {
        console.log('\n⚠️  PROBLEMA DETECTADO: No hay sesiones activas');
        console.log('El usuario debería tener al menos 1 sesión activa si acaba de iniciar sesión.');
        console.log('\nPosibles causas:');
        console.log('  1. La sesión se cerró inmediatamente después de crearse');
        console.log('  2. El SessionGuard está cerrando la sesión incorrectamente');
        console.log('  3. Hay un problema con el hash del token JWT');
      }
    }

    // Verificar la estructura de la tabla
    console.log('\n=== ESTRUCTURA DE LA TABLA ===');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas de user_sessions:');
    tableStructure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkOperadorSessions();
