require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkTemplates() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando plantillas de HC en Supabase...\n');
    
    const result = await client.query(`
      SELECT id, name, description, tenant_id, is_active, created_at
      FROM mr_consent_templates 
      ORDER BY id
    `);
    
    console.log(`📊 Total de plantillas: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No hay plantillas de HC en Supabase');
      console.log('\n💡 Necesitas crear plantillas iniciales');
    } else {
      console.log('📄 Plantillas encontradas:');
      result.rows.forEach(template => {
        console.log(`\n  ID: ${template.id}`);
        console.log(`  Nombre: ${template.name}`);
        console.log(`  Descripción: ${template.description || 'N/A'}`);
        console.log(`  Tenant: ${template.tenant_id || 'Global'}`);
        console.log(`  Activo: ${template.is_active ? 'Sí' : 'No'}`);
        console.log(`  Creado: ${template.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkTemplates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
