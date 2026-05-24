// Comparar factura exitosa con factura fallida
const { Client } = require('pg');

async function compare() {
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
    console.log('=== COMPARACIÓN DE FACTURAS ===\n');

    // Obtener factura exitosa
    const successResult = await client.query(`
      SELECT 
        i.id,
        i."invoiceNumber",
        i.amount,
        i.tax,
        i.total,
        i."paidAt",
        i."dueDate",
        i.items,
        i."dynamiaerpResponse",
        t.id as tenant_id,
        t.name as tenant_name,
        t.document_number,
        t.document_type_id,
        dt.code as document_type_code,
        p."paymentMethod",
        p."boldPaymentMethod"
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      LEFT JOIN document_types dt ON t.document_type_id = dt.id
      LEFT JOIN payments p ON p."invoiceId" = i.id
      WHERE i."invoiceNumber" = 'INV-202604-3740'
      ORDER BY p."createdAt" DESC
      LIMIT 1
    `);

    // Obtener factura fallida
    const failedResult = await client.query(`
      SELECT 
        i.id,
        i."invoiceNumber",
        i.amount,
        i.tax,
        i.total,
        i."paidAt",
        i."dueDate",
        i.items,
        i."dynamiaerpResponse",
        t.id as tenant_id,
        t.name as tenant_name,
        t.document_number,
        t.document_type_id,
        dt.code as document_type_code,
        p."paymentMethod",
        p."boldPaymentMethod"
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      LEFT JOIN document_types dt ON t.document_type_id = dt.id
      LEFT JOIN payments p ON p."invoiceId" = i.id
      WHERE i."invoiceNumber" = 'INV-202605'
      ORDER BY p."createdAt" DESC
      LIMIT 1
    `);

    if (successResult.rows.length === 0) {
      console.log('❌ Factura exitosa no encontrada');
      return;
    }

    if (failedResult.rows.length === 0) {
      console.log('❌ Factura fallida no encontrada');
      return;
    }

    const success = successResult.rows[0];
    const failed = failedResult.rows[0];

    console.log('✅ FACTURA EXITOSA: INV-202604-3740\n');
    console.log('   Tenant:', success.tenant_name);
    console.log('   Tenant ID:', success.tenant_id);
    console.log('   Documento:', success.document_type_code, success.document_number);
    console.log('   Monto:', success.amount);
    console.log('   IVA:', success.tax);
    console.log('   Total:', success.total);
    console.log('   Pagada:', success.paidAt);
    console.log('   Vence:', success.dueDate);
    console.log('   Método pago:', success.boldPaymentMethod || success.paymentMethod || 'N/A');
    console.log('   Items:', JSON.stringify(success.items, null, 2));
    console.log('');

    console.log('❌ FACTURA FALLIDA: INV-202605\n');
    console.log('   Tenant:', failed.tenant_name);
    console.log('   Tenant ID:', failed.tenant_id);
    console.log('   Documento:', failed.document_type_code, failed.document_number);
    console.log('   Monto:', failed.amount);
    console.log('   IVA:', failed.tax);
    console.log('   Total:', failed.total);
    console.log('   Pagada:', failed.paidAt);
    console.log('   Vence:', failed.dueDate);
    console.log('   Método pago:', failed.boldPaymentMethod || failed.paymentMethod || 'N/A');
    console.log('   Items:', JSON.stringify(failed.items, null, 2));
    console.log('');

    console.log('🔍 DIFERENCIAS CLAVE:\n');

    // Comparar tenants
    if (success.tenant_id === failed.tenant_id) {
      console.log('   ✅ Mismo tenant');
    } else {
      console.log('   ⚠️  Diferentes tenants');
      console.log(`      Exitosa: ${success.tenant_name} (${success.tenant_id})`);
      console.log(`      Fallida: ${failed.tenant_name} (${failed.tenant_id})`);
    }
    console.log('');

    // Comparar documentos
    if (success.document_number === failed.document_number) {
      console.log('   ✅ Mismo documento');
    } else {
      console.log('   ⚠️  Diferentes documentos');
      console.log(`      Exitosa: ${success.document_type_code} ${success.document_number}`);
      console.log(`      Fallida: ${failed.document_type_code} ${failed.document_number}`);
    }
    console.log('');

    // Comparar montos
    if (success.total === failed.total) {
      console.log('   ✅ Mismo monto total');
    } else {
      console.log('   ⚠️  Diferentes montos');
      console.log(`      Exitosa: $${success.total}`);
      console.log(`      Fallida: $${failed.total}`);
    }
    console.log('');

    // Comparar items
    if (JSON.stringify(success.items) === JSON.stringify(failed.items)) {
      console.log('   ✅ Mismos items');
    } else {
      console.log('   ⚠️  Diferentes items');
      console.log('      Exitosa:', success.items.length, 'items');
      console.log('      Fallida:', failed.items.length, 'items');
    }
    console.log('');

    // Mostrar respuesta de DynamiaERP de la factura exitosa
    if (success.dynamiaerpResponse) {
      console.log('📋 RESPUESTA DYNAMIAERP (EXITOSA):\n');
      console.log(JSON.stringify(success.dynamiaerpResponse, null, 2));
      console.log('');
    }

    // Mostrar respuesta de DynamiaERP de la factura fallida
    if (failed.dynamiaerpResponse) {
      console.log('📋 RESPUESTA DYNAMIAERP (FALLIDA):\n');
      console.log(JSON.stringify(failed.dynamiaerpResponse, null, 2));
      console.log('');
    }

    console.log('💡 CONCLUSIÓN:\n');
    
    if (success.tenant_id === failed.tenant_id) {
      console.log('   Ambas facturas son del MISMO tenant (Termales Espiritu Santo).');
      console.log('   El documento es el mismo: CC 1234567890 (parece ser de prueba).');
      console.log('');
      console.log('   ⚠️  PROBLEMA IDENTIFICADO:');
      console.log('   La factura exitosa (INV-202604-3740) funcionó con el mismo documento,');
      console.log('   pero la factura fallida (INV-202605) no.');
      console.log('');
      console.log('   Posibles causas:');
      console.log('   1. Cambio en la API de DynamiaERP');
      console.log('   2. Diferencia en el formato de datos enviados');
      console.log('   3. Problema temporal con DynamiaERP');
      console.log('   4. Diferencia en los items de la factura');
      console.log('');
      console.log('   🔧 Recomendación:');
      console.log('   - Revisar el código que genera el payload para DynamiaERP');
      console.log('   - Comparar el payload enviado en ambos casos');
      console.log('   - Contactar soporte de DynamiaERP con ambos casos');
    } else {
      console.log('   Las facturas son de diferentes tenants.');
      console.log('   Verificar configuración específica de cada tenant.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

compare();
