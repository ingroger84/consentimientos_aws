import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTenantSlugUniqueConstraint1736060000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la constraint única existente
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP CONSTRAINT IF EXISTS "UQ_32731f181236a46182a38c992a8"
    `);

    // Crear un índice único parcial que excluye registros eliminados
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tenants_slug_not_deleted" 
      ON "tenants" ("slug") 
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice único parcial
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_tenants_slug_not_deleted"
    `);

    // Restaurar la constraint única original
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      ADD CONSTRAINT "UQ_32731f181236a46182a38c992a8" 
      UNIQUE ("slug")
    `);
  }
}
