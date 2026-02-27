const { Client } = require('pg');

async function addPermissions() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'consentimientos',
    user: 'admin',
    password: 'admin123',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Permisos de historias clínicas
    const medicalRecordsPermissions = [
      'view_medical_records',
      'create_medical_records',
      'edit_medical_records',
      'delete_medical_records',
      'close_medical_records',
      'sign_medical_records',
      'export_medical_records',
    ];

    // Obtener todos los roles
    const rolesResult = await client.query('SELECT id, name, type, permissions FROM roles');
    
    console.log('📋 Roles encontrados:');
    rolesResult.rows.forEach(role => {
      console.log(`   - ${role.name} (${role.type})`);
    });
    console.log('');

    // Agregar permisos a cada rol
    for (const role of rolesResult.rows) {
      // Parsear permisos existentes
      let currentPermissions = [];
      if (role.permissions) {
        // Los permisos están almacenados como string separado por comas
        currentPermissions = role.permissions.split(',').filter(p => p.trim());
      }

      // Determinar qué permisos agregar según el tipo de rol
      let permissionsToAdd = [];
      
      if (role.type === 'super_admin') {
        // Super admin tiene todos los permisos
        permissionsToAdd = medicalRecordsPermissions;
      } else if (role.type === 'ADMIN_GENERAL') {
        // Admin general tiene todos excepto delete
        permissionsToAdd = medicalRecordsPermissions.filter(p => p !== 'delete_medical_records');
      } else if (role.type === 'ADMIN_SEDE') {
        // Admin sede tiene permisos básicos
        permissionsToAdd = [
          'view_medical_records',
          'create_medical_records',
          'edit_medical_records',
          'close_medical_records',
          'sign_medical_records',
        ];
      } else if (role.type === 'OPERADOR') {
        // Operador solo puede ver y crear
        permissionsToAdd = [
          'view_medical_records',
          'create_medical_records',
        ];
      }

      // Agregar solo los permisos que no existen
      const newPermissions = permissionsToAdd.filter(p => !currentPermissions.includes(p));
      
      if (newPermissions.length > 0) {
        const updatedPermissions = [...currentPermissions, ...newPermissions];
        const permissionsString = updatedPermissions.join(',');
        
        await client.query(
          'UPDATE roles SET permissions = $1 WHERE id = $2',
          [permissionsString, role.id]
        );
        
        console.log(`✅ Permisos agregados a ${role.name}:`);
        newPermissions.forEach(p => console.log(`   + ${p}`));
        console.log('');
      } else {
        console.log(`ℹ️  ${role.name} ya tiene todos los permisos necesarios\n`);
      }
    }

    // Verificar permisos actualizados
    console.log('🔍 Verificando permisos actualizados...\n');
    const updatedRoles = await client.query('SELECT name, type, permissions FROM roles ORDER BY type');
    
    updatedRoles.rows.forEach(role => {
      const permissions = role.permissions ? role.permissions.split(',').filter(p => p.trim()) : [];
      const medicalPerms = permissions.filter(p => p.includes('medical_records'));
      
      console.log(`📋 ${role.name} (${role.type}):`);
      if (medicalPerms.length > 0) {
        medicalPerms.forEach(p => console.log(`   ✓ ${p}`));
      } else {
        console.log('   (sin permisos de historias clínicas)');
      }
      console.log('');
    });

    console.log('✅ ¡Permisos de historias clínicas agregados exitosamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addPermissions();
