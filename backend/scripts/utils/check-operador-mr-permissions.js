const { Client } = require('pg');
require('dotenv').config();

async function checkOperadorPermissions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'consentimientos',
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar el rol de Operador
    const query = `
      SELECT id, name, type, permissions
      FROM roles
      WHERE type = 'OPERADOR'
      ORDER BY name;
    `;
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró el rol Operador');
      return;
    }

    const operador = result.rows[0];
    console.log(`📋 Rol: ${operador.name} (${operador.type})`);
    console.log(`   ID: ${operador.id}`);
    console.log(`\n📝 Permisos actuales:`);
    
    const permissions = operador.permissions ? operador.permissions.split(',') : [];
    permissions.forEach(p => console.log(`   - ${p}`));

    // Verificar permisos de plantillas HC
    const mrTemplatePermissions = [
      'view_mr_consent_templates',
      'create_mr_consent_templates',
      'edit_mr_consent_templates',
      'delete_mr_consent_templates',
      'generate_mr_consents',
      'view_mr_consents',
    ];

    console.log(`\n🔍 Permisos de Plantillas HC:`);
    mrTemplatePermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`   ${has ? '✅' : '❌'} ${perm}`);
    });

    // Verificar si tiene el permiso de eliminar que no debería tener
    if (permissions.includes('delete_mr_consent_templates')) {
      console.log(`\n⚠️  PROBLEMA DETECTADO: El rol Operador tiene el permiso 'delete_mr_consent_templates'`);
      console.log(`   Este permiso debe ser removido.\n`);
      
      // Remover el permiso
      const newPermissions = permissions.filter(p => p !== 'delete_mr_consent_templates').join(',');
      
      console.log(`🔧 Removiendo permiso 'delete_mr_consent_templates'...`);
      await client.query('UPDATE roles SET permissions = $1 WHERE id = $2', [newPermissions, operador.id]);
      console.log(`✅ Permiso removido exitosamente\n`);
      
      // Verificar nuevamente
      const verifyResult = await client.query('SELECT permissions FROM roles WHERE id = $1', [operador.id]);
      const newPerms = verifyResult.rows[0].permissions.split(',');
      
      console.log(`📝 Permisos actualizados:`);
      newPerms.forEach(p => console.log(`   - ${p}`));
      
      console.log(`\n🔍 Verificación de Plantillas HC:`);
      mrTemplatePermissions.forEach(perm => {
        const has = newPerms.includes(perm);
        console.log(`   ${has ? '✅' : '❌'} ${perm}`);
      });
    } else {
      console.log(`\n✅ El rol Operador NO tiene el permiso 'delete_mr_consent_templates'`);
      console.log(`   Los permisos están correctos.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkOperadorPermissions()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
