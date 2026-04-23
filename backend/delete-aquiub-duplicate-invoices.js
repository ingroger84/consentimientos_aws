require('dotenv').config();
const { Client } = require('pg');

async function deleteAquiubDuplicateInvoices() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar el tenant aquiub
    const tenantQuery = `
      SELECT id, name, slug
      FROM tenants
      WHERE slug = 'aquiub'
        AND deleted_at IS NULL;
    `;

    const tenantResult = await client.query(tenantQuery);
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ No se encontró el tenant "aquiub"\n');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`🏢 Tenant: ${tenant.name} (${tenant.slug})\n`);

    // Buscar todas las facturas del tenant ordenadas por creación
    const invoicesQuery = `
      SELECT 
        id,
        "invoiceNumber",
        "periodStart",
        "periodEnd",
        total,
        status,
        "createdAt"
      FROM invoices
      WHERE "tenantId" = $1
      ORDER BY "periodStart", "createdAt" ASC;
    `;

    const invoicesResult = await client.query(invoicesQuery, [tenant.id]);
    
    console.log(`📊 Total de facturas: ${invoicesResult.rows.length}\n`);

    // Agrupar por período
    const grouped = {};
    invoicesResult.rows.forEach(invoice => {
      const periodKey = `${invoice.periodStart.toISOString()}_${invoice.periodEnd.toISOString()}`;
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(invoice);
    });

    console.log('🗑️  ELIMINANDO FACTURAS DUPLICADAS:\n');
    console.log('═'.repeat(80));

    let deletedCount = 0;

    for (const [periodKey, invoices] of Object.entries(grouped)) {
      if (invoices.length > 1) {
        const [startDate, endDate] = periodKey.split('_');
        
        console.log(`\n📅 Período: ${new Date(startDate).toLocaleDateString('es-CO')} - ${new Date(endDate).toLocaleDateString('es-CO')}`);
        console.log(`   Facturas encontradas: ${invoices.length}\n`);

        // Mantener la primera (más antigua), eliminar las demás
        const toKeep = invoices[0];
        const toDelete = invoices.slice(1);

        console.log(`   ✅ MANTENER:`);
        console.log(`      Factura: ${toKeep.invoiceNumber}`);
        console.log(`      ID: ${toKeep.id}`);
        console.log(`      Creada: ${toKeep.createdAt.toLocaleString('es-CO')}\n`);

        console.log(`   ❌ ELIMINAR:`);
        for (const inv of toDelete) {
          console.log(`      Factura: ${inv.invoiceNumber}`);
          console.log(`      ID: ${inv.id}`);
          console.log(`      Creada: ${inv.createdAt.toLocaleString('es-CO')}`);

          // Eliminar la factura
          await client.query('DELETE FROM invoices WHERE id = $1', [inv.id]);
          deletedCount++;
          console.log(`      ✅ Eliminada\n`);
        }

        console.log('─'.repeat(80));
      }
    }

    if (deletedCount === 0) {
      console.log('\n✅ No se encontraron facturas duplicadas\n');
    } else {
      console.log(`\n✅ Total de facturas duplicadas eliminadas: ${deletedCount}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

deleteAquiubDuplicateInvoices();
