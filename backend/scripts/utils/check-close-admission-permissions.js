const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAndAddCloseAdmissionPermissions() {
  try {
    console.log('🔍 Verificando permisos de cerrar admisiones...\n');

    // 1. Verificar si existe el permiso
    const { data: existingPermission, error: checkError } = await supabase
      .from('permissions')
      .select('*')
      .eq('name', 'close_admissions')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar permiso:', checkError);
      return;
    }

    let permissionId;

    if (!existingPermission) {
      console.log('❌ Permiso "close_admissions" NO existe');
      console.log('✅ Creando permiso...\n');

      // Crear el permiso
      const { data: newPermission, error: createError } = await supabase
        .from('permissions')
        .insert({
          name: 'close_admissions',
          description: 'Cerrar admisiones de historias clínicas',
          category: 'medical_records'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear permiso:', createError);
        return;
      }

      permissionId = newPermission.id;
      console.log('✅ Permiso creado:', newPermission);
    } else {
      console.log('✅ Permiso "close_admissions" ya existe');
      permissionId = existingPermission.id;
      console.log('   ID:', permissionId);
      console.log('   Descripción:', existingPermission.description);
    }

    // 2. Verificar roles que deberían tener este permiso
    console.log('\n📋 Verificando roles...\n');

    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .in('name', ['admin', 'operador']);

    if (rolesError) {
      console.error('❌ Error al obtener roles:', rolesError);
      return;
    }

    console.log(`Roles encontrados: ${roles.length}`);

    // 3. Para cada rol, verificar y agregar el permiso si no lo tiene
    for (const role of roles) {
      console.log(`\n🔍 Verificando rol: ${role.name}`);

      const { data: rolePermissions, error: rpError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', role.id)
        .eq('permission_id', permissionId);

      if (rpError) {
        console.error(`   ❌ Error al verificar permisos del rol:`, rpError);
        continue;
      }

      if (rolePermissions && rolePermissions.length > 0) {
        console.log(`   ✅ El rol ya tiene el permiso`);
      } else {
        console.log(`   ❌ El rol NO tiene el permiso`);
        console.log(`   ➕ Agregando permiso...`);

        const { error: addError } = await supabase
          .from('role_permissions')
          .insert({
            role_id: role.id,
            permission_id: permissionId
          });

        if (addError) {
          console.error(`   ❌ Error al agregar permiso:`, addError);
        } else {
          console.log(`   ✅ Permiso agregado exitosamente`);
        }
      }
    }

    // 4. Verificar también el permiso de reabrir admisiones
    console.log('\n\n🔍 Verificando permiso de reabrir admisiones...\n');

    const { data: reopenPermission, error: reopenCheckError } = await supabase
      .from('permissions')
      .select('*')
      .eq('name', 'reopen_admissions')
      .single();

    if (reopenCheckError && reopenCheckError.code !== 'PGRST116') {
      console.error('❌ Error al verificar permiso:', reopenCheckError);
      return;
    }

    let reopenPermissionId;

    if (!reopenPermission) {
      console.log('❌ Permiso "reopen_admissions" NO existe');
      console.log('✅ Creando permiso...\n');

      const { data: newReopenPermission, error: createReopenError } = await supabase
        .from('permissions')
        .insert({
          name: 'reopen_admissions',
          description: 'Reabrir admisiones cerradas de historias clínicas',
          category: 'medical_records'
        })
        .select()
        .single();

      if (createReopenError) {
        console.error('❌ Error al crear permiso:', createReopenError);
        return;
      }

      reopenPermissionId = newReopenPermission.id;
      console.log('✅ Permiso creado:', newReopenPermission);
    } else {
      console.log('✅ Permiso "reopen_admissions" ya existe');
      reopenPermissionId = reopenPermission.id;
    }

    // Agregar permiso de reabrir a los roles
    for (const role of roles) {
      console.log(`\n🔍 Verificando permiso reopen para rol: ${role.name}`);

      const { data: roleReopenPermissions, error: rrpError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', role.id)
        .eq('permission_id', reopenPermissionId);

      if (rrpError) {
        console.error(`   ❌ Error al verificar permisos del rol:`, rrpError);
        continue;
      }

      if (roleReopenPermissions && roleReopenPermissions.length > 0) {
        console.log(`   ✅ El rol ya tiene el permiso`);
      } else {
        console.log(`   ❌ El rol NO tiene el permiso`);
        console.log(`   ➕ Agregando permiso...`);

        const { error: addReopenError } = await supabase
          .from('role_permissions')
          .insert({
            role_id: role.id,
            permission_id: reopenPermissionId
          });

        if (addReopenError) {
          console.error(`   ❌ Error al agregar permiso:`, addReopenError);
        } else {
          console.log(`   ✅ Permiso agregado exitosamente`);
        }
      }
    }

    console.log('\n\n✅ Verificación completada');
    console.log('\n📝 IMPORTANTE: Los usuarios deben cerrar sesión y volver a iniciar para que los permisos se actualicen.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkAndAddCloseAdmissionPermissions();
