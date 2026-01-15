import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAppSettingsUniqueIndex1736080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice único compuesto anterior
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_app_settings_key_tenant"
    `);

    // Crear índice único para registros con tenantId (no NULL)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_app_settings_key_tenant_not_null" 
      ON "app_settings" ("key", "tenantId")
      WHERE "tenantId" IS NOT NULL
    `);

    // Crear índice único para registros sin tenantId (NULL) - Super Admin
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_app_settings_key_tenant_null" 
      ON "app_settings" ("key")
      WHERE "tenantId" IS NULL
    `);

    console.log('✅ Índices únicos parciales creados correctamente');
    console.log('   - Super Admin (tenantId = NULL): UN registro por key');
    console.log('   - Cada Tenant: UN registro por key');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices únicos parciales
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_app_settings_key_tenant_null"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_app_settings_key_tenant_not_null"
    `);

    // Restaurar índice único compuesto original
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_app_settings_key_tenant" 
      ON "app_settings" ("key", "tenantId")
    `);
  }
}
