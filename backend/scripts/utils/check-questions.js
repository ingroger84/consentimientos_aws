const { Client } = require('pg');

async function checkQuestions() {
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

    // 1. Verificar tabla questions
    console.log('📋 Verificando tabla questions...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'questions'
      );
    `);
    console.log('Tabla existe:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla questions NO existe');
      return;
    }

    // 2. Contar preguntas totales
    const totalCount = await client.query('SELECT COUNT(*) as total FROM questions');
    console.log('\n📊 Total de preguntas:', totalCount.rows[0].total);

    // 3. Preguntas por tenant
    console.log('\n📊 Preguntas por tenant:');
    const byTenant = await client.query(`
      SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        COUNT(q.id) as question_count
      FROM tenants t
      LEFT JOIN questions q ON q.tenant_id = t.id
      GROUP BY t.id, t.name, t.slug
      ORDER BY t.name;
    `);
    console.table(byTenant.rows);

    // 4. Preguntas por servicio
    console.log('\n📊 Preguntas por servicio:');
    const byService = await client.query(`
      SELECT 
        s.name as service_name,
        t.name as tenant_name,
        COUNT(q.id) as question_count
      FROM services s
      LEFT JOIN questions q ON q.service_id = s.id
      LEFT JOIN tenants t ON s.tenant_id = t.id
      GROUP BY s.id, s.name, t.name
      ORDER BY t.name, s.name;
    `);
    console.table(byService.rows);

    // 5. Algunas preguntas de ejemplo
    console.log('\n📄 Primeras 5 preguntas:');
    const samples = await client.query(`
      SELECT 
        q.id,
        q.text,
        s.name as service_name,
        t.name as tenant_name
      FROM questions q
      LEFT JOIN services s ON q.service_id = s.id
      LEFT JOIN tenants t ON q.tenant_id = t.id
      LIMIT 5;
    `);
    console.table(samples.rows);

    // 6. Verificar estructura de la tabla
    console.log('\n🔍 Estructura de la tabla questions:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position;
    `);
    console.table(columns.rows);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkQuestions();
