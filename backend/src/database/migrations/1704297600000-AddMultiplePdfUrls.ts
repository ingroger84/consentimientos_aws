import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMultiplePdfUrls1704297600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('consents');
    
    if (table && !table.findColumnByName('pdf_data_treatment_url')) {
      await queryRunner.addColumn(
        'consents',
        new TableColumn({
          name: 'pdf_data_treatment_url',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (table && !table.findColumnByName('pdf_image_rights_url')) {
      await queryRunner.addColumn(
        'consents',
        new TableColumn({
          name: 'pdf_image_rights_url',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('consents', 'pdf_data_treatment_url');
    await queryRunner.dropColumn('consents', 'pdf_image_rights_url');
  }
}
