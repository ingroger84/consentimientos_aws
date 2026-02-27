require('dotenv').config();
const { Client } = require('pg');

async function checkCurrentSessionPermissions() {
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

    // Buscar usuario admin
    console.log('=== VERIFICANDO USUARIO ADMINISTRADOR ===\n');
    const userResult = await client.query(`
      SELECT u.id, u.name, u.email, u."roleId", r.name as role_name, r.type as role_type, r.permissions
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE u.email = 'admin@clinicademo.com'
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin@clinicademo.com no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log(`Usuario: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rol: ${user.role_name} (${user.role_type})`);
    console.log(`Role ID: ${user.roleId}\n`);

    // Parsear permisos
    let permissions = [];
    try {
      permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions;
    } catch (error) {
      console.log('⚠️  Error parseando permisos');
      permissions = [];
    }

    console.log(`Total de permisos en BD: ${permissions.length}\n`);

    // Verificar permisos específicos de HC
    console.log('=== PERMISOS DE CONSENTIMIENTOS HC ===\n');
    
    const mrConsentPermissions = [
      'view_mr_consents',
      'generate_mr_consents',
      'delete_mr_consents',
    ];

    mrConsentPermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`  ${has ? '✓' : '✗'} ${perm}`);
    });

    console.log('\n=== SESIONES ACTIVAS ===\n');
    
    // Buscar sesiones activas del usuario
    const sessionsResult = await client.query(`
      SELECT id, "userId", "userAgent", "ipAddress", "lastActivity", "createdAt"
      FROM user_sessions
      WHERE "userId" = $1
      ORDER BY "lastActivity" DESC
      LIMIT 5
    `, [user.id]);

    if (sessionsResult.rows.length > 0) {
      console.log(`Sesiones encontradas: ${sessionsResult.rows.length}\n`);
      sessionsResult.rows.forEach((session, index) => {
        console.log(`Sesión ${index + 1}:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  User Agent: ${session.userAgent?.substring(0, 50)}...`);
        console.log(`  IP: ${session.ipAddress}`);
        console.log(`  Última actividad: ${new Date(session.lastActivity).toLocaleString('es-CO')}`);
        console.log(`  Creada: ${new Date(session.createdAt).toLocaleString('es-CO')}`);
        console.log('');
      });
    } else {
      console.log('No hay sesiones activas');
    }

    console.log('=== INSTRUCCIONES ===\n');
    console.log('El problema es que tu JWT actual fue generado ANTES de agregar los permisos.');
    console.log('El JWT contiene una copia de los permisos en el momento del login.\n');
    console.log('Para solucionar:');
    console.log('1. Cierra sesión en el navegador (botón de logout)');
    console.log('2. Limpia la caché del navegador (Ctrl + Shift + Delete)');
    console.log('3. Vuelve a iniciar sesión como admin@clinicademo.com');
    console.log('4. El nuevo JWT tendrá los 60 permisos actualizados\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkCurrentSessionPermissions();
