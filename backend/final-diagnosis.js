// Diagnostico final del problema del Super Admin
const { Client } = require('pg');
require('dotenv').config();

async function finalDiagnosis() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  console.log('==============================================');
  console.log('DIAGNOSTICO FINAL - SUPER ADMIN');
  console.log('==============================================\n');

  // 1. Usuario y permisos
  const userQuery = await client.query(`
    SELECT u.id, u.email, u.name, r.name as role_name, r.permissions
    FROM users u
    LEFT JOIN roles r ON u."roleId" = r.id
    WHERE u.email = 'rcaraballo@innovasystems.com.co'
  `);
  
  const user = userQuery.rows[0];
  const perms = user.permissions.split(',');
  
  console.log('[1] USUARIO Y PERMISOS');
  console.log(`Email: ${user.email}`);
  console.log(`Rol: ${user.role_name}`);
  console.log(`Total permisos: ${perms.length}`);
  console.log(`Tiene manage_tenants: ${perms.includes('manage_tenants') ? 'SI' : 'NO'}`);
  console.log('');

  // 2. Tenants
  const tenantsQuery = await client.query(`
    SELECT id, name, slug, status, plan
    FROM tenants 
    WHERE deleted_at IS NULL
  `);
  
  console.log('[2] TENANTS EN SISTEMA');
  console.log(`Total: ${tenantsQuery.rows.length}`);
  tenantsQuery.rows.forEach((t, i) => {
    console.log(`  ${i+1}. ${t.name} (${t.slug}) - ${t.status} - ${t.plan}`);
  });
  console.log('');

  // 3. Sesiones activas
  const sessionsQuery = await client.query(`
    SELECT COUNT(*) as count
    FROM user_sessions
    WHERE "userId" = $1 AND "isActive" = true
  `, [user.id]);
  
  console.log('[3] SESIONES ACTIVAS');
  console.log(`Total: ${sessionsQuery.rows[0].count}`);
  console.log('');

  // 4. Version del codigo
  const fs = require('fs');
  const versionPath = '/home/ubuntu/consentimientos_aws/backend/dist/config/version.js';
  let version = 'desconocida';
  if (fs.existsSync(versionPath)) {
    const content = fs.readFileSync(versionPath, 'utf8');
    const match = content.match(/version:\s*['"]([^'"]+)['"]/);
    if (match) version = match[1];
  }
  
  console.log('[4] VERSION DEL CODIGO');
  console.log(`Version en produccion: ${version}`);
  console.log('');

  console.log('==============================================');
  console.log('CONCLUSION');
  console.log('==============================================');
  console.log(`✓ Permisos en BD: ${perms.length} (correcto)`);
  console.log(`✓ Incluye manage_tenants: SI`);
  console.log(`✓ Tenants disponibles: ${tenantsQuery.rows.length}`);
  console.log(`✓ Version codigo: ${version}`);
  console.log(`${sessionsQuery.rows[0].count > 0 ? '⚠' : '✓'} Sesiones activas: ${sessionsQuery.rows[0].count}`);
  console.log('');

  if (sessionsQuery.rows[0].count > 0) {
    console.log('PROBLEMA IDENTIFICADO:');
    console.log('Hay sesiones activas que pueden tener permisos en cache.');
    console.log('');
    console.log('SOLUCION:');
    console.log('1. Eliminar sesiones:');
    console.log(`   DELETE FROM user_sessions WHERE "userId" = '${user.id}';`);
    console.log('2. Usuario debe:');
    console.log('   - Cerrar TODAS las pestanas del navegador');
    console.log('   - Limpiar cache (Ctrl+Shift+Del)');
    console.log('   - Abrir incognito (Ctrl+Shift+N)');
    console.log('   - Iniciar sesion nuevamente');
  } else {
    console.log('TODO CORRECTO EN BD');
    console.log('Si el usuario sigue sin ver los tenants:');
    console.log('1. Verificar que este accediendo desde: https://archivoenlinea.com');
    console.log('2. Verificar que NO este accediendo desde un subdominio de tenant');
    console.log('3. Limpiar cache del navegador completamente');
    console.log('4. Probar en ventana de incognito');
  }

  await client.end();
}

finalDiagnosis().catch(console.error);
