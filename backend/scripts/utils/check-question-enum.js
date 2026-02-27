const { Client } = require('pg');

async function checkQuestionEnum() {
  const client = new Client({
    host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // Verificar valores del enum
    console.log('🔍 Valores del enum questions_type_enum:');
    const enumValues = await client.query(`
      SELECT unnest(enum_range(NULL::questions_type_enum)) as enum_value;
    `);
    console.table(enumValues.rows);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkQuestionEnum();
