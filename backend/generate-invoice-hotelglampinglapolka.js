const { Client } = require('pg');

async function generateInvoiceForHotel() {
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

    // 1. Obtener datos del tenant
    const tenantResult = await client.query(`
      SELECT id, name, slug, plan, billing_cycle
      FROM tenants 
      WHERE slug = 'hotelglampinglapolka'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('=== TENANT ===');
    console.log('ID:', tenant.id);
    console.log('Nombre:', tenant.name);
    console.log('Plan:', tenant.plan);
    console.log('Ciclo:', tenant.billing_cycle);
    console.log('');

    // 2. Obtener precio del plan
    const planResult = await client.query(`
      SELECT price_monthly, price_annual
      FROM plan_pricing 
      WHERE plan_id = $1 AND region = 'colombia'
    `, [tenant.plan]);

    if (planResult.rows.length === 0) {
      console.log('❌ Plan no encontrado, usando precio por defecto');
      // Precio por defecto para plan basic
      var price = 89900;
    } else {
      const plan = planResult.rows[0];
      price = tenant.billing_cycle === 'annual' ? plan.price_annual : plan.price_monthly;
      
      console.log('=== PRECIO ===');
      console.log('Precio mensual:', plan.price_monthly);
      console.log('Precio anual:', plan.price_annual);
      console.log('Precio a facturar:', price);
    }
    console.log('');

    // 3. Calcular fechas
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(1); // Primer día del mes actual
    
    const periodEnd = new Date(periodStart);
    if (tenant.billing_cycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }
    periodEnd.setDate(periodEnd.getDate() - 1); // Último día del período

    // Fecha de vencimiento: 15 días después de la fecha de emisión
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 15);

    console.log('=== FECHAS ===');
    console.log('Fecha actual:', now.toISOString());
    console.log('Período inicio:', periodStart.toISOString());
    console.log('Período fin:', periodEnd.toISOString());
    console.log('Fecha de vencimiento:', dueDate.toISOString());
    console.log('');

    // 4. Generar número de factura
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
    
    console.log('=== FACTURA ===');
    console.log('Número:', invoiceNumber);
    console.log('');

    // 5. Crear factura
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
      0, // Sin impuestos
      price,
      dueDate,
      periodStart,
      periodEnd,
      JSON.stringify([{
        description: `Plan ${tenant.plan} - ${tenant.billing_cycle === 'annual' ? 'Anual' : 'Mensual'}`,
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

    // 6. Registrar en historial
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
      `Factura ${invoiceNumber} generada manualmente`,
      JSON.stringify({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate
      })
    ]);

    console.log('✅ Historial registrado');
    console.log('');

    // 7. Calcular días hasta vencimiento
    const diffTime = new Date(invoice.dueDate) - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('=== RECORDATORIO ===');
    console.log('Días hasta vencimiento:', diffDays);
    
    if (diffDays <= 5 && diffDays >= 0) {
      console.log('✅ BANNER AMARILLO DEBERÍA MOSTRARSE (faltan 5 días o menos)');
    } else if (diffDays < 0) {
      console.log('✅ BANNER ROJO DEBERÍA MOSTRARSE (factura vencida)');
    } else {
      console.log('❌ BANNER NO SE MOSTRARÁ (faltan más de 5 días)');
    }
    console.log('');

    console.log('🎉 ¡Factura generada exitosamente!');
    console.log('El tenant hotelglampinglapolka ahora debería ver el banner de recordatorio en su dashboard.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

generateInvoiceForHotel();
