const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function generateInvoiceDirectly() {
  try {
    console.log('🔧 Generando factura directamente desde la base de datos...\n');

    // Obtener el tenant que necesita factura
    const tenantQuery = `
      SELECT 
        id,
        name,
        slug,
        plan,
        billing_day,
        billing_cycle,
        use_custom_price,
        custom_price_monthly,
        custom_price_annual
      FROM tenants
      WHERE slug = 'termaleses'
        AND deleted_at IS NULL;
    `;

    const tenantResult = await pool.query(tenantQuery);
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('✅ Tenant encontrado:', tenant.name);
    console.log('   Plan:', tenant.plan);
    console.log('   Billing Day:', tenant.billing_day);
    console.log('   Billing Cycle:', tenant.billing_cycle || 'monthly');
    console.log('');

    // Calcular período de facturación
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(tenant.billing_day);
    if (periodStart > now) {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    if (tenant.billing_cycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }
    periodEnd.setHours(0, 0, 0, 0);

    console.log('📅 Período de facturación:');
    console.log('   Inicio:', periodStart.toISOString());
    console.log('   Fin:', periodEnd.toISOString());
    console.log('');

    // Calcular precio
    let amount = 0;
    if (tenant.use_custom_price) {
      amount = tenant.billing_cycle === 'annual' 
        ? tenant.custom_price_annual 
        : tenant.custom_price_monthly;
    } else {
      const standardPrices = {
        basic: { monthly: 89900, annual: 899000 },
        professional: { monthly: 119900, annual: 1199000 },
        enterprise: { monthly: 179900, annual: 1799000 },
      };
      const planPrices = standardPrices[tenant.plan];
      amount = tenant.billing_cycle === 'annual' 
        ? planPrices.annual 
        : planPrices.monthly;
    }

    console.log('💰 Monto a facturar:', amount);
    console.log('');

    // Generar número de factura
    const lastInvoiceQuery = `
      SELECT "invoiceNumber"
      FROM invoices
      WHERE "tenantId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 1;
    `;

    const lastInvoiceResult = await pool.query(lastInvoiceQuery, [tenant.id]);
    let invoiceNumber;
    
    if (lastInvoiceResult.rows.length > 0) {
      const lastNumber = lastInvoiceResult.rows[0].invoiceNumber;
      const match = lastNumber.match(/INV-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;
      } else {
        invoiceNumber = `INV-${Date.now()}`;
      }
    } else {
      invoiceNumber = 'INV-000001';
    }

    console.log('📄 Número de factura:', invoiceNumber);
    console.log('');

    // Calcular fecha de vencimiento (3 días después de la fecha de corte)
    const dueDate = new Date(periodStart);
    dueDate.setDate(dueDate.getDate() + 3);

    console.log('⏰ Fecha de vencimiento:', dueDate.toISOString());
    console.log('');

    // Crear la factura
    const insertQuery = `
      INSERT INTO invoices (
        "tenantId",
        "invoiceNumber",
        "periodStart",
        "periodEnd",
        "dueDate",
        amount,
        tax,
        total,
        status,
        items,
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, "invoiceNumber", total, status;
    `;

    const subtotal = amount;
    const tax = 0; // Sin impuestos por ahora
    const total = subtotal + tax;

    // Crear items de la factura
    const planNames = {
      basic: 'Básico',
      professional: 'Profesional',
      enterprise: 'Empresarial'
    };

    const cycleNames = {
      monthly: 'Mensual',
      annual: 'Anual'
    };

    const planName = planNames[tenant.plan] || tenant.plan;
    const cycleName = cycleNames[tenant.billing_cycle || 'monthly'] || (tenant.billing_cycle || 'monthly');

    const items = [{
      description: `Suscripción Plan ${planName} - ${cycleName}`,
      quantity: 1,
      unitPrice: amount,
      total: amount
    }];

    const insertResult = await pool.query(insertQuery, [
      tenant.id,
      invoiceNumber,
      periodStart,
      periodEnd,
      dueDate,
      subtotal,
      tax,
      total,
      'pending',
      JSON.stringify(items)
    ]);

    const invoice = insertResult.rows[0];

    console.log('✅ FACTURA GENERADA EXITOSAMENTE:');
    console.log('   ID:', invoice.id);
    console.log('   Número:', invoice.invoiceNumber);
    console.log('   Total:', invoice.total);
    console.log('   Estado:', invoice.status);
    console.log('');
    console.log('🎉 Factura creada correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

generateInvoiceDirectly();
