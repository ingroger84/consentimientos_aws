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

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Datos del pago
    const invoiceId = 'a546a166-ca78-4071-a2ff-c9f90de234fc';
    const tenantId = 'a5f187aa-c1d4-4421-b1d7-a264d0cd8098';
    const amount = 89900.00;
    const boldOrderId = 'LNK_J0AAOFJABF';
    const paymentDate = '2026-03-28 02:56:08';

    console.log('📋 PROCESANDO PAGO MANUAL');
    console.log('   Factura ID:', invoiceId);
    console.log('   Tenant ID:', tenantId);
    console.log('   Monto:', amount);
    console.log('   Bold Order ID:', boldOrderId);
    console.log('   Fecha de pago:', paymentDate);
    console.log('');

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Crear registro de pago
    console.log('💰 Paso 1: Creando registro de pago...');
    const paymentResult = await client.query(`
      INSERT INTO payments (
        id,
        amount,
        "paymentMethod",
        "paymentDate",
        "invoiceId",
        "tenantId",
        notes,
        "boldTransactionId",
        "boldPaymentMethod",
        status,
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        'other',
        $2,
        $3,
        $4,
        $5,
        $6,
        'Bold Checkout',
        'completed',
        NOW(),
        NOW()
      )
      RETURNING id, amount, "paymentDate"
    `, [
      amount,
      paymentDate,
      invoiceId,
      tenantId,
      'Pago procesado manualmente - Bold Order ID: ' + boldOrderId + ' - Webhook no recibido',
      boldOrderId
    ]);

    const payment = paymentResult.rows[0];
    console.log('   ✅ Pago creado:', payment.id);
    console.log('   Monto:', payment.amount);
    console.log('   Fecha:', payment.paymentDate);
    console.log('');

    // 2. Marcar factura como pagada
    console.log('📄 Paso 2: Marcando factura como pagada...');
    await client.query(`
      UPDATE invoices 
      SET 
        status = 'paid',
        "paidAt" = $1,
        "updatedAt" = NOW()
      WHERE id = $2
    `, [paymentDate, invoiceId]);
    console.log('   ✅ Factura marcada como pagada');
    console.log('');

    // 3. Reactivar tenant
    console.log('🏢 Paso 3: Reactivando tenant...');
    const newExpiresAt = new Date();
    newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
    
    await client.query(`
      UPDATE tenants
      SET 
        status = 'active',
        suspended_at = NULL,
        plan_expires_at = $1,
        plan_started_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
    `, [newExpiresAt, tenantId]);
    console.log('   ✅ Tenant reactivado');
    console.log('   Nuevo estado: active');
    console.log('   Plan expira el:', newExpiresAt.toISOString());
    console.log('');

    // 4. Registrar en historial - Pago recibido
    console.log('📋 Paso 4: Registrando en historial de facturación...');
    await client.query(`
      INSERT INTO billing_history (
        id,
        "tenantId",
        action,
        description,
        metadata,
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        'payment_received',
        $2,
        $3,
        NOW()
      )
    `, [
      tenantId,
      'Pago recibido por $ 89.900 - Factura INV-202603-6331 (procesado manualmente)',
      JSON.stringify({
        invoiceId: invoiceId,
        invoiceNumber: 'INV-202603-6331',
        amount: amount,
        paymentId: payment.id,
        processedManually: true,
        reason: 'Webhook no recibido',
        boldOrderId: boldOrderId
      })
    ]);
    console.log('   ✅ Entrada de pago registrada en historial');
    console.log('');

    // 5. Registrar en historial - Tenant activado
    await client.query(`
      INSERT INTO billing_history (
        id,
        "tenantId",
        action,
        description,
        metadata,
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        'tenant_activated',
        $2,
        $3,
        NOW()
      )
    `, [
      tenantId,
      'Tenant reactivado tras recibir pago de $ 89.900 (procesado manualmente)',
      JSON.stringify({
        paymentId: payment.id,
        previousStatus: 'suspended',
        newExpiresAt: newExpiresAt,
        processedManually: true
      })
    ]);
    console.log('   ✅ Entrada de activación registrada en historial');
    console.log('');

    // Commit de la transacción
    await client.query('COMMIT');
    console.log('✅ TRANSACCIÓN COMPLETADA EXITOSAMENTE\n');

    // Verificar el resultado
    console.log('🔍 VERIFICACIÓN FINAL:\n');
    
    const verifyInvoice = await client.query(`
      SELECT "invoiceNumber", status, "paidAt" 
      FROM invoices 
      WHERE id = $1
    `, [invoiceId]);
    console.log('📄 Factura:');
    console.log('   Número:', verifyInvoice.rows[0].invoiceNumber);
    console.log('   Estado:', verifyInvoice.rows[0].status);
    console.log('   Pagada el:', verifyInvoice.rows[0].paidAt);
    console.log('');

    const verifyTenant = await client.query(`
      SELECT name, status, plan_expires_at as "planExpiresAt"
      FROM tenants 
      WHERE id = $1
    `, [tenantId]);
    console.log('🏢 Tenant:');
    console.log('   Nombre:', verifyTenant.rows[0].name);
    console.log('   Estado:', verifyTenant.rows[0].status);
    console.log('   Plan expira:', verifyTenant.rows[0].planExpiresAt);
    console.log('');

    console.log('✅ PROCESO COMPLETADO');
    console.log('');
    console.log('📧 PRÓXIMOS PASOS:');
    console.log('   1. Notificar al usuario que su cuenta ha sido reactivada');
    console.log('   2. Verificar que puede acceder al sistema');
    console.log('   3. Configurar webhooks de Bold para evitar este problema');
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

processManualPayment();
