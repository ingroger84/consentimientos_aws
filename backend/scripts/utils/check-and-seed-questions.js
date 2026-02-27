const { Client } = require('pg');

async function checkAndSeedQuestions() {
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

    // 1. Verificar estructura de la tabla questions
    console.log('📋 Verificando estructura de tabla questions...');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position;
    `);
    console.table(columns.rows);

    // 2. Contar preguntas actuales
    const countResult = await client.query('SELECT COUNT(*) as total FROM questions');
    console.log(`\n📊 Total de preguntas: ${countResult.rows[0].total}`);

    // 3. Verificar servicios disponibles
    console.log('\n📋 Servicios disponibles:');
    const services = await client.query(`
      SELECT s.id, s.name, t.name as tenant_name, t.slug as tenant_slug
      FROM services s
      JOIN tenants t ON t.id = s."tenantId"
      ORDER BY t.name, s.name;
    `);
    console.table(services.rows);

    if (services.rows.length === 0) {
      console.log('❌ No hay servicios en la base de datos. Primero debes crear servicios.');
      return;
    }

    // 4. Si no hay preguntas, crear algunas por defecto
    if (countResult.rows[0].total === '0') {
      console.log('\n📝 Creando preguntas por defecto...');

      // Preguntas generales para todos los servicios
      const defaultQuestions = [
        {
          text: '¿Tiene alguna alergia conocida?',
          type: 'TEXT',
          required: true,
          order: 1
        },
        {
          text: '¿Está tomando algún medicamento actualmente?',
          type: 'TEXT',
          required: true,
          order: 2
        },
        {
          text: '¿Ha tenido alguna cirugía previa?',
          type: 'TEXT',
          required: false,
          order: 3
        },
        {
          text: '¿Padece alguna enfermedad crónica?',
          type: 'TEXT',
          required: false,
          order: 4
        },
        {
          text: '¿Está embarazada o en período de lactancia?',
          type: 'YES_NO',
          required: false,
          order: 5
        }
      ];

      let totalCreated = 0;

      // Crear preguntas para cada servicio
      for (const service of services.rows) {
        console.log(`\n  Creando preguntas para: ${service.name} (${service.tenant_name})`);
        
        for (const question of defaultQuestions) {
          try {
            // Obtener el tenant_id del servicio
            const serviceDetail = await client.query('SELECT "tenantId" FROM services WHERE id = $1', [service.id]);
            const tenantId = serviceDetail.rows[0].tenantId;

            await client.query(`
              INSERT INTO questions ("questionText", type, "isRequired", "order", "serviceId", "tenantId", created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `, [
              question.text,
              question.type,
              question.required,
              question.order,
              service.id,
              tenantId
            ]);
            totalCreated++;
          } catch (error) {
            console.error(`    ❌ Error creando pregunta "${question.text}":`, error.message);
          }
        }
        console.log(`    ✅ ${defaultQuestions.length} preguntas creadas`);
      }

      console.log(`\n✅ Total de preguntas creadas: ${totalCreated}`);
    }

    // 5. Verificar resultado final
    console.log('\n📊 Resultado final:');
    const finalCount = await client.query(`
      SELECT 
        t.name as tenant_name,
        COUNT(DISTINCT s.id) as services_count,
        COUNT(q.id) as questions_count
      FROM tenants t
      LEFT JOIN services s ON s."tenantId" = t.id
      LEFT JOIN questions q ON q."serviceId" = s.id
      GROUP BY t.id, t.name
      ORDER BY t.name;
    `);
    console.table(finalCount.rows);

    // 6. Mostrar algunas preguntas de ejemplo
    console.log('\n📄 Preguntas de ejemplo:');
    const sampleQuestions = await client.query(`
      SELECT 
        q.id,
        q."questionText" as text,
        q.type,
        q."isRequired" as required,
        s.name as service_name,
        t.name as tenant_name
      FROM questions q
      JOIN services s ON s.id = q."serviceId"
      JOIN tenants t ON t.id = q."tenantId"
      LIMIT 10;
    `);
    console.table(sampleQuestions.rows);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkAndSeedQuestions();
