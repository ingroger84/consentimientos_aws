const { Client } = require('pg');

async function consolidateMRTemplates() {
  const client = new Client({
    host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // 1. Verificar estructura de ambas tablas
    console.log('📋 Verificando estructura de mr_consent_templates:');
    const cols1 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'mr_consent_templates'
      ORDER BY ordinal_position;
    `);
    console.table(cols1.rows);

    console.log('\n📋 Verificando estructura de medical_record_consent_templates:');
    const cols2 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'medical_record_consent_templates'
      ORDER BY ordinal_position;
    `);
    console.table(cols2.rows);

    // 2. Ver datos de mr_consent_templates
    console.log('\n📄 Datos en mr_consent_templates:');
    const data1 = await client.query('SELECT id, name, tenant_id FROM mr_consent_templates LIMIT 5;');
    console.table(data1.rows);

    // 3. Ver datos de medical_record_consent_templates
    console.log('\n📄 Datos en medical_record_consent_templates:');
    const data2 = await client.query('SELECT id, name, tenant_id FROM medical_record_consent_templates LIMIT 5;');
    console.table(data2.rows);

    // 4. Decisión: La tabla correcta es medical_record_consent_templates (con UUID)
    // Vamos a eliminar mr_consent_templates y asegurarnos que medical_record_consent_templates tenga todas las columnas

    console.log('\n🔄 Agregando columnas faltantes a medical_record_consent_templates...');
    
    const columnsToAdd = [
      { name: 'category', type: 'VARCHAR(100)', nullable: true },
      { name: 'available_variables', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'is_default', type: 'BOOLEAN', default: 'false' },
      { name: 'requires_signature', type: 'BOOLEAN', default: 'true' },
      { name: 'created_by', type: 'UUID', nullable: true },
      { name: 'deleted_at', type: 'TIMESTAMP', nullable: true }
    ];

    for (const col of columnsToAdd) {
      try {
        let sql = `ALTER TABLE medical_record_consent_templates ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) {
          sql += ` DEFAULT ${col.default}`;
        }
        if (col.nullable) {
          sql += ` NULL`;
        }
        
        await client.query(sql);
        console.log(`  ✅ Columna ${col.name} agregada`);
      } catch (error) {
        if (error.code === '42701') { // column already exists
          console.log(`  ⏭️  Columna ${col.name} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // 5. Actualizar categorías
    console.log('\n📝 Actualizando categorías...');
    await client.query(`
      UPDATE medical_record_consent_templates 
      SET category = 'general' 
      WHERE name LIKE '%Consentimiento Informado General%' OR name LIKE '%Autorización Tratamiento Datos%';
    `);
    await client.query(`
      UPDATE medical_record_consent_templates 
      SET category = 'procedure' 
      WHERE name LIKE '%Fotografías Clínicas%';
    `);
    console.log('✅ Categorías actualizadas');

    // 6. Eliminar tabla vieja
    console.log('\n🗑️  Eliminando tabla mr_consent_templates...');
    await client.query('DROP TABLE IF EXISTS mr_consent_templates CASCADE;');
    console.log('✅ Tabla eliminada');

    // 7. Verificar resultado final
    console.log('\n📊 Resultado final:');
    const finalCount = await client.query(`
      SELECT 
        t.name as tenant_name,
        COUNT(mct.id) as template_count
      FROM tenants t
      LEFT JOIN medical_record_consent_templates mct ON mct.tenant_id = t.id
      GROUP BY t.id, t.name
      ORDER BY t.name;
    `);
    console.table(finalCount.rows);

    const sampleTemplates = await client.query(`
      SELECT 
        id,
        name,
        category,
        is_active,
        is_default,
        requires_signature,
        tenant_id
      FROM medical_record_consent_templates
      LIMIT 5;
    `);
    console.log('\n📄 Plantillas de ejemplo:');
    console.table(sampleTemplates.rows);

    console.log('\n✅ Consolidación completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

consolidateMRTemplates();
