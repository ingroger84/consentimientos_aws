import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoicePermissions1737100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar permisos de facturas a los roles admin_general de todos los tenants
    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_append(permissions, 'view_invoices')
      WHERE type = 'ADMIN_GENERAL'
      AND NOT ('view_invoices' = ANY(permissions))
    `);

    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_append(permissions, 'pay_invoices')
      WHERE type = 'ADMIN_GENERAL'
      AND NOT ('pay_invoices' = ANY(permissions))
    `);

    console.log('✅ Permisos de facturas agregados a roles admin_general');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover permisos de facturas
    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_remove(permissions, 'view_invoices')
      WHERE 'view_invoices' = ANY(permissions)
    `);

    await queryRunner.query(`
      UPDATE roles
      SET permissions = array_remove(permissions, 'pay_invoices')
      WHERE 'pay_invoices' = ANY(permissions)
    `);

    console.log('✅ Permisos de facturas removidos de roles');
  }
}
