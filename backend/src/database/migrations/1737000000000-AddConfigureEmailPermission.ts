import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfigureEmailPermission1737000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar el permiso 'configure_email' a los roles admin_general de todos los tenants
    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_append(permissions, 'configure_email')
      WHERE type = 'admin_general'
      AND NOT ('configure_email' = ANY(permissions))
    `);

    console.log('✅ Permiso configure_email agregado a roles admin_general');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover el permiso 'configure_email' de todos los roles
    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_remove(permissions, 'configure_email')
      WHERE 'configure_email' = ANY(permissions)
    `);

    console.log('✅ Permiso configure_email removido de roles');
  }
}
