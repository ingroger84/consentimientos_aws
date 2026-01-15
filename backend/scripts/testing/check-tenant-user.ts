import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'consentimientos_db',
});

async function checkTenantUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener el slug desde argumentos o usar 'demo' por defecto
    const slug = process.argv[2] || 'demo';
    console.log(`Buscando tenant con slug: "${slug}"\n`);

    // Buscar tenant con el slug especificado
    const tenants = await AppDataSource.query(`
      SELECT id, name, slug, "contactEmail", "contactPhone", status
      FROM tenants
      WHERE slug = $1 AND deleted_at IS NULL
    `, [slug]);

    if (tenants.length === 0) {
      console.log(`❌ No se encontró tenant con slug "${slug}"`);
      console.log('\nTenants disponibles:');
      const allTenants = await AppDataSource.query(`
        SELECT slug, name FROM tenants WHERE deleted_at IS NULL ORDER BY created_at DESC
      `);
      allTenants.forEach((t: any) => {
        console.log(`  - ${t.slug} (${t.name})`);
      });
      console.log('\nUso: npx ts-node check-tenant-user.ts <slug>');
      console.log('Ejemplo: npx ts-node check-tenant-user.ts demo');
      return;
    }

    const tenant = tenants[0];
    console.log('📋 Tenant encontrado:');
    console.log('  ID:', tenant.id);
    console.log('  Nombre:', tenant.name);
    console.log('  Slug:', tenant.slug);
    console.log('  Email contacto:', tenant.contactEmail);
    console.log('  Teléfono:', tenant.contactPhone);
    console.log('  Estado:', tenant.status);
    console.log('');

    // Buscar usuarios del tenant
    const users = await AppDataSource.query(`
      SELECT u.id, u.name, u.email, u."isActive", r.name as role_name, r.type as role_type
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE u."tenantId" = $1 AND u.deleted_at IS NULL
    `, [tenant.id]);

    console.log(`👥 Usuarios del tenant (${users.length}):`);
    users.forEach((user: any) => {
      console.log('  ---');
      console.log('  ID:', user.id);
      console.log('  Nombre:', user.name);
      console.log('  Email:', user.email);
      console.log('  Activo:', user.isActive);
      console.log('  Rol:', user.role_name, `(${user.role_type})`);
    });
    console.log('');

    // Buscar configuración del tenant
    const settings = await AppDataSource.query(`
      SELECT key, value
      FROM app_settings
      WHERE "tenantId" = $1
      ORDER BY key
    `, [tenant.id]);

    console.log(`⚙️ Configuración del tenant (${settings.length} registros):`);
    settings.forEach((setting: any) => {
      const value = setting.value.length > 50 ? setting.value.substring(0, 50) + '...' : setting.value;
      console.log(`  ${setting.key}: ${value}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkTenantUser();
