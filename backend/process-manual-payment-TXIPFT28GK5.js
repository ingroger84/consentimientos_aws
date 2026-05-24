// Script para procesar manualmente el pago TXIPFT28GK5
// Ejecutar en servidor: node process-manual-payment-TXIPFT28GK5.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function processManualPayment() {
  console.log('=== PROCESAMIENTO MANUAL DE PAGO BOLD ===\n');

  const reference = 'INV-INV-202605-1778520833929-A1';
  const transactionId = 'TXIPFT28GK5';
  const amount = 119900;

  try {
    // 1. Buscar la factura
    console.log('1. Buscando factura...');
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, tenants(id, subdomain, company_name, status)')
      .eq('reference', reference)
      .single();

    if (invoiceError || !invoice) {
      console.error('❌ Factura no encontrada:', reference);
      process.exit(1);
    }

    console.log(`✅ Factura encontrada: ${invoice.invoice_number}`);
    console.log(`   Tenant: ${invoice.tenants.subdomain} (${invoice.tenants.company_name})`);
    console.log(`   Monto: $${invoice.total}`);
    console.log(`   Estado actual: ${invoice.status}`);
    console.log('');

    // 2. Verificar si ya existe un pago
    console.log('2. Verificando pagos existentes...');
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoice.id);

    if (existingPayments && existingPayments.length > 0) {
      console.log(`⚠️  Ya existen ${existingPayments.length} pagos para esta factura:`);
      existingPayments.forEach(p => {
        console.log(`   - ID: ${p.id}, Monto: $${p.amount}, Estado: ${p.status}`);
      });
      console.log('');
    }

    // 3. Crear el registro de pago
    console.log('3. Creando registro de pago...');
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        amount: amount,
        payment_method: 'PSE',
        payment_date: new Date().toISOString(),
        invoice_id: invoice.id,
        tenant_id: invoice.tenant_id,
        notes: `Pago procesado manualmente - Bold Transaction ID: ${transactionId}`,
        bold_transaction_id: transactionId,
        bold_payment_method: 'PSE',
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Error al crear pago:', paymentError);
      process.exit(1);
    }

    console.log(`✅ Pago creado: ${payment.id}`);
    console.log('');

    // 4. Marcar la factura como pagada
    console.log('4. Marcando factura como pagada...');
    const { error: updateInvoiceError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: payment.id,
        bold_payment_link_status: 'succeeded',
      })
      .eq('id', invoice.id);

    if (updateInvoiceError) {
      console.error('❌ Error al actualizar factura:', updateInvoiceError);
      process.exit(1);
    }

    console.log(`✅ Factura marcada como pagada`);
    console.log('');

    // 5. Activar el tenant
    console.log('5. Activando tenant...');
    const { error: updateTenantError } = await supabase
      .from('tenants')
      .update({
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
      })
      .eq('id', invoice.tenant_id);

    if (updateTenantError) {
      console.error('❌ Error al activar tenant:', updateTenantError);
      process.exit(1);
    }

    console.log(`✅ Tenant activado`);
    console.log('');

    // 6. Resumen
    console.log('=== PAGO PROCESADO EXITOSAMENTE ===');
    console.log(`Factura: ${invoice.invoice_number}`);
    console.log(`Tenant: ${invoice.tenants.subdomain}`);
    console.log(`Monto: $${amount}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Payment ID: ${payment.id}`);
    console.log('');
    console.log('El tenant ahora está activo y el banner rojo desaparecerá.');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

processManualPayment();
