/**
 * Script para limpiar datos de prueba de Bold
 * Elimina:
 * - Intentos de pago de prueba (payment_attempts)
 * - Links de pago de prueba en facturas
 * - Pagos de prueba (payments)
 * - Logs de webhooks de prueba
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function cleanBoldTestData() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // 1. Contar registros antes de limpiar
    console.log('📊 Contando registros de prueba...\n');

    const countPaymentAttempts = await client.query(
      'SELECT COUNT(*) FROM payment_attempts'
    );
    console.log(`   payment_attempts: ${countPaymentAttempts.rows[0].count} registros`);

    const countInvoicesWithBoldLinks = await client.query(
      `SELECT COUNT(*) FROM invoices 
       WHERE bold_payment_link IS NOT NULL 
       OR bold_payment_link_id IS NOT NULL 
       OR bold_payment_reference IS NOT NULL`
    );
    console.log(`   invoices con links Bold: ${countInvoicesWithBoldLinks.rows[0].count} registros`);

    const countPayments = await client.query(
      `SELECT COUNT(*) FROM payments 
       WHERE payment_method = 'bold' 
       OR bold_order_id IS NOT NULL`
    );
    console.log(`   payments de Bold: ${countPayments.rows[0].count} registros`);

    const countWebhookLogs = await client.query(
      `SELECT COUNT(*) FROM webhook_logs 
       WHERE source = 'bold'`
    );
    console.log(`   webhook_logs de Bold: ${countWebhookLogs.rows[0].count} registros\n`);

    // Confirmar antes de proceder
    console.log('⚠️  ADVERTENCIA: Esta operación eliminará todos los datos de prueba de Bold');
    console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🧹 Iniciando limpieza de datos de prueba...\n');

    // 2. Eliminar intentos de pago
    console.log('1️⃣  Eliminando intentos de pago (payment_attempts)...');
    const deleteAttempts = await client.query('DELETE FROM payment_attempts');
    console.log(`   ✅ ${deleteAttempts.rowCount} registros eliminados\n`);

    // 3. Limpiar campos de Bold en facturas
    console.log('2️⃣  Limpiando campos de Bold en facturas...');
    const updateInvoices = await client.query(`
      UPDATE invoices 
      SET 
        bold_payment_link = NULL,
        bold_payment_link_id = NULL,
        bold_payment_reference = NULL,
        bold_payment_link_status = NULL,
        payment_attempts_count = 0,
        last_payment_attempt_at = NULL
      WHERE 
        bold_payment_link IS NOT NULL 
        OR bold_payment_link_id IS NOT NULL 
        OR bold_payment_reference IS NOT NULL
        OR bold_payment_link_status IS NOT NULL
        OR payment_attempts_count > 0
    `);
    console.log(`   ✅ ${updateInvoices.rowCount} facturas actualizadas\n`);

    // 4. Eliminar pagos de Bold
    console.log('3️⃣  Eliminando pagos de Bold (payments)...');
    const deletePayments = await client.query(`
      DELETE FROM payments 
      WHERE payment_method = 'bold' 
      OR bold_order_id IS NOT NULL
    `);
    console.log(`   ✅ ${deletePayments.rowCount} pagos eliminados\n`);

    // 5. Eliminar logs de webhooks de Bold
    console.log('4️⃣  Eliminando logs de webhooks de Bold...');
    const deleteWebhookLogs = await client.query(`
      DELETE FROM webhook_logs 
      WHERE source = 'bold'
    `);
    console.log(`   ✅ ${deleteWebhookLogs.rowCount} logs eliminados\n`);

    // 6. Verificar limpieza
    console.log('✅ Verificando limpieza...\n');

    const verifyAttempts = await client.query('SELECT COUNT(*) FROM payment_attempts');
    console.log(`   payment_attempts: ${verifyAttempts.rows[0].count} registros (debe ser 0)`);

    const verifyInvoices = await client.query(`
      SELECT COUNT(*) FROM invoices 
      WHERE bold_payment_link IS NOT NULL 
      OR bold_payment_link_id IS NOT NULL 
      OR bold_payment_reference IS NOT NULL
      OR payment_attempts_count > 0
    `);
    console.log(`   invoices con datos Bold: ${verifyInvoices.rows[0].count} registros (debe ser 0)`);

    const verifyPayments = await client.query(`
      SELECT COUNT(*) FROM payments 
      WHERE payment_method = 'bold' 
      OR bold_order_id IS NOT NULL
    `);
    console.log(`   payments de Bold: ${verifyPayments.rows[0].count} registros (debe ser 0)`);

    const verifyWebhookLogs = await client.query(`
      SELECT COUNT(*) FROM webhook_logs 
      WHERE source = 'bold'
    `);
    console.log(`   webhook_logs de Bold: ${verifyWebhookLogs.rows[0].count} registros (debe ser 0)\n`);

    console.log('🎉 Limpieza completada exitosamente!');
    console.log('✅ Todos los datos de prueba de Bold han sido eliminados');
    console.log('📝 Ahora puedes configurar las credenciales de producción de Bold\n');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar limpieza
cleanBoldTestData()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
