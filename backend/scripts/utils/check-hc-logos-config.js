require('dotenv').config();
const { Client } = require('pg');

async function checkHCLogosConfig() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'consentimientos',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Buscar el tenant demo-medico
    console.log('=== VERIFICANDO CONFIGURACIÓN DE LOGOS HC ===\n');
    const tenantResult = await client.query(`
      SELECT id, name, slug
      FROM tenants
      WHERE slug = 'demo-medico'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant demo-medico no encontrado');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`ID: ${tenant.id}\n`);

    // Buscar configuración de logos
    console.log('=== CONFIGURACIÓN DE LOGOS ===\n');
    
    const logosResult = await client.query(`
      SELECT key, value
      FROM app_settings
      WHERE "tenantId" = $1
      AND key IN (
        'logoUrl', 'footerLogoUrl', 'watermarkLogoUrl',
        'hcLogoUrl', 'hcFooterLogoUrl', 'hcWatermarkLogoUrl'
      )
      ORDER BY key
    `, [tenant.id]);

    if (logosResult.rows.length === 0) {
      console.log('❌ No se encontró configuración de logos');
      console.log('\nPara configurar los logos:');
      console.log('  1. Ve a Configuración en el frontend');
      console.log('  2. Sube los logos en la sección "Logos HC"');
      console.log('  3. Guarda los cambios\n');
      return;
    }

    console.log('Configuración encontrada:\n');
    
    const logos = {
      logoUrl: null,
      footerLogoUrl: null,
      watermarkLogoUrl: null,
      hcLogoUrl: null,
      hcFooterLogoUrl: null,
      hcWatermarkLogoUrl: null,
    };

    logosResult.rows.forEach(row => {
      logos[row.key] = row.value;
      const status = row.value ? '✓ Configurado' : '✗ No configurado';
      console.log(`  ${row.key}: ${status}`);
      if (row.value) {
        console.log(`    URL: ${row.value.substring(0, 80)}...`);
      }
      console.log('');
    });

    // Verificar qué logos se usarán en el PDF
    console.log('=== LOGOS QUE SE USARÁN EN EL PDF HC ===\n');
    
    const finalLogoUrl = logos.hcLogoUrl || logos.logoUrl;
    const finalFooterLogoUrl = logos.hcFooterLogoUrl || logos.footerLogoUrl;
    const finalWatermarkLogoUrl = logos.hcWatermarkLogoUrl || logos.watermarkLogoUrl;

    console.log('Logo principal (header):');
    if (finalLogoUrl) {
      console.log(`  ✓ ${logos.hcLogoUrl ? 'Logo HC específico' : 'Logo general'}`);
      console.log(`  URL: ${finalLogoUrl.substring(0, 80)}...`);
    } else {
      console.log('  ✗ No configurado');
    }
    console.log('');

    console.log('Logo footer:');
    if (finalFooterLogoUrl) {
      console.log(`  ✓ ${logos.hcFooterLogoUrl ? 'Logo HC específico' : 'Logo general'}`);
      console.log(`  URL: ${finalFooterLogoUrl.substring(0, 80)}...`);
    } else {
      console.log('  ✗ No configurado');
    }
    console.log('');

    console.log('Marca de agua:');
    if (finalWatermarkLogoUrl) {
      console.log(`  ✓ ${logos.hcWatermarkLogoUrl ? 'Logo HC específico' : 'Logo general'}`);
      console.log(`  URL: ${finalWatermarkLogoUrl.substring(0, 80)}...`);
    } else {
      console.log('  ✗ No configurado');
    }
    console.log('');

    // Resumen
    console.log('=== RESUMEN ===\n');
    
    if (!finalLogoUrl && !finalFooterLogoUrl && !finalWatermarkLogoUrl) {
      console.log('❌ NO hay logos configurados');
      console.log('\nEl PDF se generará sin logos.');
      console.log('\nPara agregar logos:');
      console.log('  1. Ve a Configuración → Logos HC');
      console.log('  2. Sube los logos que desees usar');
      console.log('  3. Guarda los cambios');
      console.log('  4. Genera un nuevo consentimiento\n');
    } else {
      console.log('✓ Hay logos configurados');
      console.log('\nLogos disponibles:');
      if (finalLogoUrl) console.log('  ✓ Logo principal (header)');
      if (finalFooterLogoUrl) console.log('  ✓ Logo footer');
      if (finalWatermarkLogoUrl) console.log('  ✓ Marca de agua');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkHCLogosConfig();
