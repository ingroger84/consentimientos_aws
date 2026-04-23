require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function assignBranchCodes() {
  try {
    console.log('🔄 Asignando códigos de sucursal a tenants...\n');
    
    // Obtener tenants sin código asignado
    const result = await pool.query(`
      SELECT id, name, slug
      FROM tenants
      WHERE deleted_at IS NULL
        AND dynamiaerp_branch_code IS NULL
      ORDER BY created_at
    `);
    
    if (result.rows.length === 0) {
      console.log('✅ Todos los tenants ya tienen código de sucursal asignado');
      return;
    }
    
    console.log(`📋 Tenants sin código: ${result.rows.length}\n`);
    
    // Obtener el último código asignado
    const lastCodeResult = await pool.query(`
      SELECT COALESCE(MAX(CAST(dynamiaerp_branch_code AS INTEGER)), 0) as last_code
      FROM tenants
      WHERE dynamiaerp_branch_code IS NOT NULL
    `);
    
    let nextCode = lastCodeResult.rows[0].last_code + 1;
    
    // Asignar códigos
    for (const tenant of result.rows) {
      const formattedCode = String(nextCode).padStart(3, '0');
      
      await pool.query(`
        UPDATE tenants
        SET dynamiaerp_branch_code = $1
        WHERE id = $2
      `, [formattedCode, tenant.id]);
      
      console.log(`   ✅ ${tenant.name} (${tenant.slug}): ${formattedCode}`);
      nextCode++;
    }
    
    console.log('\n✅ Códigos asignados exitosamente\n');
    
    // Verificar todos los tenants
    console.log('📋 Todos los tenants:\n');
    const allTenants = await pool.query(`
      SELECT 
        name,
        slug,
        dynamiaerp_branch_code,
        dynamiaerp_last_invoice_number
      FROM tenants
      WHERE deleted_at IS NULL
      ORDER BY dynamiaerp_branch_code
    `);
    
    allTenants.rows.forEach(row => {
      console.log(`   ${row.dynamiaerp_branch_code}: ${row.name} (${row.slug}) - Último consecutivo: ${row.dynamiaerp_last_invoice_number}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

assignBranchCodes();
