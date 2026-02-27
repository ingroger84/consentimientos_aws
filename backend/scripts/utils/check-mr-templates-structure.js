const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'consentimientos',
  user: 'admin',
  password: 'admin123'
});

async function checkStructure() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos');

    // Verificar si la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'medical_record_consent_templates'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla medical_record_consent_templates NO existe');
      console.log('\n📝 Creando tabla...');
      
      // Crear la tabla
      await client.query(`
        CREATE TABLE medical_record_consent_templates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          content TEXT NOT NULL,
          available_variables JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          is_default BOOLEAN DEFAULT false,
          requires_signature BOOLEAN DEFAULT true,
          tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      console.log('✓ Tabla creada');

      // Crear índices
      await client.query(`
        CREATE INDEX idx_mr_consent_templates_tenant ON medical_record_consent_templates(tenant_id);
        CREATE INDEX idx_mr_consent_templates_category ON medical_record_consent_templates(category);
        CREATE INDEX idx_mr_consent_templates_active ON medical_record_consent_templates(is_active);
        CREATE INDEX idx_mr_consent_templates_deleted ON medical_record_consent_templates(deleted_at);
      `);

      console.log('✓ Índices creados');

      // Insertar plantillas por defecto
      await client.query(`
        INSERT INTO medical_record_consent_templates (name, category, content, description, is_active, is_default, tenant_id)
        VALUES 
          (
            'Consentimiento Informado General HC',
            'general',
            'CONSENTIMIENTO INFORMADO PARA ATENCIÓN MÉDICA

Yo, {{clientName}}, identificado(a) con {{clientId}}, declaro que he sido informado sobre mi condición médica.

Historia Clínica: {{recordNumber}}
Fecha: {{currentDate}}

_______________________________
Firma del Paciente',
            'Plantilla general de consentimiento informado',
            true,
            true,
            NULL
          ),
          (
            'Consentimiento para Procedimiento',
            'procedure',
            'CONSENTIMIENTO PARA PROCEDIMIENTO MÉDICO

Paciente: {{clientName}} ({{clientId}})
Procedimiento: {{procedureName}}
Diagnóstico: {{diagnosisDescription}}

Fecha: {{currentDate}}

_______________________________
Firma del Paciente',
            'Plantilla para procedimientos médicos',
            true,
            true,
            NULL
          );
      `);

      console.log('✓ Plantillas por defecto insertadas');

    } else {
      console.log('✓ La tabla medical_record_consent_templates existe');

      // Obtener estructura de la tabla
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'medical_record_consent_templates'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Estructura de la tabla:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Contar registros
      const count = await client.query(`
        SELECT COUNT(*) as count FROM medical_record_consent_templates
      `);

      console.log(`\n✓ Total de plantillas: ${count.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkStructure();
