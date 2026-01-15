import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function cleanupDeletedTenants() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'consentimientos_db',
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a base de datos establecida\n');

    // 1. Ver tenants eliminados (soft deleted)
    console.log('🔍 Buscando tenants eliminados (soft deleted)...');
    const deletedTenants = await dataSource.query(`
      SELECT id, name, slug, "deleted_at"
      FROM tenants
      WHERE "deleted_at" IS NOT NULL
      ORDER BY "deleted_at" DESC
    `);

    if (deletedTenants.length === 0) {
      console.log('✅ No hay tenants eliminados\n');
    } else {
      console.log(`⚠️  Encontrados ${deletedTenants.length} tenants eliminados:`);
      console.table(deletedTenants);
    }

    // 2. Ver usuarios de tenants eliminados
    console.log('\n🔍 Buscando usuarios de tenants eliminados...');
    const orphanUsers = await dataSource.query(`
      SELECT u.id, u.name, u.email, u."tenantId", t.slug as tenant_slug
      FROM users u
      LEFT JOIN tenants t ON t.id = u."tenantId"
      WHERE u."tenantId" IS NOT NULL 
        AND t."deleted_at" IS NOT NULL
        AND u."deleted_at" IS NULL
    `);

    if (orphanUsers.length === 0) {
      console.log('✅ No hay usuarios huérfanos\n');
    } else {
      console.log(`⚠️  Encontrados ${orphanUsers.length} usuarios de tenants eliminados:`);
      console.table(orphanUsers);
    }

    // 3. Ver sedes de tenants eliminados
    console.log('\n🔍 Buscando sedes de tenants eliminados...');
    const orphanBranches = await dataSource.query(`
      SELECT b.id, b.name, b."tenantId", t.slug as tenant_slug
      FROM branches b
      LEFT JOIN tenants t ON t.id = b."tenantId"
      WHERE b."tenantId" IS NOT NULL 
        AND t."deleted_at" IS NOT NULL
        AND b."deleted_at" IS NULL
    `);

    if (orphanBranches.length === 0) {
      console.log('✅ No hay sedes huérfanas\n');
    } else {
      console.log(`⚠️  Encontradas ${orphanBranches.length} sedes de tenants eliminados:`);
      console.table(orphanBranches);
    }

    // 4. Ver servicios de tenants eliminados
    console.log('\n🔍 Buscando servicios de tenants eliminados...');
    const orphanServices = await dataSource.query(`
      SELECT s.id, s.name, s."tenantId", t.slug as tenant_slug
      FROM services s
      LEFT JOIN tenants t ON t.id = s."tenantId"
      WHERE s."tenantId" IS NOT NULL 
        AND t."deleted_at" IS NOT NULL
        AND s."deleted_at" IS NULL
    `);

    if (orphanServices.length === 0) {
      console.log('✅ No hay servicios huérfanos\n');
    } else {
      console.log(`⚠️  Encontrados ${orphanServices.length} servicios de tenants eliminados:`);
      console.table(orphanServices);
    }

    // 5. Ver consentimientos de tenants eliminados
    console.log('\n🔍 Buscando consentimientos de tenants eliminados...');
    const orphanConsents = await dataSource.query(`
      SELECT c.id, c.client_name, c."tenantId", t.slug as tenant_slug
      FROM consents c
      LEFT JOIN tenants t ON t.id = c."tenantId"
      WHERE c."tenantId" IS NOT NULL 
        AND t."deleted_at" IS NOT NULL
        AND c."deleted_at" IS NULL
      LIMIT 10
    `);

    if (orphanConsents.length === 0) {
      console.log('✅ No hay consentimientos huérfanos\n');
    } else {
      console.log(`⚠️  Encontrados consentimientos de tenants eliminados (mostrando primeros 10):`);
      console.table(orphanConsents);
    }

    // 6. Ver settings de tenants eliminados
    console.log('\n🔍 Buscando settings de tenants eliminados...');
    const orphanSettings = await dataSource.query(`
      SELECT s.id, s.key, s."tenantId", t.slug as tenant_slug
      FROM app_settings s
      LEFT JOIN tenants t ON t.id = s."tenantId"
      WHERE s."tenantId" IS NOT NULL 
        AND t."deleted_at" IS NOT NULL
      LIMIT 10
    `);

    if (orphanSettings.length === 0) {
      console.log('✅ No hay settings huérfanos\n');
    } else {
      console.log(`⚠️  Encontrados settings de tenants eliminados (mostrando primeros 10):`);
      console.table(orphanSettings);
    }

    // Si se pasa --confirm, hacer limpieza completa
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  INICIANDO LIMPIEZA COMPLETA...\n');

      // Eliminar usuarios huérfanos
      if (orphanUsers.length > 0) {
        console.log('🗑️  Eliminando usuarios huérfanos...');
        for (const user of orphanUsers) {
          await dataSource.query(`UPDATE users SET "deleted_at" = NOW() WHERE id = $1`, [user.id]);
        }
        console.log(`   ✅ ${orphanUsers.length} usuarios eliminados`);
      }

      // Eliminar sedes huérfanas
      if (orphanBranches.length > 0) {
        console.log('🗑️  Eliminando sedes huérfanas...');
        for (const branch of orphanBranches) {
          await dataSource.query(`UPDATE branches SET "deleted_at" = NOW() WHERE id = $1`, [branch.id]);
        }
        console.log(`   ✅ ${orphanBranches.length} sedes eliminadas`);
      }

      // Eliminar servicios huérfanos
      if (orphanServices.length > 0) {
        console.log('🗑️  Eliminando servicios huérfanos...');
        for (const service of orphanServices) {
          await dataSource.query(`UPDATE services SET "deleted_at" = NOW() WHERE id = $1`, [service.id]);
        }
        console.log(`   ✅ ${orphanServices.length} servicios eliminados`);
      }

      // Eliminar consentimientos huérfanos (todos, no solo los primeros 10)
      const allOrphanConsents = await dataSource.query(`
        SELECT c.id
        FROM consents c
        LEFT JOIN tenants t ON t.id = c."tenantId"
        WHERE c."tenantId" IS NOT NULL 
          AND t."deleted_at" IS NOT NULL
          AND c."deleted_at" IS NULL
      `);

      if (allOrphanConsents.length > 0) {
        console.log('🗑️  Eliminando consentimientos huérfanos...');
        for (const consent of allOrphanConsents) {
          await dataSource.query(`UPDATE consents SET "deleted_at" = NOW() WHERE id = $1`, [consent.id]);
        }
        console.log(`   ✅ ${allOrphanConsents.length} consentimientos eliminados`);
      }

      // Eliminar settings huérfanos (todos, no solo los primeros 10)
      const allOrphanSettings = await dataSource.query(`
        SELECT s.id
        FROM app_settings s
        LEFT JOIN tenants t ON t.id = s."tenantId"
        WHERE s."tenantId" IS NOT NULL 
          AND t."deleted_at" IS NOT NULL
      `);

      if (allOrphanSettings.length > 0) {
        console.log('🗑️  Eliminando settings huérfanos...');
        for (const setting of allOrphanSettings) {
          await dataSource.query(`DELETE FROM app_settings WHERE id = $1`, [setting.id]);
        }
        console.log(`   ✅ ${allOrphanSettings.length} settings eliminados`);
      }

      console.log('\n✅ LIMPIEZA COMPLETADA\n');
    } else {
      console.log('\n⚠️  Para ejecutar la limpieza, usa: npx ts-node cleanup-deleted-tenants.ts --confirm\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

cleanupDeletedTenants();
