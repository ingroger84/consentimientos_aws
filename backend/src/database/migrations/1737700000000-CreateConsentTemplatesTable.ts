import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateConsentTemplatesTable1737700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'consent_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['procedure', 'data_treatment', 'image_rights'],
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
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

    // Foreign key to tenants
    await queryRunner.createForeignKey(
      'consent_templates',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX "IDX_consent_templates_tenant" ON "consent_templates" ("tenantId");
      CREATE INDEX "IDX_consent_templates_type" ON "consent_templates" ("type");
      CREATE INDEX "IDX_consent_templates_active" ON "consent_templates" ("isActive");
      CREATE INDEX "IDX_consent_templates_default" ON "consent_templates" ("isDefault");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('consent_templates');
  }
}
