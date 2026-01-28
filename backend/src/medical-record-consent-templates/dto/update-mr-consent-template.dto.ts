import { PartialType } from '@nestjs/mapped-types';
import { CreateMRConsentTemplateDto } from './create-mr-consent-template.dto';

export class UpdateMRConsentTemplateDto extends PartialType(CreateMRConsentTemplateDto) {}
