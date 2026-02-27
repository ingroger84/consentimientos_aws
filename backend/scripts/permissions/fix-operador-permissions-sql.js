const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'consentimientos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function fixOperadorPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('=== CORRIGIENDO PERMISOS DEL OPERADOR EN PLANTILLAS HC ===\n');

    // 1. Ver permisos actuales
    console.log('1. Permisos actuales del Operador en plantillas HC:');
    const current = await client.query(`
      SELECT name,
        'view_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_view,
        'create_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_create,
        'edit_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_edit,
        'delete_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_delete
      FROM roles
      WHERE name = 'Operador'
      AND deleted_at IS NULL
    `);
    
    if (current.rows.length === 0) {
      console.log('   ❌ Rol Operador no encontrado');
      return;
    }
    
    const perms = current.rows[0];
    console.log(`   Ver:     ${perms.has_view ? '✓' : '✗'}`);
    console.log(`   Crear:   ${perms.has_create ? '✓' : '✗'}`);
    console.log(`   Editar:  ${perms.has_edit ? '✓' : '✗'}`);
    console.log(`   Eliminar: ${perms.has_delete ? '✓' : '✗'}`);

    // 2. Actualizar permisos usando SQL
    console.log('\n2. Actualizando permisos...');
    
    // Primero, remover todos los permisos de mr_consent_templates
    await client.query(`
      UPDATE roles
      SET permissions = array_remove(
        array_remove(
          array_remove(
            array_remove(permissions, 'view_mr_consent_templates'),
            'create_mr_consent_templates'
          ),
          'edit_mr_consent_templates'
        ),
        'delete_mr_consent_templates'
      )
      WHERE name = 'Operador'
      AND deleted_at IS NULL
    `);
    
    // Luego, agregar los permisos correctos
    await client.query(`
      UPDATE roles
      SET permissions = array_cat(
        permissions,
        ARRAY[
          'view_mr_consent_templates',
          'create_mr_consent_templates',
          'edit_mr_consent_templates'
        ]::text[]
      ),
      updated_at = NOW()
      WHERE name = 'Operador'
      AND deleted_at IS NULL
    `);
    
    console.log('   ✓ Permisos actualizados');

    // 3. Verificar resultado
    console.log('\n3. Permisos finales del Operador en plantillas HC:');
    const final = await client.query(`
      SELECT name,
        'view_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_view,
        'create_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_create,
        'edit_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_edit,
        'delete_mr_consent_templates' = ANY(string_to_array(permissions::text, ',')) as has_delete
      FROM roles
      WHERE name = 'Operador'
      AND deleted_at IS NULL
    `);
    
    const finalPerms = final.rows[0];
    console.log(`   Ver:     ${finalPerms.has_view ? '✓' : '✗'}`);
    console.log(`   Crear:   ${finalPerms.has_create ? '✓' : '✗'}`);
    console.log(`   Editar:  ${finalPerms.has_edit ? '✓' : '✗'}`);
    console.log(`   Eliminar: ${finalPerms.has_delete ? '✓' : '✗'}`);

    // 4. Limpiar sesiones
    console.log('\n4. Limpiando sesiones activas...');
    const sessions = await client.query('DELETE FROM user_sessions RETURNING id');
    console.log(`   ✓ ${sessions.rowCount} sesiones limpiadas`);

    console.log('\n=== CORRECCIÓN COMPLETADA ===');
    console.log('\n✅ El Operador ahora puede:');
    console.log('   - Ver plantillas HC');
    console.log('   - Crear plantillas HC');
    console.log('   - Editar plantillas HC');
    console.log('   - NO puede eliminar plantillas HC');
    console.log('\n⚠️  IMPORTANTE: Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto.\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixOperadorPermissions();
