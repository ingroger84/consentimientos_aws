const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function addReopenPermissions() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase');

    // 1. Verificar roles actuales y sus permisos
    console.log('\n📋 Roles actuales:');
    const rolesResult = await client.query(`
      SELECT id, name, 
             CASE 
               WHEN permissions LIKE '%reopen_medical_records%' THEN 'SÍ' 
               ELSE 'NO' 
             END as tiene_reopen
      FROM roles 
      ORDER BY name
    `);
    
    rolesResult.rows.forEach(role => {
      console.log(`  - ${role.name}: ${role.tiene_reopen}`);
    });

    // 2. Agregar permiso reopen_medical_records a los roles que no lo tienen
    console.log('\n🔧 Agregando permiso reopen_medical_records...');
    
    // Administrador de Sede
    const adminSedeResult = await client.query(`
      UPDATE roles 
      SET permissions = permissions || ',reopen_medical_records',
          updated_at = NOW()
      WHERE name = 'Administrador de Sede' 
        AND permissions NOT LIKE '%reopen_medical_records%'
      RETURNING name, permissions
    `);
    
    if (adminSedeResult.rowCount > 0) {
      console.log('  ✅ Permiso agregado a: Administrador de Sede');
    } else {
      console.log('  ℹ️  Administrador de Sede ya tiene el permiso');
    }

    // Operador
    const operadorResult = await client.query(`
      UPDATE roles 
      SET permissions = permissions || ',reopen_medical_records',
          updated_at = NOW()
      WHERE name = 'Operador' 
        AND permissions NOT LIKE '%reopen_medical_records%'
      RETURNING name, permissions
    `);
    
    if (operadorResult.rowCount > 0) {
      console.log('  ✅ Permiso agregado a: Operador');
    } else {
      console.log('  ℹ️  Operador ya tiene el permiso');
    }

    // 3. Verificar resultado final
    console.log('\n📊 Estado final:');
    const finalResult = await client.query(`
      SELECT name, 
             CASE 
               WHEN permissions LIKE '%reopen_medical_records%' THEN '✅ SÍ' 
               ELSE '❌ NO' 
             END as tiene_reopen
      FROM roles 
      ORDER BY name
    `);
    
    finalResult.rows.forEach(role => {
      console.log(`  ${role.name}: ${role.tiene_reopen}`);
    });

    console.log('\n✅ Proceso completado');
    console.log('\n⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar para que los cambios surtan efecto');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

addReopenPermissions();
