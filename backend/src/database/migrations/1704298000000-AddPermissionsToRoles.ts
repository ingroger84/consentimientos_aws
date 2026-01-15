import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPermissionsToRoles1704298000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('roles');
    
    if (table && !table.findColumnByName('permissions')) {
      await queryRunner.addColumn(
        'roles',
        new TableColumn({
          name: 'permissions',
          type: 'text',
          isNullable: false,
          default: "''",
        }),
      );

      // Update existing roles with default permissions
      await queryRunner.query(`
        UPDATE roles 
        SET permissions = 'delete_consents,manage_users,manage_branches,manage_services' 
        WHERE type = 'ADMIN_GENERAL'
      `);

      await queryRunner.query(`
        UPDATE roles 
        SET permissions = 'delete_consents' 
        WHERE type = 'ADMIN_SEDE'
      `);

      await queryRunner.query(`
        UPDATE roles 
        SET permissions = '' 
        WHERE type = 'OPERADOR'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('roles', 'permissions');
  }
}
