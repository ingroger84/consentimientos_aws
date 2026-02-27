const { Client } = require('pg');

async function checkConsentsStructure() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'consentimientos',
    user: 'admin',
    password: 'admin123',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar estructura de la tabla consents
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'consents'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Estructura de la tabla consents:');
    result.rows.forEach((row) => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   ${row.column_name}: ${row.data_type}${length} ${nullable}`);
    });

    // Verificar si existe client_id
    const clientIdCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'consents' AND column_name = 'client_id';
    `);

    if (clientIdCheck.rows.length > 0) {
      console.log(`\n⚠️  client_id existe con tipo: ${clientIdCheck.rows[0].data_type}`);
    } else {
      console.log('\n✅ client_id NO existe (se puede crear como UUID)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkConsentsStructure();
