const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function testLogin() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // 1. Buscar el tenant
    const tenantResult = await client.query(
      `SELECT id, name, slug, status FROM tenants WHERE slug = $1`,
      ['demo-medico']
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant "demo-medico" no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('✓ Tenant encontrado:');
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Nombre: ${tenant.name}`);
    console.log(`  Slug: ${tenant.slug}`);
    console.log(`  Status: ${tenant.status}\n`);

    // 2. Buscar usuarios del tenant
    const usersResult = await client.query(
      `SELECT u.id, u.name, u.email, u.password, r.name as role_name, r.type as role_type
       FROM users u
       LEFT JOIN roles r ON u."roleId" = r.id
       WHERE u."tenantId" = $1
       ORDER BY u.name`,
      [tenant.id]
    );

    console.log(`✓ Usuarios del tenant (${usersResult.rows.length}):\n`);

    for (const user of usersResult.rows) {
      console.log(`${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Rol: ${user.role_name} (${user.role_type})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Password Hash: ${user.password.substring(0, 30)}...`);
      
      // Probar contraseñas comunes
      const commonPasswords = [
        'admin123',
        'password',
        'demo123',
        'clinica123',
        '123456',
        'Admin123',
        'Demo123',
      ];

      console.log(`  Probando contraseñas comunes:`);
      for (const pwd of commonPasswords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`    ✓ CONTRASEÑA ENCONTRADA: "${pwd}"`);
        }
      }
      console.log('');
    }

    // 3. Instrucciones
    console.log('\n📝 Para iniciar sesión:');
    console.log('   URL: http://demo-medico.localhost:5173/login');
    console.log('   Email: admin@clinicademo.com (o cualquier otro email de arriba)');
    console.log('   Contraseña: Usa la contraseña que encontramos arriba\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testLogin();
