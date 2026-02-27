const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function fixPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('=== CORRIGIENDO PERMISO edit_mr_consent_templates ===\n');

    // 1. Ver todos los roles y sus permisos
    console.log('1. Roles actuales:');
    const roles = await client.query(`
      SELECT id, name, type, permissions
      FROM roles
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    roles.rows.forEach(role => {
      const hasEdit = role.permissions && role.permissions.includes('edit_mr_consent_templates');
      console.log(`   ${role.name} (${role.type}): ${hasEdit ? '✓ Tiene edit' : '✗ NO tiene edit'}`);
      if (!hasEdit && role.permissions) {
        const hasView = role.permissions.includes('view_mr_consent_templates');
        const hasCreate = role.permissions.includes('create_mr_consent_templates');
        if (hasView || hasCreate) {
          console.log(`     → Tiene view: ${hasView}, create: ${hasCreate}`);
        }
      }
    });

    // 2. Agregar permiso a roles que tienen view y create
    console.log('\n2. Agregando permiso edit_mr_consent_templates...');
    
    let fixed = 0;
    for (const role of roles.rows) {
      const hasEdit = role.permissions && role.permissions.includes('edit_mr_consent_templates');
      const hasView = role.permissions && role.permissions.includes('view_mr_consent_templates');
      const hasCreate = role.permissions && role.permissions.includes('create_mr_consent_templates');
      
      if (!hasEdit && (hasView || hasCreate)) {
        const newPermissions = [...(role.permissions || []), 'edit_mr_consent_templates'];
        
        await client.query(`
          UPDATE roles
          SET permissions = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [newPermissions, role.id]);
        
        console.log(`   ✓ Agregado a: ${role.name}`);
        fixed++;
      }
    }
    
    if (fixed === 0) {
      console.log('   ℹ️  Todos los roles ya tienen el permiso correcto');
    }

    // 3. Verificar estado final
    console.log('\n3. Estado final:');
    const finalRoles = await client.query(`
      SELECT name, permissions
      FROM roles
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    finalRoles.rows.forEach(role => {
      const hasView = role.permissions && role.permissions.includes('view_mr_consent_templates');
      const hasCreate = role.permissions && role.permissions.includes('create_mr_consent_templates');
      const hasEdit = role.permissions && role.permissions.includes('edit_mr_consent_templates');
      const hasDelete = role.permissions && role.permissions.includes('delete_mr_consent_templates');
      
      console.log(`   ${role.name}:`);
      console.log(`     Ver: ${hasView ? '✓' : '✗'}, Crear: ${hasCreate ? '✓' : '✗'}, Editar: ${hasEdit ? '✓' : '✗'}, Eliminar: ${hasDelete ? '✓' : '✗'}`);
    });

    // 4. Limpiar sesiones
    console.log('\n4. Limpiando sesiones activas...');
    const sessions = await client.query('DELETE FROM user_sessions RETURNING id');
    console.log(`   ✓ ${sessions.rowCount} sesiones limpiadas`);

    console.log('\n=== CORRECCIÓN COMPLETADA ===');
    console.log('\n⚠️  IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar sesión.\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPermissions();
