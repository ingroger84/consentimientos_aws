const { Pool } = require('pg');

// Configuración de Supabase
const pool = new Pool({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  ssl: { rejectUnauthorized: false }
});

async function checkAndSeedTemplates() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando plantillas de HC en Supabase...\n');
    
    const result = await client.query(`
      SELECT id, name, description, tenant_id, is_active
      FROM mr_consent_templates 
      ORDER BY id
    `);
    
    console.log(`📊 Total de plantillas: ${result.rows.length}\n`);
    
    if (result.rows.length > 0) {
      console.log('✅ Plantillas encontradas:');
      result.rows.forEach(template => {
        console.log(`  - ID: ${template.id}, Nombre: ${template.name}, Tenant: ${template.tenant_id || 'Global'}`);
      });
      return;
    }

    console.log('⚠️  No hay plantillas. Creando plantillas iniciales...\n');

    // Obtener tenants
    const tenants = await client.query('SELECT id, name FROM tenants ORDER BY id');
    console.log(`📋 Tenants encontrados: ${tenants.rows.length}`);
    tenants.rows.forEach(t => console.log(`  - ${t.id}: ${t.name}`));

    // Plantillas base según normativa colombiana
    const templates = [
      {
        name: 'Consentimiento Informado General',
        description: 'Consentimiento informado general para procedimientos estéticos',
        content: JSON.stringify({
          sections: [
            {
              title: 'Identificación del Paciente',
              fields: ['nombre_completo', 'documento', 'fecha_nacimiento', 'telefono', 'email']
            },
            {
              title: 'Procedimiento a Realizar',
              fields: ['nombre_procedimiento', 'descripcion', 'riesgos', 'beneficios']
            },
            {
              title: 'Consentimiento',
              fields: ['acepta_procedimiento', 'firma_paciente', 'fecha']
            }
          ]
        })
      },
      {
        name: 'Autorización Tratamiento Datos Personales',
        description: 'Autorización para tratamiento de datos personales según Ley 1581 de 2012',
        content: JSON.stringify({
          sections: [
            {
              title: 'Datos del Titular',
              fields: ['nombre_completo', 'documento', 'email', 'telefono']
            },
            {
              title: 'Autorización',
              fields: ['autoriza_tratamiento', 'finalidad', 'firma', 'fecha']
            }
          ]
        })
      },
      {
        name: 'Consentimiento Fotografías Clínicas',
        description: 'Autorización para toma y uso de fotografías clínicas',
        content: JSON.stringify({
          sections: [
            {
              title: 'Autorización Fotográfica',
              fields: ['autoriza_fotos', 'uso_academico', 'uso_publicitario', 'firma', 'fecha']
            }
          ]
        })
      }
    ];

    let created = 0;

    // Crear plantillas para cada tenant
    for (const tenant of tenants.rows) {
      console.log(`\n📝 Creando plantillas para tenant: ${tenant.name}`);
      
      for (const template of templates) {
        try {
          await client.query(`
            INSERT INTO mr_consent_templates (name, description, content, is_active, tenant_id)
            VALUES ($1, $2, $3, $4, $5)
          `, [template.name, template.description, template.content, true, tenant.id]);
          
          console.log(`  ✅ ${template.name}`);
          created++;
        } catch (error) {
          console.error(`  ❌ Error creando ${template.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Plantillas creadas: ${created}`);

    // Verificar resultado
    const finalCount = await client.query('SELECT COUNT(*) as count FROM mr_consent_templates');
    console.log(`📊 Total final de plantillas: ${finalCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndSeedTemplates()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
