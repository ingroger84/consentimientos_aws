require('dotenv').config();
const { Client } = require('pg');

async function simulateGroupedHC() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Simular exactamente lo que hace getAllGroupedByTenant()
    console.log('=== SIMULANDO getAllGroupedByTenant() ===\n');

    // 1. Obtener todas las plantillas HC con las mismas condiciones
    const query = `
      SELECT 
        mrct.id,
        mrct.name,
        mrct.category,
        mrct.content,
        mrct.description,
        mrct.is_active,
        mrct.is_default,
        mrct.requires_signature,
        mrct.tenant_id,
        mrct.created_at,
        mrct.updated_at,
        mrct.deleted_at,
        t.name as tenant_name,
        t.slug as tenant_slug
      FROM medical_record_consent_templates mrct
      LEFT JOIN tenants t ON mrct.tenant_id = t.id
      WHERE mrct.tenant_id IS NOT NULL
        AND mrct.deleted_at IS NULL
      ORDER BY mrct.created_at DESC
    `;

    const result = await client.query(query);
    
    console.log(`Total plantillas encontradas: ${result.rows.length}\n`);

    // 2. Agrupar por tenant (simulando el código TypeScript)
    const groupedMap = new Map();

    result.rows.forEach(template => {
      const tenantId = template.tenant_id;
      const tenantName = template.tenant_name || 'Sin Cuenta';
      const tenantSlug = template.tenant_slug || 'sin-cuenta';

      if (!groupedMap.has(tenantId)) {
        groupedMap.set(tenantId, {
          tenantId,
          tenantName,
          tenantSlug,
          totalTemplates: 0,
          activeTemplates: 0,
          inactiveTemplates: 0,
          defaultTemplates: 0,
          templates: [],
        });
      }

      const group = groupedMap.get(tenantId);
      group.totalTemplates++;

      if (template.is_active) {
        group.activeTemplates++;
      } else {
        group.inactiveTemplates++;
      }

      if (template.is_default) {
        group.defaultTemplates++;
      }

      group.templates.push({
        id: template.id,
        name: template.name,
        category: template.category,
        content: template.content,
        description: template.description,
        isActive: template.is_active,
        isDefault: template.is_default,
        requiresSignature: template.requires_signature,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        tenantName,
        tenantSlug,
      });
    });

    // 3. Convertir Map a Array y ordenar
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => b.totalTemplates - a.totalTemplates);

    console.log('=== RESULTADO AGRUPADO ===\n');
    console.log(`Total de grupos: ${grouped.length}\n`);

    grouped.forEach((group, index) => {
      console.log(`Grupo ${index + 1}:`);
      console.log(`  Tenant: ${group.tenantName} (${group.tenantSlug})`);
      console.log(`  TenantId: ${group.tenantId}`);
      console.log(`  Total plantillas: ${group.totalTemplates}`);
      console.log(`  Activas: ${group.activeTemplates}`);
      console.log(`  Inactivas: ${group.inactiveTemplates}`);
      console.log(`  Predeterminadas: ${group.defaultTemplates}`);
      
      if (group.templates.length > 0) {
        console.log(`\n  Primera plantilla:`);
        const first = group.templates[0];
        console.log(`    - Nombre: ${first.name}`);
        console.log(`    - Categoría: ${first.category}`);
        console.log(`    - Tiene content: ${!!first.content}`);
        console.log(`    - Content length: ${first.content ? first.content.length : 0}`);
      }
      console.log('');
    });

    // 4. Verificar si hay grupos "Sin Cuenta"
    const sinCuenta = grouped.filter(g => 
      g.tenantName === 'Sin Cuenta' || 
      g.tenantSlug === 'sin-cuenta' ||
      !g.tenantId
    );

    if (sinCuenta.length > 0) {
      console.log('\n⚠️  PROBLEMA:');
      console.log(`Hay ${sinCuenta.length} grupo(s) "Sin Cuenta"`);
      sinCuenta.forEach(g => {
        console.log(`  - ${g.tenantName}: ${g.totalTemplates} plantillas`);
        console.log(`    TenantId: ${g.tenantId}`);
      });
    } else {
      console.log('\n✅ No hay grupos "Sin Cuenta"');
    }

    // 5. Mostrar JSON como lo devolvería el endpoint
    console.log('\n\n=== JSON QUE DEVOLVERÍA EL ENDPOINT ===');
    console.log(JSON.stringify(grouped, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

simulateGroupedHC()
  .then(() => {
    console.log('\n✅ Simulación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en simulación:', error);
    process.exit(1);
  });
