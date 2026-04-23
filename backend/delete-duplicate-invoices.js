require('dotenv').config();
const { Client } = require('pg');

async function deleteDuplicateInvoices() {
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

    // Buscar facturas duplicadas
    const duplicatesQuery = `
      SELECT 
        i.id,
        i."invoiceNumber",
        i."tenantId",
        t.name as tenant_name,
        t.slug as tenant_slug,
        i."periodStart",
        i."periodEnd",
        i.total,
        i.status,
        i."createdAt",
        i."dueDate"
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      WHERE t.deleted_at IS NULL
      ORDER BY i."tenantId", i."periodStart", i."createdAt" ASC;
    `;

    const result = await client.query(duplicatesQuery);
    
    console.log(`📊 Total de facturas encontradas: ${result.rows.length}\n`);

    // Agrupar por tenant y período
    const grouped = {};
    result.rows.forEach(invoice => {
      const key = `${invoice.tenantId}-${invoice.periodStart}-${invoice.periodEnd}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(invoice);
    });

    // Eliminar duplicados (mantener la primera, eliminar las demás)
    console.log('🗑️  ELIMINANDO FACTURAS DUPLICADAS:\n');
    let deletedCount = 0;
    
    for (const [key, invoices] of Object.entries(grouped)) {
      if (invoices.length > 1) {
        console.log(`\n⚠️  Tenant: ${invoices[0].tenant_name} (${invoices[0].tenant_slug})`);
        console.log(`   Período: ${invoices[0].periodStart} - ${invoices[0].periodEnd}`);
        console.log(`   Facturas duplicadas: ${invoices.length}`);
        
        // Mantener la primera (más antigua), eliminar las demás
        const toKeep = invoices[0];
        const toDelete = invoices.slice(1);
        
        console.log(`\n   ✅ MANTENER:`);
        console.log(`      ID: ${toKeep.id}`);
        console.log(`      Número: ${toKeep.invoiceNumber}`);
        console.log(`      Creada: ${toKeep.createdAt}`);
        
        console.log(`\n   ❌ ELIMINAR:`);
        for (const inv of toDelete) {
          console.log(`      ID: ${inv.id}`);
          console.log(`      Número: ${inv.invoiceNumber}`);
          console.log(`      Creada: ${inv.createdAt}`);
          
          // Eliminar la factura
          await client.query('DELETE FROM invoices WHERE id = $1', [inv.id]);
          deletedCount++;
          console.log(`      ✅ Eliminada\n`);
        }
      }
    }

    if (deletedCount === 0) {
      console.log('✅ No se encontraron facturas duplicadas para eliminar\n');
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

deleteDuplicateInvoices();
