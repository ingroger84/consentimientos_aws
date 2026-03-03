/**
 * Script para asegurar que todos los perfiles tengan un código único
 * Este script se ejecuta en producción para actualizar perfiles existentes
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Mapeo de nombres a códigos
const PROFILE_CODE_MAP = {
  'Super Administrador': 'super_admin',
  'Administrador General': 'admin_general',
  'Administrador de Sede': 'admin_sede',
  'Operador': 'operador',
  'Solo Lectura': 'solo_lectura',
};

async function ensureProfileCodes() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando códigos de perfiles...\n');

    // Verificar si la columna 'code' existe
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'code'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('⚠️  La columna "code" no existe en la tabla profiles');
      console.log('📝 Creando columna "code"...');
      
      await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE
      `);
      
      console.log('✅ Columna "code" creada\n');
    }

    // Obtener todos los perfiles
    const result = await client.query(`
      SELECT id, name, code, is_system 
      FROM profiles 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    console.log(`📊 Perfiles encontrados: ${result.rows.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const profile of result.rows) {
      // Si ya tiene código, saltar
      if (profile.code) {
        console.log(`⏭️  ${profile.name}: Ya tiene código "${profile.code}"`);
        skipped++;
        continue;
      }

      // Buscar código en el mapeo
      let code = PROFILE_CODE_MAP[profile.name];

      // Si no está en el mapeo, generar código desde el nombre
      if (!code) {
        code = profile.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/[^a-z0-9]+/g, '_') // Reemplazar espacios y caracteres especiales con _
          .replace(/^_+|_+$/g, ''); // Remover _ al inicio y final
      }

      // Actualizar perfil con el código
      await client.query(
        'UPDATE profiles SET code = $1 WHERE id = $2',
        [code, profile.id]
      );

      console.log(`✅ ${profile.name}: Código asignado "${code}"`);
      updated++;
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   - Actualizados: ${updated}`);
    console.log(`   - Omitidos: ${skipped}`);
    console.log(`   - Total: ${result.rows.length}`);

    // Verificar resultado final
    const finalResult = await client.query(`
      SELECT name, code, is_system 
      FROM profiles 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    console.log(`\n📋 Estado final de perfiles:`);
    finalResult.rows.forEach(p => {
      const badge = p.is_system ? '[SISTEMA]' : '[CUSTOM]';
      console.log(`   ${badge} ${p.name}: ${p.code}`);
    });

    console.log('\n✅ Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
ensureProfileCodes().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
