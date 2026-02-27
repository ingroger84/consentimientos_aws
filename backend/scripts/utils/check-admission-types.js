const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function checkAdmissionTypes() {
  try {
    await client.connect();
    console.log('✓ Conectado a Supabase');

    // Ver todos los tipos de admisión
    console.log('\n=== Tipos de Admisión en la BD ===');
    const result = await client.query(`
      SELECT 
        id,
        name,
        code,
        description,
        icon,
        color,
        is_active,
        display_order,
        tenant_id,
        created_at
      FROM admission_types
      ORDER BY display_order, name
    `);
    
    console.log(`\nTotal de tipos de admisión: ${result.rows.length}\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.code})`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Activo: ${row.is_active ? 'Sí' : 'No'}`);
      console.log(`   Tenant: ${row.tenant_id || 'Global'}`);
      console.log(`   Icono: ${row.icon || 'N/A'}`);
      console.log(`   Color: ${row.color || 'N/A'}`);
      console.log(`   Orden: ${row.display_order || 'N/A'}`);
      console.log('');
    });

    // Verificar si hay tipos duplicados
    console.log('\n=== Verificar Duplicados ===');
    const duplicates = await client.query(`
      SELECT code, COUNT(*) as count
      FROM admission_types
      GROUP BY code
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length > 0) {
      console.log('⚠️  Tipos de admisión duplicados encontrados:');
      duplicates.rows.forEach(row => {
        console.log(`   ${row.code}: ${row.count} registros`);
      });
    } else {
      console.log('✓ No hay tipos de admisión duplicados');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmissionTypes();
