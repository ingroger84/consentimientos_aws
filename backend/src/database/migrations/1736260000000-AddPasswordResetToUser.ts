import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordResetToUser1736260000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columnas para reset de contraseña
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'reset_password_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'reset_password_expires',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Crear índice para búsqueda rápida por token
    await queryRunner.query(
      `CREATE INDEX "IDX_users_reset_password_token" ON "users" ("reset_password_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`DROP INDEX "IDX_users_reset_password_token"`);

    // Eliminar columnas
    await queryRunner.dropColumn('users', 'reset_password_expires');
    await queryRunner.dropColumn('users', 'reset_password_token');
  }
}
