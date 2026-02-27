const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function checkPermissions() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener el rol Operador con sus permisos RAW
    const roleResult = await client.query(`
      SELECT 
        id,
        name,
        type,
        permissions,
        pg_typeof(permissions) as permissions_type,
        length(permissions) as permissions_length,
        octet_length(permissions) as permissions_bytes
      FROM roles 
      WHERE type = 'OPERADOR'
    `);

    if (roleResult.rows.length === 0) {
      console.log('❌ No se encontró el rol OPERADOR');
      return;
    }

    const role = roleResult.rows[0];
    console.log('📋 ROL OPERADOR - DATOS RAW:');
    console.log('ID:', role.id);
    console.log('Name:', role.name);
    console.log('Type:', role.type);
    console.log('Permissions Type:', role.permissions_type);
    console.log('Permissions Length:', role.permissions_length);
    console.log('Permissions Bytes:', role.permissions_bytes);
    console.log('\n📝 PERMISSIONS RAW (primeros 500 caracteres):');
    console.log(role.permissions.substring(0, 500));
    console.log('\n📝 PERMISSIONS RAW (últimos 200 caracteres):');
    console.log(role.permissions.substring(role.permissions.length - 200));

    // Intentar parsear como JSON
    console.log('\n🔍 INTENTANDO PARSEAR COMO JSON:');
    try {
      const parsed = JSON.parse(role.permissions);
      console.log('✅ Es JSON válido');
      console.log('Tipo:', Array.isArray(parsed) ? 'Array' : typeof parsed);
      console.log('Longitud:', Array.isArray(parsed) ? parsed.length : 'N/A');
      if (Array.isArray(parsed)) {
        console.log('Primeros 5 elementos:', parsed.slice(0, 5));
        console.log('Últimos 5 elementos:', parsed.slice(-5));
        console.log('¿Contiene edit_medical_records?', parsed.includes('edit_medical_records'));
      }
    } catch (e) {
      console.log('❌ NO es JSON válido');
      console.log('Error:', e.message);
      
      // Intentar parsear como CSV
      console.log('\n🔍 INTENTANDO PARSEAR COMO CSV:');
      const csvArray = role.permissions.split(',').map(p => p.trim()).filter(p => p.length > 0);
      console.log('Longitud:', csvArray.length);
      console.log('Primeros 5 elementos:', csvArray.slice(0, 5));
      console.log('Últimos 5 elementos:', csvArray.slice(-5));
      console.log('¿Contiene edit_medical_records?', csvArray.includes('edit_medical_records'));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPermissions();
