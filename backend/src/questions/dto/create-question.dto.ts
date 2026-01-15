import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { QuestionType } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isCritical?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsUUID()
  @IsNotEmpty()
  serviceId: string;
}
