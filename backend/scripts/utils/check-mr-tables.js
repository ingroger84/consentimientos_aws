require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas relacionadas con plantillas HC...\n');

    // Buscar todas las tablas que contengan "consent" o "template"
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%consent%' OR table_name LIKE '%template%')
      ORDER BY table_name
    `);

    console.log('📋 Tablas encontradas:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Verificar estructura de mr_consent_templates
    console.log('\n📊 Estructura de mr_consent_templates:');
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'mr_consent_templates'
      ORDER BY ordinal_position
    `);

    columns.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar estructura de medical_record_consent_templates (si existe)
    const { rows: mrctExists } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'medical_record_consent_templates'
      )
    `);

    if (mrctExists[0].exists) {
      console.log('\n📊 Estructura de medical_record_consent_templates:');
      const { rows: mrctColumns } = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'medical_record_consent_templates'
        ORDER BY ordinal_position
      `);

      mrctColumns.forEach(c => {
        console.log(`  - ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n⚠️  La tabla medical_record_consent_templates NO EXISTE');
    }

    // Contar registros
    const { rows: mrCount } = await pool.query('SELECT COUNT(*) FROM mr_consent_templates');
    console.log(`\n📈 Registros en mr_consent_templates: ${mrCount[0].count}`);

    await pool.end();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkTables();
