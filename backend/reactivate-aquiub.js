// Reactivar tenant Aquiub
const { Client } = require('pg');

async function reactivate() {
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
    console.log('=== REACTIVACIÓN DE TENANT AQUIUB ===\n');

    const invoiceNumber = 'INV-202605-3822';

    // Obtener tenant ID
    const result = await client.query(`
      SELECT i."tenantId", t.name, t.status, t.suspended_at
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      WHERE i."invoiceNumber" = $1
    `, [invoiceNumber]);

    if (result.rows.length === 0) {
      console.error('❌ Factura no encontrada');
      return;
    }

    const tenant = result.rows[0];
    console.log('Tenant:', tenant.name);
    console.log('Estado actual:', tenant.status);
    console.log('Suspendido:', tenant.suspended_at ? 'Sí' : 'No');
    console.log('');

    // Reactivar
    await client.query(`
      UPDATE tenants
      SET 
        status = 'active',
        suspended_at = NULL,
        updated_at = NOW()
      WHERE id = $1
    `, [tenant.tenantId]);

    console.log('✅ Tenant reactivado');
    console.log('');

    // Registrar en historial
    await client.query(`
      INSERT INTO billing_history (
        "tenantId",
        action,
        description,
        metadata,
        "createdAt"
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      tenant.tenantId,
      'TENANT_ACTIVATED',
      'Tenant reactivado manualmente después de procesar pago',
      JSON.stringify({
        invoiceNumber: invoiceNumber,
        previousStatus: tenant.status,
        newStatus: 'active'
      })
    ]);

    console.log('✅ Evento registrado en historial');
    console.log('');
    console.log('✅ PROCESO COMPLETADO');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

reactivate();
