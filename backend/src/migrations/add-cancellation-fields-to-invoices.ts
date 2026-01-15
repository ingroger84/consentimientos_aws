import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCancellationFieldsToInvoices1704672000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'cancellationReason',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'cancelledAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('invoices', 'cancelledAt');
    await queryRunner.dropColumn('invoices', 'cancellationReason');
  }
}
