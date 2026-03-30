/**
 * Script para aplicar migración del sistema de intentos de pago
 * Versión: v80.0.0
 * Fecha: 2026-03-29
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
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

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../database/migrations/add-payment-attempts-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Aplicando migración: add-payment-attempts-system.sql\n');

    // Ejecutar la migración
    await client.query(migrationSQL);

    console.log('\n✅ Migración aplicada exitosamente\n');

    // Verificar resultados
    console.log('📊 Verificando resultados...\n');

    // 1. Verificar columnas agregadas a invoices
    const columnsResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'invoices' 
        AND column_name IN ('bold_payment_link_status', 'payment_attempts_count', 'last_payment_attempt_at')
      ORDER BY column_name;
    `);

    console.log('✅ Columnas agregadas a invoices:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    // 2. Verificar tabla payment_attempts
    const tableResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payment_attempts'
      ORDER BY ordinal_position;
    `);

    console.log('\n✅ Tabla payment_attempts creada con columnas:');
    tableResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    // 3. Verificar índices
    const indexesResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('invoices', 'payment_attempts')
        AND indexname LIKE '%payment%'
      ORDER BY indexname;
    `);

    console.log('\n✅ Índices creados:');
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    // 4. Contar facturas actualizadas
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN bold_payment_link_status = 'active' THEN 1 END) as active_links,
        COUNT(CASE WHEN payment_attempts_count = 0 THEN 1 END) as zero_attempts
      FROM invoices;
    `);

    console.log('\n📊 Estadísticas de facturas:');
    console.log(`   - Total de facturas: ${statsResult.rows[0].total_invoices}`);
    console.log(`   - Links activos: ${statsResult.rows[0].active_links}`);
    console.log(`   - Sin intentos: ${statsResult.rows[0].zero_attempts}`);

    console.log('\n✅ Migración completada exitosamente');
    console.log('🎉 Sistema de intentos de pago Bold configurado\n');

  } catch (error) {
    console.error('\n❌ Error al aplicar migración:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
applyMigration()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
