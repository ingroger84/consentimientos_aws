require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function deleteDuplicateInvoice() {
  try {
    console.log('🗑️  Eliminando factura duplicada de Demo Estetica...\n');

    // ID de la factura duplicada (la más reciente)
    const duplicateId = 'f6bc20de-6adf-4791-be9a-9744dd7b2f84';
    const duplicateNumber = 'INV-202604-7902';

    // Verificar que la factura existe
    const checkResult = await pool.query(
      `SELECT i.*, t.name as tenant_name
       FROM invoices i
       JOIN tenants t ON i."tenantId" = t.id
       WHERE i.id = $1`,
      [duplicateId]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ No se encontró la factura a eliminar');
      return;
    }

    const invoice = checkResult.rows[0];
    console.log('📋 Factura a eliminar:');
    console.log(`   Número: ${invoice.invoiceNumber}`);
    console.log(`   Tenant: ${invoice.tenant_name}`);
    console.log(`   Período: ${invoice.periodStart.toISOString().split('T')[0]} - ${invoice.periodEnd.toISOString().split('T')[0]}`);
    console.log(`   Total: $${invoice.total}`);
    console.log(`   Estado: ${invoice.status}`);
    console.log(`   Creada: ${invoice.createdAt}\n`);

    // Eliminar la factura
    const deleteResult = await pool.query(
      'DELETE FROM invoices WHERE id = $1',
      [duplicateId]
    );

    console.log(`✅ Factura ${duplicateNumber} eliminada exitosamente\n`);

    // Verificar que solo queda una factura para ese período
    const verifyResult = await pool.query(
      `SELECT i."invoiceNumber", i."periodStart", i."periodEnd", i.status, i."createdAt"
       FROM invoices i
       JOIN tenants t ON i."tenantId" = t.id
       WHERE t.name ILIKE '%demo%estetica%'
       ORDER BY i."createdAt" DESC`
    );

    console.log('📊 Facturas restantes de Demo Estetica:');
    if (verifyResult.rows.length === 0) {
      console.log('   (ninguna)');
    } else {
      verifyResult.rows.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.invoiceNumber}`);
        console.log(`      Período: ${inv.periodStart.toISOString().split('T')[0]} - ${inv.periodEnd.toISOString().split('T')[0]}`);
        console.log(`      Estado: ${inv.status}`);
        console.log(`      Creada: ${inv.createdAt}`);
      });
    }

    console.log('\n✅ Limpieza completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

deleteDuplicateInvoice();
