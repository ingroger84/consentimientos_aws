const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

// Lista completa de permisos para el rol Operador (incluyendo edit_medical_records)
const operadorPermissions = [
  'view_dashboard',
  'view_consents',
  'create_consents',
  'sign_consents',
  'resend_consent_email',
  'view_users',
  'view_branches',
  'view_services',
  'view_questions',
  'view_clients',
  'create_clients',
  'edit_clients',
  'view_templates',
  'view_mr_consent_templates',
  'view_mr_consents',
  'view_medical_records',
  'create_medical_records',
  'edit_medical_records',  // ✅ AGREGADO
  'sign_medical_records',
  'export_medical_records',
  'preview_medical_records',
  'send_email_medical_records',
  'close_medical_records',
  'archive_medical_records',
  'view_medical_orders',
  'create_medical_orders',
  'view_prescriptions',
  'create_prescriptions',
  'view_procedures',
  'create_procedures',
  'view_treatment_plans',
  'create_treatment_plans',
  'view_epicrisis',
  'create_epicrisis',
  'view_mr_documents',
  'upload_mr_documents',
  'download_mr_documents',
  'view_invoices',
  'pay_invoices'
];

async function fixPermissions() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener el rol Operador actual
    const roleResult = await client.query(`
      SELECT id, name, type, permissions
      FROM roles 
      WHERE type = 'OPERADOR'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol OPERADOR');
      return;
    }

    const role = roleResult.rows[0];
    console.log('📋 ROL OPERADOR ACTUAL:');
    console.log('ID:', role.id);
    console.log('Name:', role.name);
    console.log('Permissions (primeros 200 chars):', role.permissions.substring(0, 200));
    console.log('Permissions Length:', role.permissions.length);

    // Convertir el array de permisos a string separado por comas
    const permissionsString = operadorPermissions.join(',');

    console.log('\n📝 NUEVOS PERMISOS:');
    console.log('Total permisos:', operadorPermissions.length);
    console.log('String length:', permissionsString.length);
    console.log('Primeros 5:', operadorPermissions.slice(0, 5));
    console.log('Últimos 5:', operadorPermissions.slice(-5));
    console.log('¿Contiene edit_medical_records?', operadorPermissions.includes('edit_medical_records'));

    // Actualizar los permisos
    await client.query(`
      UPDATE roles 
      SET permissions = $1,
          updated_at = NOW()
      WHERE type = 'OPERADOR'
    `, [permissionsString]);

    console.log('\n✅ Permisos actualizados correctamente');

    // Verificar la actualización
    const verifyResult = await client.query(`
      SELECT id, name, type, permissions
      FROM roles 
      WHERE type = 'OPERADOR'
    `);

    const updatedRole = verifyResult.rows[0];
    console.log('\n🔍 VERIFICACIÓN:');
    console.log('Permissions (primeros 200 chars):', updatedRole.permissions.substring(0, 200));
    console.log('Permissions (últimos 100 chars):', updatedRole.permissions.substring(updatedRole.permissions.length - 100));
    console.log('Permissions Length:', updatedRole.permissions.length);

    // Parsear como CSV para verificar
    const parsedPermissions = updatedRole.permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
    console.log('Total permisos parseados:', parsedPermissions.length);
    console.log('¿Contiene edit_medical_records?', parsedPermissions.includes('edit_medical_records'));

    console.log('\n✅ CORRECCIÓN COMPLETADA');
    console.log('⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar sesión para obtener los nuevos permisos');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixPermissions();
