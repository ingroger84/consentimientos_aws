import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTenantToQuestions1736180000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna tenantId a la tabla questions
    await queryRunner.addColumn(
      'questions',
      new TableColumn({
        name: 'tenantId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Agregar foreign key
    await queryRunner.createForeignKey(
      'questions',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índice para mejorar rendimiento de queries
    await queryRunner.query(`
      CREATE INDEX "IDX_questions_tenantId" ON "questions" ("tenantId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`DROP INDEX "IDX_questions_tenantId"`);

    // Eliminar foreign key
    const table = await queryRunner.getTable('questions');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenantId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('questions', foreignKey);
    }

    // Eliminar columna
    await queryRunner.dropColumn('questions', 'tenantId');
  }
}
