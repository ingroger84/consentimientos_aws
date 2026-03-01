import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPermissionDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Código del módulo', example: 'medical_records' })
  @IsString()
  module: string;

  @ApiProperty({ description: 'Acción a verificar', example: 'create' })
  @IsString()
  action: string;
}
