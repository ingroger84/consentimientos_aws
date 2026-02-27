const { Client } = require('pg');
const fs = require('fs');

// Configuración de base de datos local en AWS
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos_db',
  user: 'postgres',
  password: 'postgres123',
});

async function exportTemplates() {
  try {
    console.log('🔌 Conectando a base de datos...');
    await client.connect();
    
    console.log('📋 Extrayendo plantillas de historias clínicas...');
    const result = await client.query(`
      SELECT * FROM mr_consent_templates 
      ORDER BY id
    `);
    
    console.log(`✅ Encontradas ${result.rows.length} plantillas`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No hay plantillas para exportar');
      return;
    }
    
    // Mostrar plantillas
    console.log('\n📄 Plantillas encontradas:');
    result.rows.forEach(template => {
      console.log(`  - ID: ${template.id}`);
      console.log(`    Nombre: ${template.name}`);
      console.log(`    Tenant: ${template.tenant_id || 'NULL'}`);
      console.log(`    Activa: ${template.is_active}`);
      console.log('');
    });
    
    // Guardar en archivo JSON
    const data = {
      exportDate: new Date().toISOString(),
      count: result.rows.length,
      templates: result.rows
    };
    
    fs.writeFileSync('mr-templates-export.json', JSON.stringify(data, null, 2));
    console.log('💾 Plantillas exportadas a: mr-templates-export.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

exportTemplates()
  .then(() => {
    console.log('\n✅ Exportación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
