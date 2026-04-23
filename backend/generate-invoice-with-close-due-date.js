const { Client } = require('pg');

async function generateInvoiceWithCloseDueDate() {
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

    // 1. Eliminar factura anterior
    console.log('=== ELIMINANDO FACTURA ANTERIOR ===');
    const deleteResult = await client.query(`
      DELETE FROM invoices 
      WHERE "tenantId" = (SELECT id FROM tenants WHERE slug = 'hotelglampinglapolka')
      RETURNING "invoiceNumber"
    `);
    
    if (deleteResult.rows.length > 0) {
      console.log(`✅ Eliminada factura: ${deleteResult.rows[0].invoiceNumber}`);
    }
    console.log('');

    // 2. Obtener datos del tenant
    const tenantResult = await client.query(`
      SELECT id, name, slug, plan, billing_cycle
      FROM tenants 
      WHERE slug = 'hotelglampinglapolka'
    `);

    const tenant = tenantResult.rows[0];
    console.log('=== TENANT ===');
    console.log('ID:', tenant.id);
    console.log('Nombre:', tenant.name);
    console.log('Plan:', tenant.plan);
    console.log('');

    // 3. Precio
    const price = 89900; // Plan basic
    console.log('=== PRECIO ===');
    console.log('Total a facturar:', price);
    console.log('');

    // 4. Calcular fechas - VENCIMIENTO EN 3 DÍAS
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(1); // Primer día del mes actual
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(periodEnd.getDate() - 1);

    // Fecha de vencimiento: EN 3 DÍAS (para que muestre el banner amarillo)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 3);

    console.log('=== FECHAS ===');
    console.log('Fecha actual:', now.toISOString());
    console.log('Período inicio:', periodStart.toISOString());
    console.log('Período fin:', periodEnd.toISOString());
    console.log('Fecha de vencimiento:', dueDate.toISOString());
    console.log('⚠️ VENCIMIENTO EN 3 DÍAS - Banner amarillo debería mostrarse');
    console.log('');

    // 5. Generar número de factura
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
    
    console.log('=== FACTURA ===');
    console.log('Número:', invoiceNumber);
    console.log('');

    // 6. Crear factura
    const insertResult = await client.query(`
      INSERT INTO invoices (
        "tenantId",
        "invoiceNumber",
        status,
        amount,
        tax,
        total,
        "dueDate",
        "periodStart",
        "periodEnd",
        items,
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, "invoiceNumber", total, "dueDate"
    `, [
      tenant.id,
      invoiceNumber,
      'pending',
      price,
      0,
      price,
      dueDate,
      periodStart,
      periodEnd,
      JSON.stringify([{
        description: `Plan ${tenant.plan} - Mensual`,
        quantity: 1,
        unitPrice: price,
        total: price
      }])
    ]);

    const invoice = insertResult.rows[0];
    
    console.log('✅ FACTURA CREADA EXITOSAMENTE');
    console.log('ID:', invoice.id);
    console.log('Número:', invoice.invoiceNumber);
    console.log('Total:', invoice.total);
    console.log('Vencimiento:', invoice.dueDate);
    console.log('');

    // 7. Registrar en historial
    await client.query(`
      INSERT INTO billing_history (
        "tenantId",
        action,
        description,
        metadata,
        "createdAt"
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      tenant.id,
      'invoice_created',
      `Factura ${invoiceNumber} generada para prueba de banner`,
      JSON.stringify({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate
      })
    ]);

    console.log('✅ Historial registrado');
    console.log('');

    // 8. Calcular días hasta vencimiento
    const diffTime = new Date(invoice.dueDate) - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('=== RECORDATORIO ===');
    console.log('Días hasta vencimiento:', diffDays);
    
    if (diffDays <= 5 && diffDays >= 0) {
      console.log('✅ ✅ ✅ BANNER AMARILLO DEBERÍA MOSTRARSE (faltan 5 días o menos)');
      console.log('');
      console.log('🎯 INSTRUCCIONES:');
      console.log('1. Inicia sesión como usuario del tenant hotelglampinglapolka');
      console.log('2. Ve al dashboard');
      console.log('3. Deberías ver un banner amarillo con el mensaje:');
      console.log('   "💳 Recordatorio de Pago - 3 días restantes"');
      console.log('4. El banner muestra:');
      console.log('   - Número de factura');
      console.log('   - Fecha de vencimiento');
      console.log('   - Monto a pagar');
      console.log('   - Botón "Pagar Ahora"');
      console.log('   - Botón "Ver Factura"');
    } else if (diffDays < 0) {
      console.log('✅ BANNER ROJO DEBERÍA MOSTRARSE (factura vencida)');
    } else {
      console.log('❌ BANNER NO SE MOSTRARÁ (faltan más de 5 días)');
    }
    console.log('');

    console.log('🎉 ¡Factura generada exitosamente con vencimiento en 3 días!');
    console.log('El banner de recordatorio ahora debería aparecer en el dashboard del tenant.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

generateInvoiceWithCloseDueDate();
