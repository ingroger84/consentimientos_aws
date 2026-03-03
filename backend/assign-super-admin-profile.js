const { DataSource } = require('typeorm');
require('dotenv').config();

async function assignSuperAdminProfile() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener el perfil de Super Administrador
    const profiles = await dataSource.query(`
      SELECT id, name
      FROM profiles
      WHERE name = 'Super Administrador'
    `);

    if (profiles.length === 0) {
      console.log('❌ Perfil "Super Administrador" no encontrado');
      return;
    }

    const superAdminProfile = profiles[0];
    console.log('📋 Perfil encontrado:', superAdminProfile);
    console.log('');

    // Asignar el perfil al usuario super admin
    await dataSource.query(`
      UPDATE users
      SET profile_id = $1,
          updated_at = NOW()
      WHERE email = 'rcaraballo@innovasystems.com.co'
    `, [superAdminProfile.id]);

    console.log('✅ Perfil asignado exitosamente al usuario rcaraballo@innovasystems.com.co');
    console.log('');

    // Verificar la asignación
    const user = await dataSource.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        p.name as profile_name
      FROM users u
      LEFT JOIN profiles p ON u.profile_id = p.id
      WHERE u.email = 'rcaraballo@innovasystems.com.co'
    `);

    console.log('📋 Usuario actualizado:');
    console.log(JSON.stringify(user, null, 2));

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignSuperAdminProfile();
