const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function checkPermissions() {
  await client.connect();
  
  // Buscar el rol Operador
  const roleResult = await client.query(`
    SELECT id, name FROM roles WHERE name = 'Operador' LIMIT 1
  `);
  
  if (roleResult.rows.length === 0) {
    console.log('Rol Operador no encontrado');
    await client.end();
    return;
  }
  
  const roleId = roleResult.rows[0].id;
  console.log('Rol Operador ID:', roleId);
  
  // Buscar permisos del rol
  const permsResult = await client.query(`
    SELECT p.name, p.description
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = $1
    AND (p.name LIKE '%medical_records%' OR p.name LIKE '%admission%')
    ORDER BY p.name
  `, [roleId]);
  
  console.log('\nPermisos relacionados con HC y admisiones:');
  permsResult.rows.forEach(row => {
    console.log(`- ${row.name}: ${row.description}`);
  });
  
  // Verificar específicamente close_medical_records
  const closePermResult = await client.query(`
    SELECT p.name
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = $1 AND p.name = 'close_medical_records'
  `, [roleId]);
  
  console.log('\n¿Tiene permiso close_medical_records?', closePermResult.rows.length > 0 ? 'SÍ' : 'NO');
  
  await client.end();
}

checkPermissions().catch(console.error);
