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

async function migrateTables() {
  try {
    console.log('🔄 Migrando plantillas de mr_consent_templates a medical_record_consent_templates...\n');

    // Verificar registros en medical_record_consent_templates
    const { rows: existingCount } = await pool.query(
      'SELECT COUNT(*) FROM medical_record_consent_templates'
    );
    console.log(`📊 Registros actuales en medical_record_consent_templates: ${existingCount[0].count}`);

    // Obtener plantillas de mr_consent_templates
    const { rows: templates } = await pool.query(`
      SELECT * FROM mr_consent_templates ORDER BY id
    `);
    console.log(`📋 Plantillas encontradas en mr_consent_templates: ${templates.length}\n`);

    if (templates.length === 0) {
      console.log('⚠️  No hay plantillas para migrar');
      await pool.end();
      return;
    }

    // Migrar cada plantilla
    let migrated = 0;
    for (const template of templates) {
      try {
        // Convertir content de JSONB a TEXT si es necesario
        let contentText = template.content;
        if (typeof template.content === 'object') {
          contentText = JSON.stringify(template.content);
        }

        // Insertar en medical_record_consent_templates
        await pool.query(`
          INSERT INTO medical_record_consent_templates (
            name, description, category, content, available_variables,
            is_active, is_default, requires_signature, tenant_id,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT DO NOTHING
        `, [
          template.name,
          template.description || 'Plantilla de consentimiento para historias clínicas',
          'general', // categoría por defecto
          contentText,
          JSON.stringify([]), // available_variables vacío por ahora
          template.is_active !== false, // default true
          false, // is_default
          true, // requires_signature
          template.tenant_id,
          template.created_at || new Date(),
          template.updated_at || new Date()
        ]);

        migrated++;
        console.log(`✅ Migrada: ${template.name} (Tenant: ${template.tenant_id || 'Global'})`);
      } catch (error) {
        console.error(`❌ Error migrando plantilla ${template.id}:`, error.message);
      }
    }

    // Verificar resultado
    const { rows: finalCount } = await pool.query(
      'SELECT COUNT(*) FROM medical_record_consent_templates'
    );
    console.log(`\n📊 Total de registros en medical_record_consent_templates: ${finalCount[0].count}`);
    console.log(`✅ Plantillas migradas exitosamente: ${migrated}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateTables();
