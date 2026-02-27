const { Client } = require('pg');

async function seedQuestions() {
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

    // Preguntas por defecto para cada servicio
    const defaultQuestions = [
      {
        questionText: '¿Tiene alguna alergia conocida?',
        type: 'TEXT',
        isRequired: true,
        isCritical: true,
        order: 1
      },
      {
        questionText: '¿Está tomando algún medicamento actualmente?',
        type: 'TEXT',
        isRequired: true,
        isCritical: true,
        order: 2
      },
      {
        questionText: '¿Ha tenido alguna cirugía previa?',
        type: 'TEXT',
        isRequired: false,
        isCritical: false,
        order: 3
      },
      {
        questionText: '¿Padece alguna enfermedad crónica?',
        type: 'TEXT',
        isRequired: true,
        isCritical: true,
        order: 4
      },
      {
        questionText: '¿Está embarazada o en período de lactancia?',
        type: 'YES_NO',
        isRequired: true,
        isCritical: true,
        order: 5
      }
    ];

    // Obtener todos los servicios
    console.log('📋 Obteniendo servicios...');
    const servicesResult = await client.query(`
      SELECT 
        s.id as service_id,
        s.name as service_name,
        s."tenantId" as tenant_id,
        t.name as tenant_name
      FROM services s
      JOIN tenants t ON s."tenantId" = t.id
      ORDER BY t.name, s.name;
    `);

    const services = servicesResult.rows;
    console.log(`Encontrados ${services.length} servicios\n`);

    let totalCreated = 0;

    // Crear preguntas para cada servicio
    for (const service of services) {
      console.log(`📝 Creando preguntas para: ${service.tenant_name} - ${service.service_name}`);
      
      for (const question of defaultQuestions) {
        await client.query(`
          INSERT INTO questions (
            id,
            "questionText",
            type,
            "isRequired",
            "isCritical",
            "order",
            "serviceId",
            "tenantId",
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `, [
          question.questionText,
          question.type,
          question.isRequired,
          question.isCritical,
          question.order,
          service.service_id,
          service.tenant_id
        ]);
        
        totalCreated++;
      }
      
      console.log(`  ✅ ${defaultQuestions.length} preguntas creadas`);
    }

    console.log(`\n✅ Total de preguntas creadas: ${totalCreated}`);

    // Verificar resultado
    console.log('\n📊 Verificando resultado...');
    const countByTenant = await client.query(`
      SELECT 
        t.name as tenant_name,
        COUNT(q.id) as question_count
      FROM tenants t
      LEFT JOIN questions q ON q."tenantId" = t.id
      GROUP BY t.id, t.name
      ORDER BY t.name;
    `);
    console.table(countByTenant.rows);

    const countByService = await client.query(`
      SELECT 
        s.name as service_name,
        t.name as tenant_name,
        COUNT(q.id) as question_count
      FROM services s
      LEFT JOIN questions q ON q."serviceId" = s.id
      LEFT JOIN tenants t ON s."tenantId" = t.id
      GROUP BY s.id, s.name, t.name
      ORDER BY t.name, s.name;
    `);
    console.log('\n📊 Preguntas por servicio:');
    console.table(countByService.rows);

    console.log('\n✅ Población de preguntas completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

seedQuestions();
