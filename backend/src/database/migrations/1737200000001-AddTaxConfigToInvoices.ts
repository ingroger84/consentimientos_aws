import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTaxConfigToInvoices1737200000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna taxConfigId
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'taxConfigId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Agregar foreign key
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['taxConfigId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tax_configs',
        onDelete: 'SET NULL',
      }),
    );

    // Actualizar facturas existentes con el impuesto por defecto
    await queryRunner.query(`
      UPDATE invoices
      SET "taxConfigId" = (
        SELECT id FROM tax_configs WHERE "isDefault" = true LIMIT 1
      )
      WHERE "taxConfigId" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('invoices');
    const foreignKey = table.foreignKeys.find(
      fk => fk.columnNames.indexOf('taxConfigId') !== -1,
    );
    
    if (foreignKey) {
      await queryRunner.dropForeignKey('invoices', foreignKey);
    }
    
    await queryRunner.dropColumn('invoices', 'taxConfigId');
  }
}
