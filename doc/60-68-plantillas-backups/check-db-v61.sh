#!/bin/bash
export PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD'
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres << EOF
SELECT COUNT(*) as total_asociaciones FROM consent_template_services;
SELECT 
  ct.name as plantilla,
  COUNT(cts."serviceId") as servicios_asociados
FROM consent_templates ct
LEFT JOIN consent_template_services cts ON ct.id = cts."consentTemplateId"
WHERE ct."tenantId" IS NOT NULL
GROUP BY ct.id, ct.name
ORDER BY ct.name
LIMIT 10;
EOF
