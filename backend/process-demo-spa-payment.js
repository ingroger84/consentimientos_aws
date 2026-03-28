const axios = require('axios');
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
  port: 5432,
  username: 'postgres',
  password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const BOLD_API_KEY = 'g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE';
const BOLD_SECRET_KEY = 'IKi1koNT7pUK1uTRf4vYOQ';

async function checkBoldPaymentStatus(reference) {
  try {
    console.log(`\n🔍 Consultando estado del pago en Bold...`);
    console.log(`   Referencia: ${reference}`);
    
    const response = await axios.get(
      `https://integrations.api.bold.co/online/link/v1/status/${reference}`,
      {
        headers: {
          'Authorization': `${BOLD_API_KEY}:${BOLD_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('\n✅ Respuesta de Bold:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error consultando Bold:', error.response?.data || error.message);
    return null;
  }
}

async function processPayment(invoiceId, boldData) {
  try {
    await AppDataSource.initialize();
    console.log('\n✅ Conectado a la base de datos');
    
    // Obtener la factura
    const invoices = await AppDataSource.query(`
      SELECT * FROM invoices WHERE id = $1
    `, [invoiceId]);
    
    if (invoices.length === 0) {
      console.log('❌ Factura no encontrada');
      return;
    }
    
    const invoice = invoices[0];
    console.log(`\n📄 Factura: ${invoice.invoiceNumber}`);
    console.log(`   Estado actual: ${invoice.status}`);
    console.log(`   Total: $${invoice.total}`);
    
    // Verificar si ya está pagada
    if (invoice.status === 'paid') {
      console.log('✅ La factura ya está marcada como pagada');
      await AppDataSource.destroy();
      return;
    }
    
    // Crear el pago
    console.log('\n💰 Creando registro de pago...');
    const paymentResult = await AppDataSource.query(`
      INSERT INTO payments (
        "tenantId", "invoiceId", amount, currency, status, 
        "paymentMethod", "boldTransactionId", "boldPaymentData", "paymentDate"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      invoice.tenantId,
      invoice.id,
      invoice.total,
      invoice.currency,
      'completed',
      'card',
      boldData?.transactionId || 'MANUAL_PROCESS',
      JSON.stringify(boldData || {}),
    ]);
    
    console.log('✅ Pago registrado:', paymentResult[0].id);
    
    // Actualizar la factura
    console.log('\n📝 Actualizando factura...');
    await AppDataSource.query(`
      UPDATE invoices 
      SET status = $1, "paidAt" = NOW(), "boldTransactionId" = $2
      WHERE id = $3
    `, ['paid', boldData?.transactionId || 'MANUAL_PROCESS', invoice.id]);
    
    console.log('✅ Factura actualizada a PAID');
    
    // Registrar en historial
    await AppDataSource.query(`
      INSERT INTO billing_history (
        "tenantId", action, description, metadata
      )
      VALUES ($1, $2, $3, $4)
    `, [
      invoice.tenantId,
      'payment_received',
      `Pago recibido para factura ${invoice.invoiceNumber} - Procesado manualmente`,
      JSON.stringify({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paymentId: paymentResult[0].id,
        processedManually: true,
      }),
    ]);
    
    console.log('✅ Historial actualizado');
    
    await AppDataSource.destroy();
    console.log('\n✅ Pago procesado exitosamente');
    
  } catch (error) {
    console.error('❌ Error procesando pago:', error.message);
    process.exit(1);
  }
}

(async () => {
  const invoiceReference = 'INV-INV-202603-5376-1774733313965';
  const invoiceId = '734cd96a-9858-4197-81c4-50ce7ac1b928'; // Reemplazar con el ID real
  
  console.log('========================================');
  console.log('PROCESAMIENTO MANUAL DE PAGO DEMO-SPA');
  console.log('========================================');
  
  // Primero consultar Bold
  const boldStatus = await checkBoldPaymentStatus(invoiceReference);
  
  if (!boldStatus) {
    console.log('\n⚠️ No se pudo consultar el estado en Bold');
    console.log('   Procesando pago de todas formas...');
  }
  
  // Procesar el pago
  // NOTA: Necesitas proporcionar el ID correcto de la factura
  console.log('\n⚠️ IMPORTANTE: Necesitas proporcionar el ID de la factura');
  console.log('   Ejecuta primero el diagnóstico para obtener el ID');
  
})();
