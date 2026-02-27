const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkAndFixPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('=== VERIFICANDO PERMISOS DE EDITAR PLANTILLAS HC ===\n');

    // 1. Verificar qué roles tienen el permiso
    console.log('1. Roles con permiso edit_mr_consent_templates:');
    const rolesWithPermission = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE 'edit_mr_consent_templates' = ANY(permissions)
      AND deleted_at IS NULL
      ORDER BY name
    `);
    
    if (rolesWithPermission.rows.length > 0) {
      rolesWithPermission.rows.forEach(role => {
        console.log(`   ✓ ${role.name} (${role.type})`);
      });
    } else {
      console.log('   ❌ Ningún rol tiene este permiso');
    }

    // 2. Verificar qué roles NO tienen el permiso pero deberían
    console.log('\n2. Roles SIN permiso edit_mr_consent_templates:');
    const rolesWithoutPermission = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE NOT ('edit_mr_consent_templates' = ANY(permissions))
      AND deleted_at IS NULL
      ORDER BY name
    `);
    
    rolesWithoutPermission.rows.forEach(role => {
      const hasView = role.permissions.includes('view_mr_consent_templates');
      const hasCreate = role.permissions.includes('create_mr_consent_templates');
      console.log(`   - ${role.name} (${role.type})`);
      console.log(`     Tiene view: ${hasView}, Tiene create: ${hasCreate}`);
    });

    // 3. Agregar permiso a roles que tienen view y create pero no edit
    console.log('\n3. Agregando permiso edit_mr_consent_templates a roles que lo necesitan...');
    
    const rolesToFix = rolesWithoutPermission.rows.filter(role => 
      role.permissions.includes('view_mr_consent_templates') &&
      role.permissions.includes('create_mr_consent_templates')
    );

    if (rolesToFix.length === 0) {
      console.log('   ℹ️  No hay roles que necesiten corrección');
    } else {
      for (const role of rolesToFix) {
        const newPermissions = [...role.permissions, 'edit_mr_consent_templates'];
        
        await client.query(`
          UPDATE roles
          SET permissions = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [newPermissions, role.id]);
        
        console.log(`   ✓ Agregado a: ${role.name}`);
      }
    }

    // 4. Verificar estado final
    console.log('\n4. Estado final de permisos:');
    const finalState = await client.query(`
      SELECT name, type,
        'view_mr_consent_templates' = ANY(permissions) as has_view,
        'create_mr_consent_templates' = ANY(permissions) as has_create,
        'edit_mr_consent_templates' = ANY(permissions) as has_edit,
        'delete_mr_consent_templates' = ANY(permissions) as has_delete
      FROM roles
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    console.log('\n   Rol              | Ver | Crear | Editar | Eliminar');
    console.log('   ' + '-'.repeat(60));
    finalState.rows.forEach(role => {
      const view = role.has_view ? '✓' : '✗';
      const create = role.has_create ? '✓' : '✗';
      const edit = role.has_edit ? '✓' : '✗';
      const del = role.has_delete ? '✓' : '✗';
      console.log(`   ${role.name.padEnd(16)} |  ${view}  |   ${create}   |   ${edit}    |    ${del}`);
    });

    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
    console.log('\n⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar para que los cambios surtan efecto.\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFixPermissions();
