// Script para aplicar la migración de Bold
// Fecha: 20 de Enero de 2026

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  console.log('\n========================================');
  console.log('  Aplicando Migración de Bold');
  console.log('========================================\n');

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('Conectando a la base de datos...');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Puerto: ${process.env.DB_PORT}`);
    console.log(`  Base de datos: ${process.env.DB_DATABASE}\n`);

    await client.connect();
    console.log('✓ Conectado exitosamente\n');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-bold-integration-columns.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Ejecutando migración...\n');

    // Ejecutar la migración
    await client.query(sql);

    console.log('\n========================================');
    console.log('  ✓ Migración aplicada exitosamente');
    console.log('========================================\n');
    console.log('Columnas agregadas:');
    console.log('  • invoices.bold_payment_link');
    console.log('  • invoices.bold_transaction_id');
    console.log('  • invoices.bold_payment_reference');
    console.log('  • payments.bold_transaction_id');
    console.log('  • payments.bold_payment_method');
    console.log('  • payments.bold_payment_data\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('  ✗ Error al aplicar la migración');
    console.error('========================================\n');
    console.error(error.message);
    console.error('\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
