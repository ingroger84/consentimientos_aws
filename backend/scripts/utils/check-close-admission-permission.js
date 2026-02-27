const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCloseAdmissionPermission() {
  try {
    console.log('🔍 Verificando permisos de cerrar admisiones...\n');

    // 1. Verificar si existe el permiso
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .ilike('name', '%admission%');

    if (permError) {
      console.error('❌ Error al obtener permisos:', permError);
      return;
    }

    console.log('📋 Permisos relacionados con admisiones:');
    permissions.forEach(p => {
      console.log(`  - ${p.name} (${p.resource}:${p.action})`);
    });

    // 2. Verificar permisos de todos los roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, permissions');

    if (rolesError) {
      console.error('❌ Error al obtener roles:', rolesError);
      return;
    }

    console.log('\n🎭 Permisos por rol:');
    for (const role of roles) {
      console.log(`\n  ${role.name}:`);
      const closeAdmissionPerms = role.permissions.filter(p => 
        p.includes('admission') && p.includes('close')
      );
      
      if (closeAdmissionPerms.length > 0) {
        console.log(`    ✅ Tiene permisos de cerrar admisiones:`, closeAdmissionPerms);
      } else {
        console.log(`    ❌ NO tiene permisos de cerrar admisiones`);
        console.log(`    Permisos actuales (${role.permissions.length}):`, 
          role.permissions.filter(p => p.includes('admission')).slice(0, 5)
        );
      }
    }

    // 3. Buscar el permiso específico
    const closeAdmissionPerm = permissions.find(p => 
      p.name === 'close_admissions' || 
      p.action === 'close' && p.resource === 'admissions'
    );

    if (!closeAdmissionPerm) {
      console.log('\n⚠️  El permiso "close_admissions" NO existe en la base de datos');
      console.log('   Necesitamos crearlo...');
    } else {
      console.log('\n✅ El permiso existe:', closeAdmissionPerm);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCloseAdmissionPermission();
