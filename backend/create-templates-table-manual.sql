-- Crear tabla consent_templates manualmente
CREATE TABLE IF NOT EXISTS consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" UUID,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('procedure', 'data_treatment', 'image_rights')),
  content TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "IDX_consent_templates_tenant" ON consent_templates("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_consent_templates_type" ON consent_templates(type);
CREATE INDEX IF NOT EXISTS "IDX_consent_templates_active" ON consent_templates("isActive");
CREATE INDEX IF NOT EXISTS "IDX_consent_templates_default" ON consent_templates("isDefault");

-- Insertar plantillas por defecto para cada tenant
INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault", "createdAt", "updatedAt")
SELECT 
  id as "tenantId",
  'Consentimiento de Procedimiento (Predeterminado)' as name,
  'procedure' as type,
  E'DECLARACIÓN DE CONSENTIMIENTO\n\nDeclaro que he sido informado(a) sobre el procedimiento/servicio mencionado, sus beneficios, riesgos y alternativas. Autorizo voluntariamente la realización del procedimiento/servicio descrito en este documento.\n\nHe tenido la oportunidad de hacer preguntas y todas mis dudas han sido resueltas satisfactoriamente. Comprendo que puedo retirar este consentimiento en cualquier momento antes del procedimiento.\n\nServicio: {{serviceName}}\nSede: {{branchName}}\nFecha: {{signDate}}\n\nFirma del paciente: _______________________\nNombre: {{clientName}}\nIdentificación: {{clientId}}' as content,
  'Plantilla predeterminada para consentimientos de procedimientos médicos y servicios' as description,
  true as "isActive",
  true as "isDefault",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM consent_templates 
  WHERE consent_templates."tenantId" = tenants.id 
  AND consent_templates.type = 'procedure'
);

INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault", "createdAt", "updatedAt")
SELECT 
  id as "tenantId",
  'Tratamiento de Datos Personales (Predeterminado)' as name,
  'data_treatment' as type,
  E'AUTORIZACIÓN PARA TRATAMIENTO DE DATOS PERSONALES\n\nDe acuerdo con la Ley Estatutaria 1581 de 2012 de Protección de Datos y sus normas reglamentarias, doy mi consentimiento, como Titular de los datos, para que éstos sean incorporados en una base de datos responsabilidad de {{branchName}}, para que sean tratados con arreglo a los siguientes criterios:\n\n1. FINALIDAD DEL TRATAMIENTO\nLa finalidad del tratamiento será la prestación de servicios médicos/profesionales, gestión administrativa, facturación, y comunicaciones relacionadas con los servicios contratados.\n\n2. DERECHOS DEL TITULAR\nComo titular de los datos personales, tengo derecho a:\n- Conocer, actualizar y rectificar mis datos personales\n- Solicitar prueba de la autorización otorgada\n- Ser informado sobre el uso que se ha dado a mis datos\n- Presentar quejas ante la Superintendencia de Industria y Comercio\n- Revocar la autorización y/o solicitar la supresión de datos\n- Acceder de forma gratuita a mis datos personales\n\n3. EJERCICIO DE DERECHOS\nPara ejercitar los derechos de acceso, corrección, supresión, revocación o reclamo, puedo dirigirme a:\n- Correo electrónico: {{branchEmail}}\n- Dirección: {{branchAddress}}\n- Teléfono: {{branchPhone}}\n\nTITULAR DE LOS DATOS\nNombre: {{clientName}}\nIdentificación: {{clientId}}\nEmail: {{clientEmail}}\nTeléfono: {{clientPhone}}\nFecha: {{currentDate}}' as content,
  'Plantilla predeterminada para autorización de tratamiento de datos personales según Ley 1581 de 2012' as description,
  true as "isActive",
  true as "isDefault",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM consent_templates 
  WHERE consent_templates."tenantId" = tenants.id 
  AND consent_templates.type = 'data_treatment'
);

INSERT INTO consent_templates ("tenantId", name, type, content, description, "isActive", "isDefault", "createdAt", "updatedAt")
SELECT 
  id as "tenantId",
  'Autorización de Derechos de Imagen (Predeterminado)' as name,
  'image_rights' as type,
  E'AUTORIZACIÓN DE USO DE IMAGEN Y DATOS PERSONALES\n\nAutorizo expresamente el uso de mi imagen, voz y/o cualquier otro dato de carácter personal que pueda ser captado en fotografías, videos o grabaciones realizadas durante el procedimiento/servicio.\n\n1. ALCANCE DE LA AUTORIZACIÓN\nEsta autorización incluye:\n- Fotografías del procedimiento con fines médicos y de registro\n- Uso de imágenes para documentación clínica\n- Almacenamiento seguro en la historia clínica\n- Uso interno para fines de seguimiento y control de calidad\n\n2. PROTECCIÓN DE LA PRIVACIDAD\nLa institución se compromete a:\n- Proteger mi identidad y datos personales\n- No publicar imágenes sin autorización expresa adicional\n- Usar las imágenes únicamente para los fines autorizados\n- Mantener la confidencialidad de la información\n\n3. REVOCACIÓN\nPuedo revocar esta autorización en cualquier momento mediante comunicación escrita dirigida a {{branchName}}.\n\n4. DATOS DEL TITULAR\nNombre completo: {{clientName}}\nIdentificación: {{clientId}}\nServicio: {{serviceName}}\nSede: {{branchName}}\nFecha: {{currentDate}}\n\nDeclaro que he leído y comprendido esta autorización y la otorgo de manera libre y voluntaria.' as content,
  'Plantilla predeterminada para autorización de uso de imagen y datos personales' as description,
  true as "isActive",
  true as "isDefault",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM consent_templates 
  WHERE consent_templates."tenantId" = tenants.id 
  AND consent_templates.type = 'image_rights'
);

-- Verificar resultados
SELECT 
  t.name as tenant_name,
  ct.name as template_name,
  ct.type,
  ct."isDefault",
  ct."isActive"
FROM consent_templates ct
JOIN tenants t ON ct."tenantId" = t.id
ORDER BY t.name, ct.type;
