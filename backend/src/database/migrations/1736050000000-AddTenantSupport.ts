import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantSupport1736050000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla tenants
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "logo" varchar,
        "status" varchar NOT NULL DEFAULT 'trial',
        "plan" varchar NOT NULL DEFAULT 'free',
        "contactName" varchar,
        "contactEmail" varchar,
        "contactPhone" varchar,
        "maxUsers" integer NOT NULL DEFAULT 100,
        "maxConsents" integer NOT NULL DEFAULT 1000,
        "maxBranches" integer NOT NULL DEFAULT 10,
        "trialEndsAt" timestamp,
        "subscriptionEndsAt" timestamp,
        "settings" jsonb,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      )
    `);

    // Agregar columna tenantId a users
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "tenantId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_tenant"
      FOREIGN KEY ("tenantId")
      REFERENCES "tenants"("id")
      ON DELETE SET NULL
    `);

    // Agregar columna tenantId a branches
    await queryRunner.query(`
      ALTER TABLE "branches" 
      ADD COLUMN "tenantId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "branches"
      ADD CONSTRAINT "FK_branches_tenant"
      FOREIGN KEY ("tenantId")
      REFERENCES "tenants"("id")
      ON DELETE SET NULL
    `);

    // Agregar columna tenantId a services
    await queryRunner.query(`
      ALTER TABLE "services" 
      ADD COLUMN "tenantId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "services"
      ADD CONSTRAINT "FK_services_tenant"
      FOREIGN KEY ("tenantId")
      REFERENCES "tenants"("id")
      ON DELETE SET NULL
    `);

    // Agregar columna tenantId a consents
    await queryRunner.query(`
      ALTER TABLE "consents" 
      ADD COLUMN "tenantId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "consents"
      ADD CONSTRAINT "FK_consents_tenant"
      FOREIGN KEY ("tenantId")
      REFERENCES "tenants"("id")
      ON DELETE SET NULL
    `);

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX "IDX_users_tenant" ON "users" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_branches_tenant" ON "branches" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_services_tenant" ON "services" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_consents_tenant" ON "consents" ("tenantId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_consents_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_services_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_branches_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_users_tenant"`);

    // Eliminar foreign keys
    await queryRunner.query(`ALTER TABLE "consents" DROP CONSTRAINT "FK_consents_tenant"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_tenant"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_branches_tenant"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenant"`);

    // Eliminar columnas
    await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "tenantId"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tenantId"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "tenantId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`);

    // Eliminar tabla tenants
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
