import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function cleanupOrphanUsers() {
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

    // 1. Buscar usuarios huérfanos (con tenantId que no existe o fue eliminado)
    console.log('🔍 Buscando usuarios huérfanos...');
    const orphanUsers = await dataSource.query(`
      SELECT u.id, u.name, u.email, u."tenantId"
      FROM users u
      LEFT JOIN tenants t ON t.id = u."tenantId"
      WHERE u."tenantId" IS NOT NULL 
        AND (t.id IS NULL OR t."deleted_at" IS NOT NULL)
        AND u."deleted_at" IS NULL
    `);

    if (orphanUsers.length === 0) {
      console.log('✅ No se encontraron usuarios huérfanos');
    } else {
      console.log(`⚠️  Encontrados ${orphanUsers.length} usuarios huérfanos:`);
      console.table(orphanUsers);

      // 2. Preguntar si desea eliminarlos
      console.log('\n¿Deseas eliminar estos usuarios? (Se hará soft delete)');
      console.log('Ejecuta: npm run cleanup:orphans -- --confirm\n');

      // Si se pasa --confirm, eliminar
      if (process.argv.includes('--confirm')) {
        console.log('🗑️  Eliminando usuarios huérfanos...');
        
        for (const user of orphanUsers) {
          await dataSource.query(`
            UPDATE users 
            SET "deleted_at" = NOW() 
            WHERE id = $1
          `, [user.id]);
          console.log(`   ✅ Usuario eliminado: ${user.email}`);
        }

        console.log('\n✅ Limpieza completada');
      }
    }

    // 3. Buscar usuarios duplicados por email
    console.log('\n🔍 Buscando emails duplicados...');
    const duplicateEmails = await dataSource.query(`
      SELECT email, COUNT(*) as count
      FROM users
      WHERE "deleted_at" IS NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicateEmails.length === 0) {
      console.log('✅ No se encontraron emails duplicados');
    } else {
      console.log(`⚠️  Encontrados ${duplicateEmails.length} emails duplicados:`);
      console.table(duplicateEmails);

      // Mostrar detalles de cada duplicado
      for (const dup of duplicateEmails) {
        const users = await dataSource.query(`
          SELECT id, name, email, "tenantId", "created_at"
          FROM users
          WHERE email = $1 AND "deleted_at" IS NULL
          ORDER BY "created_at" ASC
        `, [dup.email]);
        
        console.log(`\n📧 Email: ${dup.email}`);
        console.table(users);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

cleanupOrphanUsers();
