const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  database: 'archivoenlinea',
  ssl: {
    rejectUnauthorized: false
  }
});

// Permisos correctos para el rol Operador
const OPERADOR_PERMISSIONS = [
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents',
  'resend_consent_email',
  'view_services',
  'view_branches',
  'view_clients',
  'create_clients',
  'view_medical_records',
  'create_medical_records',
  'sign_medical_records',
  'preview_medical_records',
  'send_email_medical_records',
];

async function fixOperadorPermissions() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Buscar todos los roles "Operador"
    console.log('=== BUSCANDO ROLES "OPERADOR" ===');
    const rolesResult = await client.query(`
      SELECT id, name, permissions
      FROM roles
      WHERE name ILIKE '%operador%'
    `);
    
    console.log(`Encontrados ${rolesResult.rows.length} roles:\n`);

    // 2. Actualizar cada rol
    for (const role of rolesResult.rows) {
      console.log(`\nActualizando rol: ${role.name} (ID: ${role.id})`);
      console.log(`Permisos actuales (corruptos):`, role.permissions);
      
      // Actualizar con los permisos correctos
      await client.query(`
        UPDATE roles
        SET permissions = $1
        WHERE id = $2
      `, [JSON.stringify(OPERADOR_PERMISSIONS), role.id]);
      
      console.log(`✅ Permisos actualizados correctamente`);
      console.log(`Nuevos permisos:`, OPERADOR_PERMISSIONS);
    }

    // 3. Verificar que se actualizaron correctamente
    console.log('\n\n=== VERIFICANDO ACTUALIZACIÓN ===');
    const verifyResult = await client.query(`
      SELECT id, name, permissions
      FROM roles
      WHERE name ILIKE '%operador%'
    `);
    
    verifyResult.rows.forEach(role => {
      console.log(`\nRol: ${role.name} (ID: ${role.id})`);
      console.log(`Permisos:`, role.permissions);
      
      // Verificar si tiene el permiso create_medical_records
      if (role.permissions && Array.isArray(role.permissions)) {
        const hasPermission = role.permissions.includes('create_medical_records');
        console.log(`¿Tiene permiso create_medical_records?: ${hasPermission ? '✅ SÍ' : '❌ NO'}`);
      }
    });

    console.log('\n\n✅ CORRECCIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

fixOperadorPermissions();
