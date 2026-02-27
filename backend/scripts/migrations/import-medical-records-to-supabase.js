const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración Supabase
const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

// Datos de las HC de AWS (copiados del CSV)
const medicalRecords = [
  {
    id: '9216556c-3e88-4163-bb7a-f2f4eb65c8cd',
    created_at: '2026-01-28 05:12:48.406626',
    updated_at: '2026-01-28 05:12:48.406626',
    client_id: '08d6a164-cdd3-4a92-91e9-3af0005f4697',
    branch_id: 'e3f7a367-def4-4070-b825-ac567c847383',
    admission_date: '2026-01-23 05:12:48.406626',
    admission_type: 'Consulta Externa',
    record_number: 'HC-2026-001',
    status: 'active',
    is_locked: false,
    closed_at: null,
    closed_by: null,
    created_by: '6b532164-a4c8-4693-8fa5-8b46ad97f78e',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790'
  },
  {
    id: '33ad9da4-dc64-4179-a3bd-c8cd6fa8dfcb',
    created_at: '2026-01-28 05:12:48.406626',
    updated_at: '2026-01-28 05:12:48.406626',
    client_id: 'fb16589d-4f2a-4e5b-93d8-0effa1f0f54b',
    branch_id: 'e3f7a367-def4-4070-b825-ac567c847383',
    admission_date: '2026-01-25 05:12:48.406626',
    admission_type: 'Consulta Externa',
    record_number: 'HC-2026-002',
    status: 'active',
    is_locked: false,
    closed_at: null,
    closed_by: null,
    created_by: '6b532164-a4c8-4693-8fa5-8b46ad97f78e',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790'
  },
  {
    id: '260bf464-3c23-4de4-9ca5-7ecc4010dc48',
    created_at: '2026-01-28 05:12:48.415512',
    updated_at: '2026-01-28 05:12:48.415512',
    client_id: '5f7ce9d4-6931-4bd2-96a5-adff10801b28',
    branch_id: '04a359ab-8130-4811-b28f-12781f638b56',
    admission_date: '2026-01-26 05:12:48.415512',
    admission_type: 'Consulta Externa',
    record_number: 'HC-CD-002',
    status: 'active',
    is_locked: false,
    closed_at: null,
    closed_by: null,
    created_by: 'b9e9bb88-c801-44cb-8e9f-a2bdf15cb0cc',
    tenant_id: '6aae0c88-d8d5-4963-9758-4dab6c0ef24f'
  },
  {
    id: 'a6c1b4b7-ccd4-4d74-97dd-047e40089994',
    created_at: '2026-01-28 05:12:48.415512',
    updated_at: '2026-01-28 05:12:48.415512',
    client_id: '2af22998-5718-4124-a925-5ddb8656ac6e',
    branch_id: '04a359ab-8130-4811-b28f-12781f638b56',
    admission_date: '2026-01-21 05:12:48.415512',
    admission_type: 'Urgencias',
    record_number: 'HC-CD-001',
    status: 'closed',
    is_locked: false,
    closed_at: '2026-01-23 05:12:48.415512',
    closed_by: 'b9e9bb88-c801-44cb-8e9f-a2bdf15cb0cc',
    created_by: 'b9e9bb88-c801-44cb-8e9f-a2bdf15cb0cc',
    tenant_id: '6aae0c88-d8d5-4963-9758-4dab6c0ef24f'
  },
  {
    id: '4b7536f3-2520-464c-8ebc-632bc4a34fd2',
    created_at: '2026-01-28 14:30:03.481445',
    updated_at: '2026-01-28 14:30:03.481445',
    client_id: '8ec1204f-22ad-49fd-9ca2-4807e850ad42',
    branch_id: 'e3f7a367-def4-4070-b825-ac567c847383',
    admission_date: '2026-01-28 14:29:00',
    admission_type: 'consulta',
    record_number: 'HC-2026-000004',
    status: 'active',
    is_locked: false,
    closed_at: null,
    closed_by: null,
    created_by: '251477fd-a83b-4d8c-ac36-c63387d1d925',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790'
  }
];

// Mapeo de tipos de admisión antiguos a nuevos
const admissionTypeMap = {
  'Consulta Externa': 'consulta',
  'Urgencias': 'urgencia',
  'consulta': 'consulta',
  'urgencia': 'urgencia',
  'hospitalizacion': 'hospitalizacion',
  'control': 'control',
  'telemedicina': 'telemedicina'
};

async function importMedicalRecords() {
  try {
    console.log('🔄 Conectando a Supabase...\n');
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // Obtener HC existentes
    const existingResult = await client.query('SELECT id FROM medical_records');
    const existingIds = new Set(existingResult.rows.map(row => row.id));
    console.log(`📋 ${existingIds.size} HC ya existen en Supabase\n`);

    let migrated = 0;
    let skipped = 0;
    let admissionsCreated = 0;

    for (const mr of medicalRecords) {
      try {
        if (existingIds.has(mr.id)) {
          console.log(`⚠️  HC ${mr.record_number} ya existe, saltando...`);
          skipped++;
          continue;
        }

        // Normalizar tipo de admisión
        const normalizedType = admissionTypeMap[mr.admission_type] || 'consulta';

        // Insertar HC
        await client.query(`
          INSERT INTO medical_records (
            id,
            created_at,
            updated_at,
            client_id,
            branch_id,
            admission_date,
            admission_type,
            record_number,
            status,
            is_locked,
            closed_at,
            closed_by,
            created_by,
            tenant_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          mr.id,
          mr.created_at,
          mr.updated_at,
          mr.client_id,
          mr.branch_id,
          mr.admission_date,
          normalizedType,
          mr.record_number,
          mr.status,
          mr.is_locked,
          mr.closed_at,
          mr.closed_by,
          mr.created_by,
          mr.tenant_id
        ]);

        migrated++;
        console.log(`✅ HC migrada: ${mr.record_number}`);

        // Crear admisión automática
        const admissionIdResult = await client.query('SELECT gen_random_uuid() as id');
        const admissionId = admissionIdResult.rows[0].id;

        await client.query(`
          INSERT INTO admissions (
            id,
            medical_record_id,
            admission_date,
            admission_type,
            reason,
            status,
            closed_at,
            created_by,
            closed_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          admissionId,
          mr.id,
          mr.admission_date,
          normalizedType,
          'Primera admisión - Apertura de Historia Clínica (migración automática)',
          mr.status === 'closed' ? 'closed' : 'open',
          mr.closed_at,
          mr.created_by,
          mr.closed_by,
          mr.created_at,
          mr.created_at
        ]);

        admissionsCreated++;
        console.log(`   ✅ Admisión creada\n`);

      } catch (error) {
        console.error(`❌ Error al migrar HC ${mr.record_number}:`, error.message);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ HC migradas: ${migrated}`);
    console.log(`✅ Admisiones creadas: ${admissionsCreated}`);
    console.log(`⚠️  HC saltadas (ya existen): ${skipped}`);

    // Verificar conteo final
    const finalMRResult = await client.query('SELECT COUNT(*) FROM medical_records');
    const finalAdmResult = await client.query('SELECT COUNT(*) FROM admissions');
    
    console.log(`\n✅ Total HC en Supabase: ${finalMRResult.rows[0].count}`);
    console.log(`✅ Total admisiones en Supabase: ${finalAdmResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

importMedicalRecords();
