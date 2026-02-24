const { Client } = require('pg');

const client = new Client({
  host: 'ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'archivoenlinea',
  user: 'archivoenlinea',
  password: '8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g',
  ssl: { rejectUnauthorized: false }
});

async function invalidateAllSessions() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Contar sesiones activas antes
    const countBefore = await client.query(`
      SELECT COUNT(*) as count FROM user_sessions WHERE "isActive" = true
    `);
    
    console.log(`📊 Sesiones activas antes: ${countBefore.rows[0].count}`);

    // Invalidar TODAS las sesiones activas
    const result = await client.query(`
      UPDATE user_sessions
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE "isActive" = true
      RETURNING id
    `);

    console.log(`\n✅ Sesiones invalidadas: ${result.rowCount}`);
    console.log('\n💡 Todos los usuarios deberán iniciar sesión nuevamente');
    console.log('   Los nuevos tokens JWT incluirán los permisos actualizados');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

invalidateAllSessions();
