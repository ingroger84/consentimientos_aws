-- =====================================================
-- Script: Seed simple de datos de producción
-- Fecha: 2026-01-28
-- Descripción: Crear clientes e historias clínicas básicas
-- =====================================================

-- DEMO ESTETICA
DO $$
DECLARE
  v_tenant_id UUID;
  v_branch_id UUID;
  v_user_id UUID;
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'demo-estetica';
  SELECT id INTO v_branch_id FROM branches WHERE "tenantId" = v_tenant_id LIMIT 1;
  SELECT id INTO v_user_id FROM users WHERE email = 'roger.caraballo@gmail.com';
  
  RAISE NOTICE 'Demo Estetica - Tenant: %, Branch: %, User: %', v_tenant_id, v_branch_id, v_user_id;
  
  -- Cliente 1
  INSERT INTO clients (tenant_id, full_name, document_type, document_number, email, phone, birth_date, gender, address, city)
  VALUES (v_tenant_id, 'María García Pérez', 'CC', '1234567890', 'maria.garcia@email.com', '+57 300 123 4567', '1985-03-15', 'Femenino', 'Calle 123 #45-67', 'Bogotá')
  RETURNING id INTO v_client1_id;
  RAISE NOTICE '  ✓ Cliente: María García (%)' , v_client1_id;
  
  -- HC 1
  INSERT INTO medical_records (tenant_id, client_id, branch_id, record_number, admission_date, admission_type, status, created_by)
  VALUES (v_tenant_id, v_client1_id, v_branch_id, 'HC-2026-001', NOW() - INTERVAL '5 days', 'Consulta Externa', 'OPEN', v_user_id);
  RAISE NOTICE '  ✓ HC: HC-2026-001';
  
  -- Cliente 2
  INSERT INTO clients (tenant_id, full_name, document_type, document_number, email, phone, birth_date, gender, address, city)
  VALUES (v_tenant_id, 'Juan Pérez López', 'CC', '9876543210', 'juan.perez@email.com', '+57 310 987 6543', '1990-07-22', 'Masculino', 'Carrera 45 #123-45', 'Medellín')
  RETURNING id INTO v_client2_id;
  RAISE NOTICE '  ✓ Cliente: Juan Pérez (%)' , v_client2_id;
  
  -- HC 2
  INSERT INTO medical_records (tenant_id, client_id, branch_id, record_number, admission_date, admission_type, status, created_by)
  VALUES (v_tenant_id, v_client2_id, v_branch_id, 'HC-2026-002', NOW() - INTERVAL '3 days', 'Consulta Externa', 'OPEN', v_user_id);
  RAISE NOTICE '  ✓ HC: HC-2026-002';
  
  -- Cliente 3
  INSERT INTO clients (tenant_id, full_name, document_type, document_number, email, phone, birth_date, gender, address, city)
  VALUES (v_tenant_id, 'Ana Rodríguez Martínez', 'CC', '5555555555', 'ana.rodriguez@email.com', '+57 320 555 5555', '1988-11-30', 'Femenino', 'Avenida 68 #45-12', 'Cali')
  RETURNING id INTO v_client3_id;
  RAISE NOTICE '  ✓ Cliente: Ana Rodríguez (%)' , v_client3_id;
  
  -- HC 3
  INSERT INTO medical_records (tenant_id, client_id, branch_id, record_number, admission_date, admission_type, status, created_by)
  VALUES (v_tenant_id, v_client3_id, v_branch_id, 'HC-2026-003', NOW() - INTERVAL '1 day', 'Consulta Externa', 'OPEN', v_user_id);
  RAISE NOTICE '  ✓ HC: HC-2026-003';
  
END $$;

-- CLÍNICA DEMO
DO $$
DECLARE
  v_tenant_id UUID;
  v_branch_id UUID;
  v_user_id UUID;
  v_client1_id UUID;
  v_client2_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'clinica-demo';
  SELECT id INTO v_branch_id FROM branches WHERE "tenantId" = v_tenant_id LIMIT 1;
  SELECT id INTO v_user_id FROM users WHERE email = 'admin@consentimientos.com';
  
  RAISE NOTICE 'Clínica Demo - Tenant: %, Branch: %, User: %', v_tenant_id, v_branch_id, v_user_id;
  
  -- Cliente 1
  INSERT INTO clients (tenant_id, full_name, document_type, document_number, email, phone, birth_date, gender, address, city)
  VALUES (v_tenant_id, 'Carlos Martínez Silva', 'CC', '1111111111', 'carlos.martinez@email.com', '+57 300 111 1111', '1975-05-10', 'Masculino', 'Calle 50 #20-30', 'Bogotá')
  RETURNING id INTO v_client1_id;
  RAISE NOTICE '  ✓ Cliente: Carlos Martínez (%)' , v_client1_id;
  
  -- HC 1
  INSERT INTO medical_records (tenant_id, client_id, branch_id, record_number, admission_date, admission_type, status, created_by, closed_at, closed_by)
  VALUES (v_tenant_id, v_client1_id, v_branch_id, 'HC-CD-001', NOW() - INTERVAL '7 days', 'Urgencias', 'CLOSED', v_user_id, NOW() - INTERVAL '5 days', v_user_id);
  RAISE NOTICE '  ✓ HC: HC-CD-001 (CERRADA)';
  
  -- Cliente 2
  INSERT INTO clients (tenant_id, full_name, document_type, document_number, email, phone, birth_date, gender, address, city)
  VALUES (v_tenant_id, 'Laura Gómez Torres', 'CC', '2222222222', 'laura.gomez@email.com', '+57 310 222 2222', '1992-09-18', 'Femenino', 'Carrera 15 #80-25', 'Bogotá')
  RETURNING id INTO v_client2_id;
  RAISE NOTICE '  ✓ Cliente: Laura Gómez (%)' , v_client2_id;
  
  -- HC 2
  INSERT INTO medical_records (tenant_id, client_id, branch_id, record_number, admission_date, admission_type, status, created_by)
  VALUES (v_tenant_id, v_client2_id, v_branch_id, 'HC-CD-002', NOW() - INTERVAL '2 days', 'Consulta Externa', 'OPEN', v_user_id);
  RAISE NOTICE '  ✓ HC: HC-CD-002';
  
END $$;

-- Verificar resultados
SELECT 
  t.name as tenant,
  COUNT(DISTINCT c.id) as clientes,
  COUNT(DISTINCT mr.id) as historias_clinicas
FROM tenants t
LEFT JOIN clients c ON c.tenant_id = t.id
LEFT JOIN medical_records mr ON mr.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name
ORDER BY t.name;

-- Detalle
SELECT 
  t.name as tenant,
  c.full_name as cliente,
  mr.record_number as hc,
  mr.status
FROM tenants t
INNER JOIN clients c ON c.tenant_id = t.id
LEFT JOIN medical_records mr ON mr.client_id = c.id
WHERE t.deleted_at IS NULL
ORDER BY t.name, c.full_name;
