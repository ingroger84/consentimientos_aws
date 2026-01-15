import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTaxConfigTable1737200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tax_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'applicationType',
            type: 'enum',
            enum: ['included', 'additional'],
            default: "'additional'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índice para búsquedas rápidas
    await queryRunner.createIndex(
      'tax_configs',
      new TableIndex({
        name: 'IDX_TAX_CONFIG_DEFAULT',
        columnNames: ['isDefault', 'isActive'],
      }),
    );

    // Insertar configuración de impuesto por defecto (IVA Colombia 19%)
    await queryRunner.query(`
      INSERT INTO tax_configs (name, rate, "applicationType", "isActive", "isDefault", description)
      VALUES ('IVA 19%', 19.00, 'additional', true, true, 'Impuesto al Valor Agregado estándar en Colombia')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tax_configs', 'IDX_TAX_CONFIG_DEFAULT');
    await queryRunner.dropTable('tax_configs');
  }
}
