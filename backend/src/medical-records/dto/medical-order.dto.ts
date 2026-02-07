import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMedicalOrderDto {
  @IsString()
  @IsIn(['laboratory', 'imaging', 'procedure', 'other'])
  orderType: string;

  @IsString()
  @IsOptional()
  orderCode?: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  indication?: string;

  @IsString()
  @IsOptional()
  @IsIn(['routine', 'urgent', 'stat'])
  priority?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMedicalOrderDto extends PartialType(CreateMedicalOrderDto) {
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsString()
  @IsOptional()
  results?: string;

  @IsString()
  @IsOptional()
  resultsDocumentUrl?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
