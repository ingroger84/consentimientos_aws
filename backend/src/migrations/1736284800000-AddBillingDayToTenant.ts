import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBillingDayToTenant1736284800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna billing_day
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'billing_day',
        type: 'int',
        default: 1,
        comment: 'Día del mes para corte de facturación (1-28)',
      }),
    );

    // Actualizar tenants existentes con el día actual (limitado a 28)
    const currentDay = new Date().getDate();
    const billingDay = Math.min(currentDay, 28);
    
    await queryRunner.query(
      `UPDATE tenants SET billing_day = ${billingDay} WHERE billing_day IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tenants', 'billing_day');
  }
}
