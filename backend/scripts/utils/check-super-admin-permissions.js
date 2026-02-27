require('dotenv').config();
const { Client } = require('pg');

async function checkSuperAdminPermissions() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Verificar roles de Super Admin
    console.log('📋 ROLES DE SUPER ADMIN:');
    console.log('='.repeat(80));
    const rolesResult = await client.query(`
      SELECT 
        id,
        name,
        permissions,
        "tenantId"
      FROM roles
      WHERE name ILIKE '%super%admin%' OR name = 'Super Administrador'
      ORDER BY name
    `);

    if (rolesResult.rows.length === 0) {
      console.log('❌ No se encontraron roles de Super Admin\n');
    } else {
      rolesResult.rows.forEach(role => {
        console.log(`\nRol: ${role.name}`);
        console.log(`ID: ${role.id}`);
        console.log(`Tenant ID: ${role.tenantId || 'NULL (Super Admin global)'}`);
        console.log(`\nPermisos:`);
        
        const permissions = role.permissions ? role.permissions.split(',') : [];
        permissions.forEach(perm => {
          console.log(`  - ${perm}`);
        });
        
        // Verificar si tiene VIEW_GLOBAL_STATS
        const hasViewGlobalStats = permissions.includes('view_global_stats');
        console.log(`\n${hasViewGlobalStats ? '✅' : '❌'} Tiene permiso VIEW_GLOBAL_STATS: ${hasViewGlobalStats}`);
        console.log('-'.repeat(80));
      });
    }

    // 2. Verificar usuarios Super Admin
    console.log('\n\n👤 USUARIOS SUPER ADMIN:');
    console.log('='.repeat(80));
    const usersResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u."tenantId",
        r.name as role_name,
        r.permissions
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE r.name ILIKE '%super%admin%' OR r.name = 'Super Administrador'
      ORDER BY u.email
    `);

    if (usersResult.rows.length === 0) {
      console.log('❌ No se encontraron usuarios Super Admin\n');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`\nUsuario: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Tenant ID: ${user.tenantId || 'NULL (Super Admin global)'}`);
        console.log(`Rol: ${user.role_name}`);
        
        const permissions = user.permissions ? user.permissions.split(',') : [];
        const hasViewGlobalStats = permissions.includes('view_global_stats');
        console.log(`${hasViewGlobalStats ? '✅' : '❌'} Tiene permiso VIEW_GLOBAL_STATS: ${hasViewGlobalStats}`);
        console.log('-'.repeat(80));
      });
    }

    // 3. Contar historias clínicas por tenant
    console.log('\n\n📊 HISTORIAS CLÍNICAS POR TENANT:');
    console.log('='.repeat(80));
    const hcResult = await client.query(`
      SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        COUNT(mr.id) as total_hc,
        COUNT(CASE WHEN mr.status = 'active' THEN 1 END) as activas,
        COUNT(CASE WHEN mr.status = 'closed' THEN 1 END) as cerradas,
        COUNT(CASE WHEN mr.status = 'archived' THEN 1 END) as archivadas
      FROM tenants t
      LEFT JOIN medical_records mr ON mr."tenantId" = t.id
      GROUP BY t.id, t.name, t.slug
      ORDER BY total_hc DESC
    `);

    if (hcResult.rows.length === 0) {
      console.log('❌ No se encontraron tenants\n');
    } else {
      console.log('\n');
      hcResult.rows.forEach(row => {
        console.log(`Tenant: ${row.tenant_name} (${row.tenant_slug})`);
        console.log(`  Total HC: ${row.total_hc}`);
        console.log(`  Activas: ${row.activas}`);
        console.log(`  Cerradas: ${row.cerradas}`);
        console.log(`  Archivadas: ${row.archivadas}`);
        console.log('-'.repeat(80));
      });
    }

    // 4. Total general
    const totalResult = await client.query(`
      SELECT COUNT(*) as total FROM medical_records
    `);
    console.log(`\n📈 TOTAL GENERAL DE HISTORIAS CLÍNICAS: ${totalResult.rows[0].total}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkSuperAdminPermissions()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });
