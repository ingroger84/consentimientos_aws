require('dotenv').config();
const { Client } = require('pg');

async function checkSuperAdmin() {
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

    // 1. Verificar rol Super Administrador
    console.log('📋 ROL SUPER ADMINISTRADOR:');
    console.log('='.repeat(80));
    const roleResult = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE name = 'Super Administrador' OR type = 'super_admin'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol Super Administrador\n');
      return;
    }

    const role = roleResult.rows[0];
    console.log(`Rol: ${role.name}`);
    console.log(`ID: ${role.id}`);
    console.log(`Tipo: ${role.type}`);
    
    const permissions = role.permissions ? role.permissions.split(',') : [];
    const hasViewGlobalStats = permissions.includes('view_global_stats');
    console.log(`\n${hasViewGlobalStats ? '✅' : '❌'} Tiene permiso VIEW_GLOBAL_STATS: ${hasViewGlobalStats}`);
    console.log(`Total permisos: ${permissions.length}`);

    // 2. Verificar usuarios con ese rol
    console.log('\n\n👤 USUARIOS SUPER ADMIN:');
    console.log('='.repeat(80));
    const usersResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u."roleId",
        r.name as role_name,
        r.type as role_type
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE r.type = 'super_admin' OR r.name = 'Super Administrador'
      ORDER BY u.email
    `);

    if (usersResult.rows.length === 0) {
      console.log('❌ No se encontraron usuarios Super Admin\n');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`\nUsuario: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Role ID: ${user.roleId}`);
        console.log(`Rol: ${user.role_name} (${user.role_type})`);
        console.log('-'.repeat(80));
      });
    }

    // 3. Contar historias clínicas
    console.log('\n\n📊 HISTORIAS CLÍNICAS:');
    console.log('='.repeat(80));
    const hcResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activas,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as cerradas,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archivadas
      FROM medical_records
    `);

    const stats = hcResult.rows[0];
    console.log(`Total: ${stats.total}`);
    console.log(`Activas: ${stats.activas}`);
    console.log(`Cerradas: ${stats.cerradas}`);
    console.log(`Archivadas: ${stats.archivadas}`);

    // 4. HC por tenant
    console.log('\n\n📊 HC POR TENANT:');
    console.log('='.repeat(80));
    const byTenantResult = await client.query(`
      SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        COUNT(mr.id) as total_hc
      FROM tenants t
      LEFT JOIN medical_records mr ON mr."tenantId" = t.id
      GROUP BY t.id, t.name, t.slug
      HAVING COUNT(mr.id) > 0
      ORDER BY total_hc DESC
    `);

    byTenantResult.rows.forEach(row => {
      console.log(`${row.tenant_name} (${row.tenant_slug}): ${row.total_hc} HC`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkSuperAdmin();
