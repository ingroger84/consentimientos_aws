require('dotenv').config();
const { Client } = require('pg');

async function checkSuperAdmin() {
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
    console.log(`Buscando Super Admin: ${superAdminEmail}\n`);

    // 1. Buscar el usuario Super Admin
    const userResult = await client.query(`
      SELECT *
      FROM users
      WHERE email = $1
    `, [superAdminEmail]);

    if (userResult.rows.length === 0) {
      console.log('❌ No se encontró el usuario Super Admin\n');
      return;
    }

    const user = userResult.rows[0];
    console.log('=== USUARIO SUPER ADMIN ===\n');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Nombre: ${user.fullName || user.full_name || user.name || 'N/A'}`);
    console.log(`Role ID: ${user.role_id || user.roleId}`);
    console.log(`Tenant ID: ${user.tenant_id || user.tenantId}`);
    console.log(`\nPermisos:`);
    
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(perm => {
        console.log(`  - ${perm}`);
      });
    } else {
      console.log('  ⚠️  Sin permisos o formato incorrecto');
    }
    console.log('');

    // 2. Verificar si tiene el permiso MANAGE_TENANTS
    const hasManageTenants = user.permissions && user.permissions.includes('manage_tenants');
    console.log(`¿Tiene permiso MANAGE_TENANTS? ${hasManageTenants ? '✓ SÍ' : '❌ NO'}\n`);

    // 3. Verificar el rol
    if (user.role_id) {
      const roleResult = await client.query(`
        SELECT id, name, permissions
        FROM roles
        WHERE id = $1
      `, [user.role_id]);

      if (roleResult.rows.length > 0) {
        const role = roleResult.rows[0];
        console.log('=== ROL DEL USUARIO ===\n');
        console.log(`Nombre: ${role.name}`);
        console.log(`\nPermisos del rol:`);
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(perm => {
            console.log(`  - ${perm}`);
          });
        }
        console.log('');
      }
    }

    // 4. Verificar sesiones activas
    const sessionsResult = await client.query(`
      SELECT 
        id,
        user_id,
        expires_at,
        created_at
      FROM user_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [user.id]);

    console.log('=== SESIONES RECIENTES ===\n');
    if (sessionsResult.rows.length > 0) {
      sessionsResult.rows.forEach((session, index) => {
        const isExpired = new Date(session.expires_at) < new Date();
        console.log(`${index + 1}. Sesión ${session.id.substring(0, 8)}...`);
        console.log(`   Creada: ${session.created_at}`);
        console.log(`   Expira: ${session.expires_at}`);
        console.log(`   Estado: ${isExpired ? '❌ Expirada' : '✓ Activa'}`);
        console.log('');
      });
    } else {
      console.log('  No hay sesiones registradas\n');
    }

    console.log('✓ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkSuperAdmin();
