const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'datagree_admin',
  password: 'DataGree2026!Secure',
  database: 'consentimientos'
});

async function diagnose() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // 1. Ver todos los record_number que empiezan con HC-2026
    console.log('=== HISTORIAS CLÍNICAS 2026 ===');
    const result1 = await client.query(`
      SELECT 
        id,
        tenant_id,
        record_number,
        created_at,
        (SELECT name FROM tenants WHERE id = medical_records.tenant_id) as tenant_name
      FROM medical_records 
      WHERE record_number LIKE 'HC-2026-%' 
      ORDER BY record_number
    `);
    
    console.log(`Total de HC 2026: ${result1.rows.length}\n`);
    result1.rows.forEach(row => {
      console.log(`${row.record_number} | Tenant: ${row.tenant_name || 'N/A'} | ${row.created_at}`);
    });

    // 2. Ver duplicados
    console.log('\n=== NÚMEROS DUPLICADOS ===');
    const result2 = await client.query(`
      SELECT 
        record_number,
        COUNT(*) as count,
        array_agg(tenant_id::text) as tenant_ids
      FROM medical_records 
      WHERE record_number LIKE 'HC-2026-%'
      GROUP BY record_number
      HAVING COUNT(*) > 1
    `);
    
    if (result2.rows.length > 0) {
      console.log(`⚠️ Encontrados ${result2.rows.length} números duplicados:`);
      result2.rows.forEach(row => {
        console.log(`${row.record_number}: ${row.count} veces en tenants: ${row.tenant_ids.join(', ')}`);
      });
    } else {
      console.log('✅ No hay números duplicados');
    }

    // 3. Ver el constraint
    console.log('\n=== CONSTRAINT ÚNICO ===');
    const result3 = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname = 'UQ_1dc1a9b704ff46bcaf4bf512039'
    `);
    
    if (result3.rows.length > 0) {
      console.log('Constraint encontrado:');
      result3.rows.forEach(row => {
        console.log(`Nombre: ${row.constraint_name}`);
        console.log(`Tipo: ${row.constraint_type}`);
        console.log(`Definición: ${row.definition}`);
      });
    }

    // 4. Ver el último número por tenant
    console.log('\n=== ÚLTIMO NÚMERO POR TENANT ===');
    const result4 = await client.query(`
      SELECT 
        t.name as tenant_name,
        t.id as tenant_id,
        MAX(mr.record_number) as last_record_number,
        COUNT(mr.id) as total_records
      FROM tenants t
      LEFT JOIN medical_records mr ON mr.tenant_id = t.id AND mr.record_number LIKE 'HC-2026-%'
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    
    result4.rows.forEach(row => {
      console.log(`${row.tenant_name}: ${row.last_record_number || 'Sin HC'} (Total: ${row.total_records})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

diagnose();
