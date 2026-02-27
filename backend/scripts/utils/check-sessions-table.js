const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function checkSessionsTable() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar si la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla user_sessions NO existe');
      console.log('\n💡 El sistema no usa sesiones en base de datos');
      console.log('   Los tokens JWT son stateless');
      console.log('   Los usuarios deben cerrar sesión manualmente');
      return;
    }

    // Obtener estructura de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de la tabla user_sessions:\n');
    columns.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    });

    // Contar registros
    const count = await client.query(`SELECT COUNT(*) as count FROM user_sessions`);
    console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSessionsTable();
