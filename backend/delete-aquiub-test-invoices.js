const { Client } = require('pg');

async function deleteTestInvoices() {
  const client = new Client({
    host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🗑️  Eliminando facturas de prueba de Aquiub\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Buscar el tenant Aquiub
    const tenantResult = await client.query(`
      SELECT id, name
      FROM tenants
      WHERE LOWER(name) LIKE '%aquiub%'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ No se encontró el tenant Aquiub');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`✅ Tenant encontrado: ${tenant.name} (${tenant.id})\n`);

    // Buscar facturas de prueba (con referencias TEST o INV-TEST)
    console.log('📋 Buscando facturas de prueba...\n');
    
    const invoicesResult = await client.query(`
      SELECT 
        id,
        "invoiceNumber",
        "boldPaymentReference",
        total,
        status,
        "createdAt"
      FROM invoices
      WHERE "tenantId" = $1
        AND (
          "boldPaymentReference" LIKE 'TEST-%'
          OR "boldPaymentReference" LIKE 'INV-TEST-%'
          OR "invoiceNumber" LIKE 'INV-TEST-%'
        )
      ORDER BY "createdAt" DESC
    `, [tenant.id]);

    if (invoicesResult.rows.length === 0) {
      console.log('✅ No se encontraron facturas de prueba para eliminar');
      return;
    }

    console.log(`📊 Facturas de prueba encontradas: ${invoicesResult.rows.length}\n`);
    
    for (const invoice of invoicesResult.rows) {
      console.log(`Factura: ${invoice.invoiceNumber}`);
      console.log(`  ID: ${invoice.id}`);
      console.log(`  Referencia: ${invoice.boldPaymentReference}`);
      console.log(`  Monto: ${invoice.total.toLocaleString('es-CO')} COP`);
      console.log(`  Estado: ${invoice.status}`);
      console.log(`  Creada: ${invoice.createdAt}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🗑️  Eliminando facturas y datos relacionados...\n');

    // Iniciar transacción
    await client.query('BEGIN');

    for (const invoice of invoicesResult.rows) {
      console.log(`Eliminando factura: ${invoice.invoiceNumber}`);

      // 1. Eliminar pagos asociados
      const paymentsResult = await client.query(`
        DELETE FROM payments
        WHERE "invoiceId" = $1
        RETURNING id
      `, [invoice.id]);

      if (paymentsResult.rowCount > 0) {
        console.log(`  ✅ ${paymentsResult.rowCount} pago(s) eliminado(s)`);
      }

      // 2. Eliminar webhook logs asociados
      const webhookLogsResult = await client.query(`
        DELETE FROM webhook_logs
        WHERE "invoiceId" = $1
        RETURNING id
      `, [invoice.id]);

      if (webhookLogsResult.rowCount > 0) {
        console.log(`  ✅ ${webhookLogsResult.rowCount} webhook log(s) eliminado(s)`);
      }

      // 3. Eliminar la factura
      await client.query(`
        DELETE FROM invoices
        WHERE id = $1
      `, [invoice.id]);

      console.log(`  ✅ Factura eliminada`);
      console.log('');
    }

    // Confirmar transacción
    await client.query('COMMIT');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN\n');
    console.log(`✅ ${invoicesResult.rows.length} factura(s) de prueba eliminada(s)`);
    console.log(`✅ Tenant: ${tenant.name}`);
    console.log('✅ Datos relacionados eliminados (pagos, webhook logs)');
    console.log('');
    console.log('🎯 COMPLETADO: Base de datos limpia de facturas de prueba');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

deleteTestInvoices();
