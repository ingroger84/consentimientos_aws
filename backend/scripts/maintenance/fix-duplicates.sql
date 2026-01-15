-- Script para arreglar duplicados y migrar al sistema multi-tenant

-- 1. Obtener IDs de las sedes
-- Sede Principal antigua: 5357f2e5-51bd-4860-bae1-c35c8592d9e7
-- Sede Principal nueva: 411314d9-b527-45eb-a2f4-ddbc6afb5596
-- Sede Norte antigua: 4c716f19-0e92-47fb-9422-e6550dc2f560
-- Sede Norte nueva: f4a9be94-4e9a-4220-ab14-96dfbb1388cd

-- 2. Actualizar consentimientos que usan sedes antiguas
UPDATE consents 
SET "branchId" = '411314d9-b527-45eb-a2f4-ddbc6afb5596'
WHERE "branchId" = '5357f2e5-51bd-4860-bae1-c35c8592d9e7';

UPDATE consents 
SET "branchId" = 'f4a9be94-4e9a-4220-ab14-96dfbb1388cd'
WHERE "branchId" = '4c716f19-0e92-47fb-9422-e6550dc2f560';

-- 3. Actualizar consentimientos que usan servicios antiguos
UPDATE consents 
SET "serviceId" = '3f448da5-e7cb-487a-b870-18a6dcccec17'
WHERE "serviceId" = '6a58541f-0ffd-4314-8d8e-e208decbf765';

UPDATE consents 
SET "serviceId" = 'c421e452-d8cb-49b7-8293-755dfcffc93c'
WHERE "serviceId" = '18b3bece-c3c4-436f-b8a6-5d462e97f6e0';

-- 4. Actualizar tenant en consentimientos
UPDATE consents 
SET "tenantId" = (SELECT id FROM tenants WHERE slug = 'clinica-demo')
WHERE "tenantId" IS NULL;

-- 5. Eliminar sedes antiguas
DELETE FROM branches WHERE "tenantId" IS NULL;

-- 6. Eliminar servicios antiguos
DELETE FROM services WHERE "tenantId" IS NULL;

-- 7. Verificar resultados
SELECT 'Sedes restantes:' as info, COUNT(*) as count FROM branches WHERE deleted_at IS NULL
UNION ALL
SELECT 'Servicios restantes:', COUNT(*) FROM services WHERE deleted_at IS NULL
UNION ALL
SELECT 'Consentimientos:', COUNT(*) FROM consents WHERE deleted_at IS NULL;
