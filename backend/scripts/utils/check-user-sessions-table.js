require('dotenv').config();
const { Client } = require('pg');

async function checkUserSessionsTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'consentimientos',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar si la tabla existe
    console.log('=== VERIFICANDO TABLA user_sessions ===');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla user_sessions NO EXISTE');
      console.log('\nEsto explica el problema. La tabla de sesiones no se ha creado.');
      console.log('Necesitas ejecutar la migración para crear la tabla.');
      return;
    }

    console.log('✓ La tabla user_sessions existe\n');

    // Obtener estructura de la tabla
    console.log('=== ESTRUCTURA DE LA TABLA ===');
    const columns = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position
    `);

    console.log('Columnas:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}:`);
      console.log(`    Tipo: ${col.data_type}`);
      console.log(`    Nullable: ${col.is_nullable}`);
      console.log(`    Default: ${col.column_default || 'N/A'}`);
      console.log('');
    });

    // Contar registros
    console.log('=== CONTENIDO DE LA TABLA ===');
    const count = await client.query('SELECT COUNT(*) FROM user_sessions');
    console.log(`Total de sesiones en la tabla: ${count.rows[0].count}\n`);

    // Mostrar todas las sesiones
    if (parseInt(count.rows[0].count) > 0) {
      const sessions = await client.query(`
        SELECT * FROM user_sessions
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      console.log('Últimas 10 sesiones:');
      sessions.rows.forEach((session, index) => {
        console.log(`\nSesión ${index + 1}:`);
        Object.keys(session).forEach(key => {
          console.log(`  ${key}: ${session[key]}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkUserSessionsTable();
