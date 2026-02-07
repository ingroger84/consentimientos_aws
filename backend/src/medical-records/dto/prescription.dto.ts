import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePrescriptionDto {
  @IsString()
  medicationName: string;

  @IsString()
  @IsOptional()
  activeIngredient?: string;

  @IsString()
  @IsOptional()
  presentation?: string;

  @IsString()
  dose: string;

  @IsString()
  route: string;

  @IsString()
  frequency: string;

  @IsString()
  duration: string;

  @IsInt()
  quantity: number;

  @IsString()
  indications: string;

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'completed', 'suspended', 'cancelled'])
  status?: string;

  @IsString()
  @IsOptional()
  suspensionReason?: string;
}
