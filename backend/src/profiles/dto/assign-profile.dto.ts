import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignProfileDto {
  @ApiProperty({ description: 'ID del perfil a asignar' })
  @IsUUID()
  profileId: string;

  @ApiProperty({ description: 'ID del usuario' })
  @IsUUID()
  userId: string;
}
