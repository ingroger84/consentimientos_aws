const { Client } = require('pg');
require('dotenv').config();

async function checkData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('=== Estado de la Base de Datos Supabase ===\n');
    
    const users = await client.query('SELECT COUNT(*) FROM users');
    console.log('Usuarios:', users.rows[0].count);
    
    const tenants = await client.query('SELECT COUNT(*) FROM tenants');
    console.log('Tenants:', tenants.rows[0].count);
    
    const roles = await client.query('SELECT COUNT(*) FROM roles');
    console.log('Roles:', roles.rows[0].count);
    
    const consents = await client.query('SELECT COUNT(*) FROM consents');
    console.log('Consentimientos:', consents.rows[0].count);
    
    const medicalRecords = await client.query('SELECT COUNT(*) FROM medical_records');
    console.log('Historias Clínicas:', medicalRecords.rows[0].count);
    
    const clients = await client.query('SELECT COUNT(*) FROM clients');
    console.log('Clientes:', clients.rows[0].count);
    
    console.log('\n=== Usuarios en el sistema ===');
    const usersList = await client.query('SELECT id, name, email FROM users ORDER BY created_at');
    usersList.rows.forEach(u => {
      console.log(`- ${u.name} (${u.email})`);
    });
    
    console.log('\n✅ Base de datos Supabase operativa');
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
