const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function seedSupabase() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // 1. Obtener tenants existentes
    console.log('📋 Obteniendo tenants...');
    const tenantsResult = await client.query('SELECT id, name, slug FROM tenants ORDER BY id');
    const tenants = tenantsResult.rows;
    
    if (tenants.length === 0) {
      console.log('❌ No hay tenants en la base de datos');
      process.exit(1);
    }
    
    console.log(`✅ ${tenants.length} tenants encontrados:`);
    tenants.forEach(t => console.log(`   - ${t.name} (${t.slug})`));
    console.log('');

    // 2. Crear Branches (Sedes) para cada tenant
    console.log('🏢 Creando sedes...');
    const branches = [];
    
    for (const tenant of tenants) {
      // Verificar si ya tiene sedes
      const existingBranches = await client.query(
        'SELECT COUNT(*) FROM branches WHERE "tenantId" = $1',
        [tenant.id]
      );
      
      if (parseInt(existingBranches.rows[0].count) > 0) {
        console.log(`   ⚠️  ${tenant.name} ya tiene sedes, saltando...`);
        continue;
      }
      
      // Crear sede principal
      const branchResult = await client.query(`
        INSERT INTO branches (name, address, phone, email, "tenantId", "isActive", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, name
      `, [
        `Sede Principal - ${tenant.name}`,
        'Calle 123 #45-67',
        '+57 300 123 4567',
        `contacto@${tenant.slug}.com`,
        tenant.id
      ]);
      
      branches.push({ ...branchResult.rows[0], tenantId: tenant.id });
      console.log(`   ✅ Sede creada para ${tenant.name}`);
    }
    console.log(`✅ ${branches.length} sedes creadas\n`);

    // 3. Crear Services (Servicios) para cada tenant
    console.log('💼 Creando servicios...');
    const services = [];
    
    const serviceTemplates = [
      { name: 'Consulta General', description: 'Consulta médica general' },
      { name: 'Consulta Especializada', description: 'Consulta con especialista' },
      { name: 'Procedimiento Estético', description: 'Procedimiento estético básico' },
      { name: 'Tratamiento Facial', description: 'Tratamiento facial completo' },
      { name: 'Limpieza Facial', description: 'Limpieza facial profunda' }
    ];
    
    for (const tenant of tenants) {
      // Verificar si ya tiene servicios
      const existingServices = await client.query(
        'SELECT COUNT(*) FROM services WHERE "tenantId" = $1',
        [tenant.id]
      );
      
      if (parseInt(existingServices.rows[0].count) > 0) {
        console.log(`   ⚠️  ${tenant.name} ya tiene servicios, saltando...`);
        continue;
      }
      
      for (const service of serviceTemplates) {
        const serviceResult = await client.query(`
          INSERT INTO services (name, description, "tenantId", "isActive", created_at, updated_at)
          VALUES ($1, $2, $3, true, NOW(), NOW())
          RETURNING id, name
        `, [
          service.name,
          service.description,
          tenant.id
        ]);
        
        services.push(serviceResult.rows[0]);
      }
      
      console.log(`   ✅ ${serviceTemplates.length} servicios creados para ${tenant.name}`);
    }
    console.log(`✅ ${services.length} servicios creados en total\n`);

    // 4. Crear Consent Templates (Plantillas de Consentimiento)
    console.log('📄 Creando plantillas de consentimiento...');
    
    const templateTypes = [
      {
        name: 'Consentimiento Informado - Procedimiento',
        type: 'procedure',
        content: '<h1>Consentimiento Informado - Procedimiento</h1><p>Yo, [NOMBRE_PACIENTE], identificado con documento [DOCUMENTO], autorizo la realización del procedimiento [PROCEDIMIENTO].</p><p>He sido informado de los riesgos y beneficios del procedimiento.</p><p>Firma: _________________</p>',
        description: 'Plantilla para consentimiento de procedimientos médicos y estéticos'
      },
      {
        name: 'Tratamiento de Datos Personales',
        type: 'data_treatment',
        content: '<h1>Autorización Tratamiento de Datos Personales</h1><p>Autorizo el tratamiento de mis datos personales de acuerdo con la Ley 1581 de 2012.</p><p>Mis datos serán utilizados para:</p><ul><li>Gestión de historia clínica</li><li>Comunicaciones relacionadas con mi tratamiento</li><li>Facturación y cobro</li></ul><p>Firma: _________________</p>',
        description: 'Autorización para tratamiento de datos personales según normativa colombiana'
      },
      {
        name: 'Uso de Imagen y Derechos',
        type: 'image_rights',
        content: '<h1>Autorización de Uso de Imagen</h1><p>Autorizo el uso de fotografías y videos tomados durante mi tratamiento para:</p><ul><li>Registro en historia clínica</li><li>Seguimiento médico</li><li>Fines académicos (opcional)</li></ul><p>Firma: _________________</p>',
        description: 'Autorización para captura y uso de imágenes del paciente'
      }
    ];
    
    for (const tenant of tenants) {
      // Verificar si ya tiene plantillas
      const existingTemplates = await client.query(
        'SELECT COUNT(*) FROM consent_templates WHERE "tenantId" = $1',
        [tenant.id]
      );
      
      if (parseInt(existingTemplates.rows[0].count) > 0) {
        console.log(`   ⚠️  ${tenant.name} ya tiene plantillas, saltando...`);
        continue;
      }
      
      for (const template of templateTypes) {
        await client.query(`
          INSERT INTO consent_templates (name, type, content, description, "tenantId", "isActive", "isDefault", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, true, false, NOW(), NOW())
        `, [
          template.name,
          template.type,
          template.content,
          template.description,
          tenant.id
        ]);
      }
      
      console.log(`   ✅ ${templateTypes.length} plantillas creadas para ${tenant.name}`);
    }
    console.log(`✅ Plantillas de consentimiento creadas\n`);

    // 5. Crear Tax Configs (Configuración de Impuestos) - Global, no por tenant
    console.log('💰 Verificando configuración de impuestos...');
    
    // Verificar si ya existe configuración de impuestos
    const existingTaxConfig = await client.query('SELECT COUNT(*) FROM tax_configs');
    
    if (parseInt(existingTaxConfig.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tax_configs (
          name, 
          rate, 
          "applicationType",
          "isActive", 
          "isDefault",
          description,
          "createdAt", 
          "updatedAt"
        )
        VALUES ($1, $2, 'additional', true, true, $3, NOW(), NOW())
      `, [
        'IVA Colombia',
        19.0, // 19% IVA en Colombia
        'Impuesto al Valor Agregado - Colombia'
      ]);
      
      console.log(`   ✅ Configuración de impuestos creada`);
    } else {
      console.log(`   ⚠️  Ya existe configuración de impuestos`);
    }
    console.log(`✅ Configuración de impuestos completada\n`);

    // 6. Crear algunos clientes de ejemplo
    console.log('👥 Creando clientes de ejemplo...');
    
    const clientTemplates = [
      { fullName: 'Juan Pérez', documentType: 'CC', documentNumber: '1234567890', email: 'juan.perez@example.com', phone: '+57 300 111 2222' },
      { fullName: 'María García', documentType: 'CC', documentNumber: '0987654321', email: 'maria.garcia@example.com', phone: '+57 300 333 4444' },
      { fullName: 'Carlos Rodríguez', documentType: 'CC', documentNumber: '1122334455', email: 'carlos.rodriguez@example.com', phone: '+57 300 555 6666' }
    ];
    
    for (const tenant of tenants) {
      // Verificar si ya tiene clientes
      const existingClients = await client.query(
        'SELECT COUNT(*) FROM clients WHERE tenant_id = $1',
        [tenant.id]
      );
      
      if (parseInt(existingClients.rows[0].count) > 0) {
        console.log(`   ⚠️  ${tenant.name} ya tiene clientes, saltando...`);
        continue;
      }
      
      for (const clientTemplate of clientTemplates) {
        await client.query(`
          INSERT INTO clients (
            full_name, 
            document_type, 
            document_number, 
            email, 
            phone, 
            tenant_id, 
            created_at, 
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          clientTemplate.fullName,
          clientTemplate.documentType,
          clientTemplate.documentNumber,
          clientTemplate.email,
          clientTemplate.phone,
          tenant.id
        ]);
      }
      
      console.log(`   ✅ ${clientTemplates.length} clientes creados para ${tenant.name}`);
    }
    console.log(`✅ Clientes de ejemplo creados\n`);

    // Resumen final
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  ✅ SEED COMPLETADO                       ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log('📊 Resumen de datos creados:');
    console.log(`   - Sedes: ${branches.length}`);
    console.log(`   - Servicios: ${services.length}`);
    console.log(`   - Plantillas: ${templateTypes.length * tenants.length}`);
    console.log(`   - Clientes de ejemplo: ${clientTemplates.length * tenants.length}`);
    console.log('');
    
    console.log('✅ La base de datos Supabase ahora tiene datos completos');
    console.log('✅ Puedes acceder a: https://demo-estetica.archivoenlinea.com');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedSupabase();
