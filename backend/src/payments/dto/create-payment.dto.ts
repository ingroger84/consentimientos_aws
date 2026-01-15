import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}
