import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsEmail, IsString, IsUUID, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  branchIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
