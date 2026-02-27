const { Client } = require('pg');

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    await client.connect();
    console.log('✓ Conectado a Supabase');

    const tables = [
      'medical_record_consents',
      'anamnesis',
      'physical_exams',
      'diagnoses',
      'evolutions',
      'medical_orders',
      'prescriptions',
      'procedures',
      'treatment_plans',
      'epicrisis',
      'medical_record_documents',
      'admissions'
    ];

    for (const table of tables) {
      console.log(`\n=== ${table} ===`);
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name LIKE '%medical%record%'
        ORDER BY ordinal_position
      `, [table]);
      
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          console.log(`  ${row.column_name} (${row.data_type})`);
        });
      } else {
        console.log('  No columns with "medical" and "record" found');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();
