const { Pool } = require('pg');

// Configuración de AWS (base de datos local en el servidor)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos_db',
  user: 'postgres',
  password: 'Innova2024!',
  ssl: false
});

async function exportTemplates() {
  const client = await pool.connect();

  try {
    console.log('🔍 Consultando plantillas de HC en AWS...');
    
    const result = await client.query(`
      SELECT * FROM mr_consent_templates 
      ORDER BY id
    `);
    
    console.log(`✅ Encontradas ${result.rows.length} plantillas`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No hay plantillas para exportar');
      return;
    }

    // Exportar como JSON
    console.log('\n📄 Plantillas encontradas:');
    result.rows.forEach(template => {
      console.log(`  - ID: ${template.id}, Nombre: ${template.name}, Tenant: ${template.tenant_id || 'Global'}`);
    });

    // Guardar en archivo JSON
    const fs = require('fs');
    const filename = 'mr-templates-export.json';
    fs.writeFileSync(filename, JSON.stringify(result.rows, null, 2));
    console.log(`\n✅ Plantillas exportadas a ${filename}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

exportTemplates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
