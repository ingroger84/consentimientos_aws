/**
 * Script para crear datos iniciales en Supabase
 * - Roles y permisos
 * - Usuario super admin
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function seedDatabase() {
  log('\n' + '='.repeat(70), colors.cyan);
  log('🌱 CREANDO DATOS INICIALES EN SUPABASE', colors.cyan);
  log('='.repeat(70) + '\n', colors.cyan);
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    await client.connect();
    log('✅ Conectado a Supabase\n', colors.green);
    
    // 1. Crear roles
    log('📋 Paso 1: Creando roles...', colors.yellow);
    
    const roles = [
      { name: 'super_admin', type: 'super_admin', description: 'Super Administrador del sistema', permissions: [] },
      { name: 'admin', type: 'ADMIN_GENERAL', description: 'Administrador del tenant', permissions: [] },
      { name: 'operador', type: 'OPERADOR', description: 'Operador del sistema', permissions: [] },
      { name: 'admin_sede', type: 'ADMIN_SEDE', description: 'Administrador de sede', permissions: [] },
    ];
    
    for (const role of roles) {
      const result = await client.query(
        `INSERT INTO roles (name, type, description, permissions, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         ON CONFLICT (name) DO NOTHING 
         RETURNING id`,
        [role.name, role.type, role.description, JSON.stringify(role.permissions)]
      );
      
      if (result.rows.length > 0) {
        log(`  ✅ Rol creado: ${role.name}`, colors.green);
      } else {
        log(`  ℹ️  Rol ya existe: ${role.name}`, colors.yellow);
      }
    }
    
    // 2. Obtener ID del rol super_admin
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE name = 'super_admin'`
    );
    const superAdminRoleId = roleResult.rows[0].id;
    
    // 3. Crear usuario super admin
    log('\n👤 Paso 2: Creando usuario super admin...', colors.yellow);
    
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'rcaraballo@innovasystems.com.co';
    const superAdminPassword = 'Admin123!'; // Cambiar después del primer login
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    
    const userResult = await client.query(
      `INSERT INTO users (
        email, 
        password, 
        name, 
        "roleId", 
        "isActive", 
        created_at,
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      ON CONFLICT (email) DO NOTHING 
      RETURNING id, email`,
      [
        superAdminEmail,
        hashedPassword,
        'Super Admin',
        superAdminRoleId,
        true
      ]
    );
    
    if (userResult.rows.length > 0) {
      log(`  ✅ Super Admin creado: ${superAdminEmail}`, colors.green);
      log(`  🔑 Password temporal: ${superAdminPassword}`, colors.yellow);
      log(`  ⚠️  IMPORTANTE: Cambiar password después del primer login\n`, colors.red);
    } else {
      log(`  ℹ️  Super Admin ya existe: ${superAdminEmail}\n`, colors.yellow);
    }
    
    // 4. Verificar datos
    log('🔍 Paso 3: Verificando datos...', colors.yellow);
    
    const rolesCount = await client.query('SELECT COUNT(*) FROM roles');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    
    log(`  • Roles: ${rolesCount.rows[0].count}`, colors.reset);
    log(`  • Usuarios: ${usersCount.rows[0].count}\n`, colors.reset);
    
    await client.end();
    
    log('='.repeat(70), colors.cyan);
    log('🎉 DATOS INICIALES CREADOS EXITOSAMENTE', colors.green);
    log('='.repeat(70) + '\n', colors.cyan);
    
    log('📝 Credenciales de acceso:', colors.cyan);
    log(`  Email: ${superAdminEmail}`, colors.reset);
    log(`  Password: ${superAdminPassword}`, colors.reset);
    log(`  ⚠️  Cambiar password después del primer login\n`, colors.yellow);
    
    return true;
    
  } catch (error) {
    log('\n' + '='.repeat(70), colors.cyan);
    log('❌ ERROR AL CREAR DATOS INICIALES', colors.red);
    log('='.repeat(70) + '\n', colors.cyan);
    console.error(error);
    return false;
  }
}

// Ejecutar
(async () => {
  const success = await seedDatabase();
  process.exit(success ? 0 : 1);
})();
