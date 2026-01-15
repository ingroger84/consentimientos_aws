import { IsNotEmpty, IsString } from 'class-validator';

export class SignConsentDto {
  @IsString()
  @IsNotEmpty()
  signatureData: string;
}
