import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanFieldsToTenants1704900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columnas de plan
    await queryRunner.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS max_services INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS max_questions INTEGER DEFAULT 5,
      ADD COLUMN IF NOT EXISTS storage_limit_mb INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true
    `);

    // Actualizar tenants existentes con valores del plan free
    await queryRunner.query(`
      UPDATE tenants 
      SET 
        plan = 'free',
        plan_price = 0,
        max_users = 2,
        max_branches = 1,
        max_consents = 50,
        max_services = 3,
        max_questions = 5,
        storage_limit_mb = 100,
        features = '{"watermark": true, "customization": false, "api_access": false, "priority_support": false}'::jsonb
      WHERE plan IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenants 
      DROP COLUMN IF EXISTS plan,
      DROP COLUMN IF EXISTS plan_price,
      DROP COLUMN IF EXISTS billing_cycle,
      DROP COLUMN IF EXISTS plan_started_at,
      DROP COLUMN IF EXISTS plan_expires_at,
      DROP COLUMN IF EXISTS max_services,
      DROP COLUMN IF EXISTS max_questions,
      DROP COLUMN IF EXISTS storage_limit_mb,
      DROP COLUMN IF EXISTS features,
      DROP COLUMN IF EXISTS auto_renew
    `);
  }
}
