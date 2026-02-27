const { Client } = require('pg');

async function checkQuestionsStructure() {
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

    // 1. Estructura de la tabla
    console.log('🔍 Estructura de la tabla questions:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position;
    `);
    console.table(columns.rows);

    // 2. Contar preguntas
    const count = await client.query('SELECT COUNT(*) as total FROM questions');
    console.log('\n📊 Total de preguntas:', count.rows[0].total);

    // 3. Verificar si hay datos en la tabla
    if (count.rows[0].total === '0') {
      console.log('\n⚠️  No hay preguntas en la base de datos');
      console.log('Necesitamos poblar la tabla con preguntas por defecto');
    }

    // 4. Verificar servicios disponibles
    console.log('\n📋 Servicios disponibles:');
    const services = await client.query(`
      SELECT 
        s.id,
        s.name,
        t.name as tenant_name,
        t.slug as tenant_slug
      FROM services s
      JOIN tenants t ON s."tenantId" = t.id
      ORDER BY t.name, s.name;
    `);
    console.table(services.rows);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkQuestionsStructure();
