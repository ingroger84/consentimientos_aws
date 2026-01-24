import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

// No permitir cambiar tipo y número de documento
export class UpdateClientDto extends PartialType(
  OmitType(CreateClientDto, ['documentType', 'documentNumber'] as const)
) {}
