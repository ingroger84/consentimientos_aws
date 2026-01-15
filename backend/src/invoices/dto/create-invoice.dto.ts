import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, InvoiceItem } from '../entities/invoice.entity';

export class InvoiceItemDto implements InvoiceItem {
  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  @IsOptional()
  taxConfigId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
