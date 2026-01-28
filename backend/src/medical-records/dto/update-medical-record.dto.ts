import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { CreateMedicalRecordDto } from './create-medical-record.dto';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'closed', 'archived'])
  status?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}
