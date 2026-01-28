const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123',
});

async function resetPassword() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // 1. Buscar el tenant
    const tenantResult = await client.query(
      `SELECT id, name, slug FROM tenants WHERE slug = $1`,
      ['demo-medico']
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant "demo-medico" no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('✓ Tenant encontrado:', tenant.name, '\n');

    // 2. Buscar el usuario admin
    const userResult = await client.query(
      `SELECT id, name, email FROM users WHERE "tenantId" = $1 AND email = $2`,
      [tenant.id, 'admin@clinicademo.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin@clinicademo.com no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('✓ Usuario encontrado:', user.name);
    console.log('  Email:', user.email);
    console.log('  ID:', user.id, '\n');

    // 3. Generar nueva contraseña
    const newPassword = 'Demo123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar contraseña
    await client.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, user.id]
    );

    console.log('✅ Contraseña actualizada exitosamente!\n');
    console.log('📝 Credenciales de acceso:');
    console.log('   URL: http://demo-medico.localhost:5173/login');
    console.log('   Email: admin@clinicademo.com');
    console.log('   Contraseña: Demo123!');
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después de iniciar sesión\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

resetPassword();
