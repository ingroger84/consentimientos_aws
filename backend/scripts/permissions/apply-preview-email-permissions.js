const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function applyPermissions() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos');

    // 1. Crear permisos
    console.log('\n1. Creando permisos...');
    
    const previewResult = await client.query(`
      INSERT INTO permissions (name, description, category, created_at, updated_at)
      SELECT 'preview_medical_records', 'Vista previa de historias clínicas', 'medical_records', NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'preview_medical_records')
      RETURNING id, name
    `);
    
    const emailResult = await client.query(`
      INSERT INTO permissions (name, description, category, created_at, updated_at)
      SELECT 'send_email_medical_records', 'Enviar historias clínicas por email', 'medical_records', NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'send_email_medical_records')
      RETURNING id, name
    `);

    if (previewResult.rows.length > 0) {
      console.log('  ✓ Permiso "preview_medical_records" creado');
    } else {
      console.log('  ℹ Permiso "preview_medical_records" ya existe');
    }

    if (emailResult.rows.length > 0) {
      console.log('  ✓ Permiso "send_email_medical_records" creado');
    } else {
      console.log('  ℹ Permiso "send_email_medical_records" ya existe');
    }

    // 2. Obtener IDs de permisos
    const permissions = await client.query(`
      SELECT id, name FROM permissions 
      WHERE name IN ('preview_medical_records', 'send_email_medical_records')
    `);

    const previewPermissionId = permissions.rows.find(p => p.name === 'preview_medical_records')?.id;
    const emailPermissionId = permissions.rows.find(p => p.name === 'send_email_medical_records')?.id;

    if (!previewPermissionId || !emailPermissionId) {
      throw new Error('No se pudieron obtener los IDs de los permisos');
    }

    // 3. Asignar a Super Admin
    console.log('\n2. Asignando permisos a Super Admin...');
    const superAdminRole = await client.query(`
      SELECT id FROM roles WHERE type = 'super_admin' LIMIT 1
    `);

    if (superAdminRole.rows.length > 0) {
      const roleId = superAdminRole.rows[0].id;
      
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [roleId, previewPermissionId]);

      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [roleId, emailPermissionId]);

      console.log('  ✓ Permisos asignados a Super Admin');
    }

    // 4. Asignar a Admin General
    console.log('\n3. Asignando permisos a Admin General...');
    const adminRoles = await client.query(`
      SELECT id, name FROM roles WHERE type = 'admin_general'
    `);

    for (const role of adminRoles.rows) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [role.id, previewPermissionId]);

      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [role.id, emailPermissionId]);

      console.log(`  ✓ Permisos asignados a Admin General: ${role.name}`);
    }

    // 5. Asignar a Operador
    console.log('\n4. Asignando permisos a Operador...');
    const operadorRoles = await client.query(`
      SELECT id, name FROM roles WHERE type = 'operador'
    `);

    for (const role of operadorRoles.rows) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [role.id, previewPermissionId]);

      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT $1, $2, NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2
        )
      `, [role.id, emailPermissionId]);

      console.log(`  ✓ Permisos asignados a Operador: ${role.name}`);
    }

    // 6. Verificación
    console.log('\n5. Verificación final...');
    const verification = await client.query(`
      SELECT 
        r.type as role_type,
        r.name as role_name,
        p.name as permission_name,
        p.description
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.name IN ('preview_medical_records', 'send_email_medical_records')
      ORDER BY r.type, p.name
    `);

    console.log('\n  Permisos asignados:');
    verification.rows.forEach(row => {
      console.log(`    - ${row.role_type} (${row.role_name}): ${row.permission_name}`);
    });

    console.log('\n✅ Permisos aplicados exitosamente');
    console.log('\nResumen:');
    console.log(`  - Permisos creados: 2`);
    console.log(`  - Roles actualizados: ${new Set(verification.rows.map(r => r.role_type)).size}`);
    console.log(`  - Total asignaciones: ${verification.rows.length}`);

  } catch (error) {
    console.error('\n❌ Error al aplicar permisos:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyPermissions();
