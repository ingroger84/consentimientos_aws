const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Conectado a Supabase');

    // Listar todas las tablas del esquema public
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\nTablas en el esquema public:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    await client.end();

  } catch (error) {
    console.error('Error:', error);
    await client.end();
  }
}

checkTables();
