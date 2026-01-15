import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantToAppSettings1736070000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna ya existe
    const table = await queryRunner.getTable('app_settings');
    const hasColumn = table?.findColumnByName('tenantId');

    if (!hasColumn) {
      // Agregar columna tenantId a app_settings
      await queryRunner.query(`
        ALTER TABLE "app_settings" 
        ADD COLUMN "tenantId" uuid
      `);
    }

    // Verificar si la foreign key ya existe
    const hasForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('tenantId'));
    
    if (!hasForeignKey) {
      // Agregar foreign key a tenants
      await queryRunner.query(`
        ALTER TABLE "app_settings" 
        ADD CONSTRAINT "FK_app_settings_tenant" 
        FOREIGN KEY ("tenantId") 
        REFERENCES "tenants"("id") 
        ON DELETE CASCADE
      `);
    }

    // Eliminar la constraint única en 'key' si existe
    await queryRunner.query(`
      ALTER TABLE "app_settings" 
      DROP CONSTRAINT IF EXISTS "UQ_app_settings_key"
    `);

    // Verificar si el índice ya existe antes de crearlo
    const hasUniqueIndex = await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'IDX_app_settings_key_tenant'
    `);

    if (hasUniqueIndex.length === 0) {
      // Crear índice único compuesto (key + tenantId)
      await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_app_settings_key_tenant" 
        ON "app_settings" ("key", "tenantId")
      `);
    }

    // Verificar si el índice de tenant ya existe
    const hasTenantIndex = await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'IDX_app_settings_tenant'
    `);

    if (hasTenantIndex.length === 0) {
      // También crear índice para búsquedas por tenant
      await queryRunner.query(`
        CREATE INDEX "IDX_app_settings_tenant" 
        ON "app_settings" ("tenantId")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_app_settings_tenant"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_app_settings_key_tenant"
    `);

    // Eliminar foreign key
    await queryRunner.query(`
      ALTER TABLE "app_settings" 
      DROP CONSTRAINT IF EXISTS "FK_app_settings_tenant"
    `);

    // Eliminar columna
    await queryRunner.query(`
      ALTER TABLE "app_settings" 
      DROP COLUMN IF EXISTS "tenantId"
    `);

    // Restaurar constraint única en key
    await queryRunner.query(`
      ALTER TABLE "app_settings" 
      ADD CONSTRAINT "UQ_app_settings_key" 
      UNIQUE ("key")
    `);
  }
}
