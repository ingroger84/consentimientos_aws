const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  const client = await pool.connect();

  try {
    console.log('🔧 Creando tabla mr_consent_templates...\n');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS mr_consent_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabla mr_consent_templates creada');

    // Crear índices
    console.log('\n🔧 Creando índices...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_tenant 
      ON mr_consent_templates(tenant_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_active 
      ON mr_consent_templates(is_active);
    `);
    
    console.log('✅ Índices creados');

    // Verificar
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'mr_consent_templates'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura de la tabla:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTable()
  .then(() => {
    console.log('\n✅ Tabla creada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
