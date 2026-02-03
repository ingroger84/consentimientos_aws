const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function testSuperAdminLogin() {
  try {
    console.log('========================================');
    console.log('  Test Login Super Admin');
    console.log('========================================\n');

    // 1. Buscar el usuario Super Admin
    const userResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u."tenantId",
        u."roleId",
        u."isActive",
        r.type as role_type,
        r.name as role_name,
        r.permissions
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE u."tenantId" IS NULL
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ No se encontró ningún usuario Super Admin');
      return;
    }

    const user = userResult.rows[0];
    console.log('✓ Usuario Super Admin encontrado:');
    console.log(`  Nombre: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Activo: ${user.isActive ? 'SÍ' : 'NO'}`);
    console.log(`  Rol: ${user.role_name} (${user.role_type})`);

    // 2. Verificar permisos
    let permissions = user.permissions;
    if (typeof permissions === 'string') {
      permissions = permissions.replace(/[{}]/g, '').split(',');
    }

    console.log(`\n✓ Permisos del rol (${permissions.length}):`);
    console.log(`  - view_global_stats: ${permissions.includes('view_global_stats') ? 'SÍ' : 'NO'}`);
    console.log(`  - view_dashboard: ${permissions.includes('view_dashboard') ? 'SÍ' : 'NO'}`);
    console.log(`  - view_users: ${permissions.includes('view_users') ? 'SÍ' : 'NO'}`);

    // 3. Simular el payload del JWT
    const jwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role_type,
      tenantId: user.tenantId,
      tenantSlug: null,
    };

    console.log(`\n✓ Payload del JWT que se generaría:`);
    console.log(JSON.stringify(jwtPayload, null, 2));

    // 4. Simular lo que el JWT Strategy retornaría
    console.log(`\n✓ Lo que el JWT Strategy retornaría:`);
    console.log(`  - user.id: ${user.id}`);
    console.log(`  - user.email: ${user.email}`);
    console.log(`  - user.role: ${user.role_type}`);
    console.log(`  - user.role.permissions: ${permissions.length} permisos`);
    console.log(`  - user.tenantId: ${user.tenantId || 'NULL'}`);

    // 5. Verificar tenants
    const tenantsResult = await pool.query(`
      SELECT id, name, slug, status
      FROM tenants
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`\n✓ Tenants en el sistema (${tenantsResult.rows.length}):`);
    tenantsResult.rows.forEach((tenant, index) => {
      console.log(`  ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
    });

    console.log('\n========================================');
    console.log('  Diagnóstico');
    console.log('========================================\n');

    console.log('El problema puede estar en:');
    console.log('1. El JWT Strategy NO está cargando el rol completo con permisos');
    console.log('2. El PermissionsGuard NO está recibiendo user.role.permissions');
    console.log('3. El payload del JWT solo tiene role.type, no el objeto completo');
    console.log('\nSolución:');
    console.log('- El JWT Strategy debe cargar el usuario con findByEmail()');
    console.log('- findByEmail() debe hacer leftJoinAndSelect("user.role", "role")');
    console.log('- El usuario retornado debe tener user.role.permissions');

    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testSuperAdminLogin();
