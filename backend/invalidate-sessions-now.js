const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Eliminando sesiones del Super Admin...');
    return client.query(`DELETE FROM user_sessions WHERE "userId" = (SELECT id FROM users WHERE email = 'rcaraballo@innovasystems.com.co')`);
  })
  .then(r => {
    console.log(`Sesiones eliminadas: ${r.rowCount}`);
    return client.query(`SELECT COUNT(*) as count FROM user_sessions WHERE "userId" = (SELECT id FROM users WHERE email = 'rcaraballo@innovasystems.com.co')`);
  })
  .then(r => {
    console.log(`Sesiones restantes: ${r.rows[0].count}`);
    console.log('');
    console.log('OK - Sesiones invalidadas');
    console.log('');
    console.log('INSTRUCCIONES:');
    console.log('1. Cerrar TODAS las pestanas del navegador');
    console.log('2. Limpiar cache: Ctrl+Shift+Del');
    console.log('3. Abrir incognito: Ctrl+Shift+N');
    console.log('4. Ir a: https://archivoenlinea.com/login');
    console.log('5. Iniciar sesion');
    client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
