const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkSuperAdminPermissions() {
  try {
    console.log('========================================');
    console.log('  Permisos del Super Admin');
    console.log('========================================\n');

    // 1. Verificar todos los roles
    const allRolesResult = await pool.query(`
      SELECT id, type, name, permissions
      FROM roles
      ORDER BY type
    `);

    console.log(`✓ Roles encontrados (${allRolesResult.rows.length}):\n`);
    allRolesResult.rows.forEach((role, index) => {
      console.log(`${index + 1}. ${role.type} - ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Permisos: ${role.permissions.length}`);
    });

    // 2. Buscar el rol del Super Admin (puede ser ADMIN o SUPER_ADMIN)
    const superAdminRole = allRolesResult.rows.find(r => 
      r.type === 'ADMIN' || r.type === 'SUPER_ADMIN' || r.name.toLowerCase().includes('super')
    );

    if (!superAdminRole) {
      console.log('\n❌ No se encontró el rol del Super Admin');
      return;
    }

    console.log(`\n✓ Rol del Super Admin encontrado:`);
    console.log(`  Tipo: ${superAdminRole.type}`);
    console.log(`  Nombre: ${superAdminRole.name}`);
    
    // Los permisos pueden venir como string o array
    let permissions = superAdminRole.permissions;
    if (typeof permissions === 'string') {
      // Si es string, convertir a array (formato PostgreSQL: {perm1,perm2})
      permissions = permissions.replace(/[{}]/g, '').split(',');
    }
    
    console.log(`  Permisos (${permissions.length}):`);
    
    // Mostrar solo los primeros 10 permisos para no saturar la consola
    permissions.slice(0, 10).forEach((perm, index) => {
      console.log(`    ${index + 1}. ${perm}`);
    });
    if (permissions.length > 10) {
      console.log(`    ... y ${permissions.length - 10} más`);
    }

    // 3. Verificar si tiene el permiso VIEW_GLOBAL_STATS
    const hasViewGlobalStats = permissions.includes('view_global_stats');
    console.log(`\n${hasViewGlobalStats ? '✓' : '❌'} Permiso VIEW_GLOBAL_STATS: ${hasViewGlobalStats ? 'SÍ' : 'NO'}`);

    // 4. Verificar usuarios con este rol y tenantId NULL
    const usersResult = await pool.query(`
      SELECT u.id, u.name, u.email, u."tenantId", u."isActive"
      FROM users u
      WHERE u."roleId" = $1 AND u."tenantId" IS NULL
    `, [superAdminRole.id]);

    console.log(`\n✓ Usuarios Super Admin (tenantId NULL) (${usersResult.rows.length}):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Activo: ${user.isActive ? 'SÍ' : 'NO'}`);
    });

    // 5. Verificar tenants existentes
    const tenantsResult = await pool.query(`
      SELECT COUNT(*) as count FROM tenants
    `);
    console.log(`\n✓ Total de tenants en el sistema: ${tenantsResult.rows[0].count}`);

    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

checkSuperAdminPermissions();
