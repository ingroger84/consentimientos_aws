const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createMRTemplates() {
  try {
    console.log('🔌 Conectando a Supabase...');
    await client.connect();
    
    // Leer el script SQL
    const sqlPath = path.join(__dirname, 'src/migrations/create-medical-record-consent-templates.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('\n📝 Ejecutando script de creación de plantillas HC...');
    await client.query(sql);
    
    console.log('\n✅ Script ejecutado exitosamente');
    
    // Verificar plantillas creadas
    const result = await client.query(`
      SELECT id, name, category, is_active, tenant_id, created_at
      FROM medical_record_consent_templates
      ORDER BY category, name
    `);
    
    console.log(`\n📄 Plantillas creadas: ${result.rows.length}`);
    result.rows.forEach(template => {
      console.log(`\n  ✓ ${template.name}`);
      console.log(`    Categoría: ${template.category}`);
      console.log(`    Tenant: ${template.tenant_id || 'Global'}`);
      console.log(`    Activa: ${template.is_active}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createMRTemplates()
  .then(() => {
    console.log('\n🎉 Plantillas de HC creadas exitosamente en Supabase');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  });
