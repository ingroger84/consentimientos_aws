import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateClientsTable1737680000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla clients
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'],
          },
          {
            name: 'document_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'birth_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'blood_type',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'emergency_contact_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'emergency_contact_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'consents_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_consent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tenant_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índice único para tenant_id + document_type + document_number
    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'IDX_clients_tenant_document',
        columnNames: ['tenant_id', 'document_type', 'document_number'],
        isUnique: true,
      }),
    );

    // Crear índices para búsquedas eficientes
    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'IDX_clients_tenant_email',
        columnNames: ['tenant_id', 'email'],
      }),
    );

    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'IDX_clients_tenant_phone',
        columnNames: ['tenant_id', 'phone'],
      }),
    );

    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'IDX_clients_tenant_fullname',
        columnNames: ['tenant_id', 'full_name'],
      }),
    );

    // Crear foreign key con tenants
    await queryRunner.createForeignKey(
      'clients',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Agregar columna client_uuid a la tabla consents
    await queryRunner.query(`
      ALTER TABLE consents 
      ADD COLUMN client_uuid uuid NULL
    `);

    // Crear índice para client_uuid en consents
    await queryRunner.createIndex(
      'consents',
      new TableIndex({
        name: 'IDX_consents_client_uuid',
        columnNames: ['client_uuid'],
      }),
    );

    // Crear foreign key entre consents y clients
    await queryRunner.createForeignKey(
      'consents',
      new TableForeignKey({
        columnNames: ['client_uuid'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key de consents
    const consentsTable = await queryRunner.getTable('consents');
    const clientForeignKey = consentsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('client_uuid') !== -1,
    );
    if (clientForeignKey) {
      await queryRunner.dropForeignKey('consents', clientForeignKey);
    }

    // Eliminar índice de consents
    await queryRunner.dropIndex('consents', 'IDX_consents_client_uuid');

    // Eliminar columna client_uuid de consents
    await queryRunner.query(`
      ALTER TABLE consents 
      DROP COLUMN client_uuid
    `);

    // Eliminar foreign key de clients
    const clientsTable = await queryRunner.getTable('clients');
    const tenantForeignKey = clientsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (tenantForeignKey) {
      await queryRunner.dropForeignKey('clients', tenantForeignKey);
    }

    // Eliminar índices
    await queryRunner.dropIndex('clients', 'IDX_clients_tenant_fullname');
    await queryRunner.dropIndex('clients', 'IDX_clients_tenant_phone');
    await queryRunner.dropIndex('clients', 'IDX_clients_tenant_email');
    await queryRunner.dropIndex('clients', 'IDX_clients_tenant_document');

    // Eliminar tabla
    await queryRunner.dropTable('clients');
  }
}
