import { IsString, IsOptional, IsIn } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsIn(['lab_result', 'imaging', 'epicrisis', 'consent', 'prescription', 'other'])
  documentType: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @IsString()
  @IsOptional()
  relatedEntityId?: string;
}
