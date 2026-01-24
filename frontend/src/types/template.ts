export enum TemplateType {
  PROCEDURE = 'procedure',
  DATA_TREATMENT = 'data_treatment',
  IMAGE_RIGHTS = 'image_rights',
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.PROCEDURE]: 'Consentimiento de Procedimiento',
  [TemplateType.DATA_TREATMENT]: 'Tratamiento de Datos Personales',
  [TemplateType.IMAGE_RIGHTS]: 'Derechos de Imagen',
};

export interface ConsentTemplate {
  id: string;
  tenantId?: string;
  name: string;
  type: TemplateType;
  content: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  type: TemplateType;
  content: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface TemplateVariable {
  key: string;
  description: string;
}
