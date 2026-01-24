import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientPermissions1737690000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar permisos de clientes a los roles existentes
    
    // SUPER_ADMIN - todos los permisos de clientes
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'view_clients')
      WHERE type = 'SUPER_ADMIN' AND NOT ('view_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'create_clients')
      WHERE type = 'SUPER_ADMIN' AND NOT ('create_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'edit_clients')
      WHERE type = 'SUPER_ADMIN' AND NOT ('edit_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'delete_clients')
      WHERE type = 'SUPER_ADMIN' AND NOT ('delete_clients' = ANY(permissions))
    `);

    // ADMIN_GENERAL - todos los permisos de clientes
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'view_clients')
      WHERE type = 'ADMIN_GENERAL' AND NOT ('view_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'create_clients')
      WHERE type = 'ADMIN_GENERAL' AND NOT ('create_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'edit_clients')
      WHERE type = 'ADMIN_GENERAL' AND NOT ('edit_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'delete_clients')
      WHERE type = 'ADMIN_GENERAL' AND NOT ('delete_clients' = ANY(permissions))
    `);

    // ADMIN_SEDE - ver, crear y editar clientes
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'view_clients')
      WHERE type = 'ADMIN_SEDE' AND NOT ('view_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'create_clients')
      WHERE type = 'ADMIN_SEDE' AND NOT ('create_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'edit_clients')
      WHERE type = 'ADMIN_SEDE' AND NOT ('edit_clients' = ANY(permissions))
    `);

    // OPERADOR - ver y crear clientes (necesario para crear consentimientos)
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'view_clients')
      WHERE type = 'OPERADOR' AND NOT ('view_clients' = ANY(permissions))
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_append(permissions, 'create_clients')
      WHERE type = 'OPERADOR' AND NOT ('create_clients' = ANY(permissions))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover permisos de clientes de todos los roles
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_remove(permissions, 'view_clients')
      WHERE 'view_clients' = ANY(permissions)
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_remove(permissions, 'create_clients')
      WHERE 'create_clients' = ANY(permissions)
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_remove(permissions, 'edit_clients')
      WHERE 'edit_clients' = ANY(permissions)
    `);
    
    await queryRunner.query(`
      UPDATE roles 
      SET permissions = array_remove(permissions, 'delete_clients')
      WHERE 'delete_clients' = ANY(permissions)
    `);
  }
}
