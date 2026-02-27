const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

// Clientes de AWS
const clients = [
  {
    id: '08d6a164-cdd3-4a92-91e9-3af0005f4697',
    full_name: 'María García Pérez',
    document_type: 'CC',
    document_number: '1234567890',
    email: 'maria.garcia@email.com',
    phone: '+57 300 123 4567',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    birth_date: '1985-03-15',
    gender: 'Femenino',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790',
    created_at: '2026-01-28 05:12:48.406626',
    updated_at: '2026-01-28 05:12:48.406626'
  },
  {
    id: 'fb16589d-4f2a-4e5b-93d8-0effa1f0f54b',
    full_name: 'Juan Pérez López',
    document_type: 'CC',
    document_number: '9876543210',
    email: 'juan.perez@email.com',
    phone: '+57 310 987 6543',
    address: 'Carrera 45 #123-45',
    city: 'Medellín',
    birth_date: '1990-07-22',
    gender: 'Masculino',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790',
    created_at: '2026-01-28 05:12:48.406626',
    updated_at: '2026-01-28 05:12:48.406626'
  },
  {
    id: '2af22998-5718-4124-a925-5ddb8656ac6e',
    full_name: 'Carlos Martínez Silva',
    document_type: 'CC',
    document_number: '1111111111',
    email: 'carlos.martinez@email.com',
    phone: '+57 300 111 1111',
    address: 'Calle 50 #20-30',
    city: 'Bogotá',
    birth_date: '1975-05-10',
    gender: 'Masculino',
    tenant_id: '6aae0c88-d8d5-4963-9758-4dab6c0ef24f',
    created_at: '2026-01-28 05:12:48.415512',
    updated_at: '2026-01-28 05:12:48.415512'
  },
  {
    id: '5f7ce9d4-6931-4bd2-96a5-adff10801b28',
    full_name: 'Laura Gómez Torres',
    document_type: 'CC',
    document_number: '2222222222',
    email: 'laura.gomez@email.com',
    phone: '+57 310 222 2222',
    address: 'Carrera 15 #80-25',
    city: 'Bogotá',
    birth_date: '1992-09-18',
    gender: 'Femenino',
    tenant_id: '6aae0c88-d8d5-4963-9758-4dab6c0ef24f',
    created_at: '2026-01-28 05:12:48.415512',
    updated_at: '2026-01-28 05:12:48.415512'
  },
  {
    id: '8ec1204f-22ad-49fd-9ca2-4807e850ad42',
    full_name: 'Ana Rodríguez Martínez',
    document_type: 'CC',
    document_number: '5555555555',
    email: 'ana.rodriguez@email.com',
    phone: '+57 320 555 5555',
    address: 'Avenida 68 #45-12',
    city: 'Cali',
    birth_date: '1988-11-30',
    gender: 'Femenino',
    tenant_id: '836d4e1d-b1d5-401c-b1f9-cbc71f347790',
    created_at: '2026-01-28 05:12:48.406626',
    updated_at: '2026-01-31 04:06:02.46919'
  }
];

// Historias clínicas de AWS
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

const admissionTypeMap = {
  'Consulta Externa': 'consulta',
  'Urgencias': 'urgencia',
  'consulta': 'consulta'
};

async function migrateComplete() {
  try {
    console.log('🔄 Conectando a Supabase...\n');
    await client.connect();
    console.log('✅ Conectado\n');

    // 1. Migrar clientes
    console.log('📥 Migrando clientes...');
    let clientsMigrated = 0;
    
    for (const c of clients) {
      try {
        const exists = await client.query('SELECT id FROM clients WHERE id = $1', [c.id]);
        if (exists.rows.length > 0) {
          console.log(`⚠️  Cliente ${c.full_name} ya existe`);
          continue;
        }

        await client.query(`
          INSERT INTO clients (
            id, full_name, document_type, document_number, email, phone,
            address, city, birth_date, gender, tenant_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          c.id, c.full_name, c.document_type, c.document_number, c.email, c.phone,
          c.address, c.city, c.birth_date, c.gender, c.tenant_id, c.created_at, c.updated_at
        ]);

        clientsMigrated++;
        console.log(`✅ Cliente migrado: ${c.full_name}`);
      } catch (error) {
        console.error(`❌ Error al migrar cliente ${c.full_name}:`, error.message);
      }
    }

    console.log(`\n✅ ${clientsMigrated} clientes migrados\n`);

    // 2. Migrar historias clínicas con admisiones
    console.log('📥 Migrando historias clínicas...');
    let mrMigrated = 0;
    let admissionsMigrated = 0;

    // Verificar qué branches existen
    const branchesResult = await client.query('SELECT id FROM branches');
    const validBranchIds = new Set(branchesResult.rows.map(row => row.id));

    for (const mr of medicalRecords) {
      try {
        const exists = await client.query('SELECT id FROM medical_records WHERE id = $1', [mr.id]);
        if (exists.rows.length > 0) {
          console.log(`⚠️  HC ${mr.record_number} ya existe`);
          continue;
        }

        const normalizedType = admissionTypeMap[mr.admission_type] || 'consulta';
        
        // Si la branch no existe, usar NULL
        const branchId = mr.branch_id && validBranchIds.has(mr.branch_id) ? mr.branch_id : null;
        if (mr.branch_id && !validBranchIds.has(mr.branch_id)) {
          console.log(`⚠️  Sede ${mr.branch_id} no existe, usando NULL`);
        }

        await client.query(`
          INSERT INTO medical_records (
            id, created_at, updated_at, client_id, branch_id, admission_date,
            admission_type, record_number, status, is_locked, closed_at,
            closed_by, created_by, tenant_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          mr.id, mr.created_at, mr.updated_at, mr.client_id, branchId,
          mr.admission_date, normalizedType, mr.record_number, mr.status,
          mr.is_locked, mr.closed_at, mr.closed_by, mr.created_by, mr.tenant_id
        ]);

        mrMigrated++;
        console.log(`✅ HC migrada: ${mr.record_number}`);

        // Crear admisión
        const admissionId = await client.query('SELECT gen_random_uuid() as id');
        await client.query(`
          INSERT INTO admissions (
            id, medical_record_id, admission_date, admission_type, reason,
            status, closed_at, created_by, closed_by, created_at, updated_at, tenant_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          admissionId.rows[0].id, mr.id, mr.admission_date, normalizedType,
          'Primera admisión - Apertura de Historia Clínica (migración automática)',
          mr.status === 'closed' ? 'closed' : 'open', mr.closed_at,
          mr.created_by, mr.closed_by, mr.created_at, mr.created_at, mr.tenant_id
        ]);

        admissionsMigrated++;
        console.log(`   ✅ Admisión creada\n`);
      } catch (error) {
        console.error(`❌ Error al migrar HC ${mr.record_number}:`, error.message);
      }
    }

    console.log('\n📊 Resumen Final:');
    console.log(`✅ Clientes migrados: ${clientsMigrated}`);
    console.log(`✅ HC migradas: ${mrMigrated}`);
    console.log(`✅ Admisiones creadas: ${admissionsMigrated}`);

    const finalCounts = await Promise.all([
      client.query('SELECT COUNT(*) FROM clients'),
      client.query('SELECT COUNT(*) FROM medical_records'),
      client.query('SELECT COUNT(*) FROM admissions')
    ]);

    console.log(`\n✅ Total en Supabase:`);
    console.log(`   Clientes: ${finalCounts[0].rows[0].count}`);
    console.log(`   HC: ${finalCounts[1].rows[0].count}`);
    console.log(`   Admisiones: ${finalCounts[2].rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

migrateComplete();
