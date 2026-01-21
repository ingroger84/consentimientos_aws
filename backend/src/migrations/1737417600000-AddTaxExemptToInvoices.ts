import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTaxExemptToInvoices1737417600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna taxExempt
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'taxExempt',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Agregar columna taxExemptReason
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'taxExemptReason',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('invoices', 'taxExemptReason');
    await queryRunner.dropColumn('invoices', 'taxExempt');
  }
}
