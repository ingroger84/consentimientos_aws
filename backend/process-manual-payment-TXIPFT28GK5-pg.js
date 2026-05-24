// Script para procesar manualmente el pago TXIPFT28GK5
// Ejecutar en servidor: node process-manual-payment-TXIPFT28GK5-pg.js

require('dotenv').config();
const { Client } = require('pg');

async function processManualPayment() {
  const client = new Client({
    host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  console.log('=== PROCESAMIENTO MANUAL DE PAGO BOLD ===\n');

  const reference = 'INV-INV-202605-1778520833929-A1';
  const transactionId = 'TXIPFT28GK5';
  const amount = 119900;

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Buscar la factura
    console.log('1. Buscando factura...');
    const invoiceResult = await client.query(`
      SELECT i.*, t.id as "tenantId", t.subdomain, t."companyName", t.status as "tenantStatus"
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      WHERE i.reference = $1
    `, [reference]);

    if (invoiceResult.rows.length === 0) {
      console.error('❌ Factura no encontrada:', reference);
      process.exit(1);
    }

    const invoice = invoiceResult.rows[0];
    console.log(`✅ Factura encontrada: ${invoice.invoiceNumber}`);
    console.log(`   Tenant: ${invoice.subdomain} (${invoice.companyName})`);
    console.log(`   Monto: $${invoice.total}`);
    console.log(`   Estado actual: ${invoice.status}`);
    console.log('');

    // 2. Verificar si ya existe un pago
    console.log('2. Verificando pagos existentes...');
    const existingPaymentsResult = await client.query(`
      SELECT * FROM payments WHERE "invoiceId" = $1
    `, [invoice.id]);

    if (existingPaymentsResult.rows.length > 0) {
      console.log(`⚠️  Ya existen ${existingPaymentsResult.rows.length} pagos para esta factura:`);
      existingPaymentsResult.rows.forEach(p => {
        console.log(`   - ID: ${p.id}, Monto: $${p.amount}, Estado: ${p.status || 'N/A'}`);
      });
      console.log('');
    }

    // 3. Crear el registro de pago
    console.log('3. Creando registro de pago...');
    const paymentResult = await client.query(`
      INSERT INTO payments (
        amount, "paymentMethod", "paymentDate", "invoiceId", "tenantId",
        notes, "boldTransactionId", "boldPaymentMethod", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [
      amount,
      'PSE',
      new Date().toISOString(),
      invoice.id,
      invoice.tenantId,
      `Pago procesado manualmente - Bold Transaction ID: ${transactionId}`,
      transactionId,
      'PSE',
      'completed'
    ]);

    const payment = paymentResult.rows[0];
    console.log(`✅ Pago creado: ${payment.id}`);
    console.log('');

    // 4. Marcar la factura como pagada
    console.log('4. Marcando factura como pagada...');
    await client.query(`
      UPDATE invoices
      SET status = 'paid',
          "paidAt" = NOW(),
          "paymentId" = $1,
          "boldPaymentLinkStatus" = 'succeeded',
          "updatedAt" = NOW()
      WHERE id = $2
    `, [payment.id, invoice.id]);

    console.log(`✅ Factura marcada como pagada`);
    console.log('');

    // 5. Activar el tenant
    console.log('5. Activando tenant...');
    await client.query(`
      UPDATE tenants
      SET status = 'active',
          "suspendedAt" = NULL,
          "suspensionReason" = NULL,
          "updatedAt" = NOW()
      WHERE id = $1
    `, [invoice.tenantId]);

    console.log(`✅ Tenant activado`);
    console.log('');

    // 6. Resumen
    console.log('=== PAGO PROCESADO EXITOSAMENTE ===');
    console.log(`Factura: ${invoice.invoiceNumber}`);
    console.log(`Tenant: ${invoice.subdomain}`);
    console.log(`Monto: $${amount}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Payment ID: ${payment.id}`);
    console.log('');
    console.log('El tenant ahora está activo y el banner rojo desaparecerá.');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

processManualPayment();
