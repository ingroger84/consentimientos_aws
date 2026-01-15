import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
