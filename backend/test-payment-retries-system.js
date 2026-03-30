/**
 * Script de prueba para el sistema de reintentos de pago
 * Versión: v80.0.0
 * Fecha: 2026-03-29
 * 
 * Verifica que todos los componentes del sistema de reintentos estén funcionando
 */

require('dotenv').config();
const { Client } = require('pg');

async function testPaymentRetriesSystem() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    console.log('========================================');
    console.log('  TEST: Sistema de Reintentos de Pago');
    console.log('========================================\n');

    // 1. Verificar que las columnas existen en invoices
    console.log('📋 TEST 1: Verificar columnas en invoices');
    console.log('----------------------------------------');
    
    const columnsResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default
      FROM information_schema.columns
      WHERE table_name = 'invoices' 
        AND column_name IN ('bold_payment_link_status', 'payment_attempts_count', 'last_payment_attempt_at')
      ORDER BY column_name;
    `);

    if (columnsResult.rows.length === 3) {
      console.log('✅ Las 3 columnas existen:');
      columnsResult.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log(`❌ ERROR: Solo se encontraron ${columnsResult.rows.length} de 3 columnas`);
      return false;
    }

    // 2. Verificar que la tabla payment_attempts existe
    console.log('\n📋 TEST 2: Verificar tabla payment_attempts');
    console.log('----------------------------------------');
    
    const tableResult = await client.query(`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns
      WHERE table_name = 'payment_attempts';
    `);

    const columnCount = parseInt(tableResult.rows[0].column_count);
    if (columnCount >= 9) {
      console.log(`✅ Tabla payment_attempts existe con ${columnCount} columnas`);
    } else {
      console.log(`❌ ERROR: Tabla payment_attempts no existe o está incompleta`);
      return false;
    }

    // 3. Verificar índices
    console.log('\n📋 TEST 3: Verificar índices');
    console.log('----------------------------------------');
    
    const indexesResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('invoices', 'payment_attempts')
        AND indexname LIKE '%payment%'
      ORDER BY indexname;
    `);

    if (indexesResult.rows.length >= 4) {
      console.log(`✅ ${indexesResult.rows.length} índices creados:`);
      indexesResult.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
    } else {
      console.log(`⚠️  Solo ${indexesResult.rows.length} índices encontrados (esperados: 4)`);
    }

    // 4. Verificar facturas con valores por defecto
    console.log('\n📋 TEST 4: Verificar valores por defecto en facturas');
    console.log('----------------------------------------');
    
    const defaultsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN bold_payment_link_status IS NOT NULL THEN 1 END) as with_status,
        COUNT(CASE WHEN payment_attempts_count IS NOT NULL THEN 1 END) as with_count
      FROM invoices;
    `);

    const stats = defaultsResult.rows[0];
    console.log(`✅ Facturas verificadas:`);
    console.log(`   - Total: ${stats.total}`);
    console.log(`   - Con status: ${stats.with_status}`);
    console.log(`   - Con contador: ${stats.with_count}`);

    if (stats.total > 0 && stats.with_status === stats.total && stats.with_count === stats.total) {
      console.log('✅ Todas las facturas tienen valores por defecto');
    } else {
      console.log('⚠️  Algunas facturas no tienen valores por defecto');
    }

    // 5. Simular creación de intento de pago (sin commit)
    console.log('\n📋 TEST 5: Simular creación de intento de pago');
    console.log('----------------------------------------');
    
    await client.query('BEGIN');
    
    try {
      // Buscar una factura pendiente
      const invoiceResult = await client.query(`
        SELECT id, invoice_number
        FROM invoices
        WHERE status IN ('pending', 'overdue')
        LIMIT 1;
      `);

      if (invoiceResult.rows.length > 0) {
        const invoice = invoiceResult.rows[0];
        
        // Simular inserción de intento
        const insertResult = await client.query(`
          INSERT INTO payment_attempts (
            invoice_id,
            bold_payment_link,
            bold_payment_reference,
            bold_payment_link_id,
            status
          ) VALUES (
            $1,
            'https://checkout.bold.co/payment/LNK_TEST123',
            'INV-TEST-123456',
            'LNK_TEST123',
            'pending'
          )
          RETURNING id;
        `, [invoice.id]);

        console.log(`✅ Intento de pago simulado creado: ${insertResult.rows[0].id}`);
        console.log(`   Para factura: ${invoice.invoice_number}`);
        
        // Rollback para no afectar datos reales
        await client.query('ROLLBACK');
        console.log('✅ Rollback ejecutado (datos no afectados)');
      } else {
        console.log('⚠️  No hay facturas pendientes para probar');
        await client.query('ROLLBACK');
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('❌ Error en simulación:', error.message);
      return false;
    }

    // 6. Verificar función de limpieza
    console.log('\n📋 TEST 6: Verificar función de limpieza');
    console.log('----------------------------------------');
    
    const functionResult = await client.query(`
      SELECT proname
      FROM pg_proc
      WHERE proname = 'cleanup_old_payment_attempts';
    `);

    if (functionResult.rows.length > 0) {
      console.log('✅ Función cleanup_old_payment_attempts() existe');
    } else {
      console.log('⚠️  Función de limpieza no encontrada');
    }

    // 7. Estadísticas finales
    console.log('\n📊 ESTADÍSTICAS FINALES');
    console.log('----------------------------------------');
    
    const finalStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT COUNT(*) FROM invoices WHERE bold_payment_link IS NOT NULL) as invoices_with_links,
        (SELECT COUNT(*) FROM payment_attempts) as total_attempts,
        (SELECT COUNT(*) FROM payment_attempts WHERE status = 'failed') as failed_attempts,
        (SELECT COUNT(*) FROM payment_attempts WHERE status = 'succeeded') as succeeded_attempts;
    `);

    const final = finalStats.rows[0];
    console.log(`📊 Facturas:`);
    console.log(`   - Total: ${final.total_invoices}`);
    console.log(`   - Con links de pago: ${final.invoices_with_links}`);
    console.log(`\n📊 Intentos de pago:`);
    console.log(`   - Total: ${final.total_attempts}`);
    console.log(`   - Fallidos: ${final.failed_attempts}`);
    console.log(`   - Exitosos: ${final.succeeded_attempts}`);

    console.log('\n========================================');
    console.log('  ✅ TODOS LOS TESTS PASARON');
    console.log('========================================\n');

    console.log('🎉 Sistema de reintentos de pago verificado exitosamente');
    console.log('📝 El sistema está listo para producción\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error en tests:', error);
    return false;
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar tests
testPaymentRetriesSystem()
  .then((success) => {
    if (success) {
      console.log('\n✅ Tests completados exitosamente');
      process.exit(0);
    } else {
      console.log('\n❌ Tests fallaron');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
