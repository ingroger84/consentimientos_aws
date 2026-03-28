import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPublicInvoicesDto {
  @ApiProperty({
    example: 'demo-medico',
    description: 'Slug del tenant',
  })
  @IsString()
  @IsNotEmpty()
  tenantSlug: string;
}
