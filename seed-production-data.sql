-- =====================================================
-- Script: Seed de datos de producción
-- Fecha: 2026-01-28
-- Descripción: Crear datos de prueba para clientes e historias clínicas
-- =====================================================

-- Obtener IDs necesarios
DO $$
DECLARE
  v_tenant_demo_estetica UUID;
  v_tenant_clinica_demo UUID;
  v_branch_demo_estetica UUID;
  v_branch_clinica_demo UUID;
  v_user_admin_demo_estetica UUID;
  v_user_admin_clinica_demo UUID;
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_mr1_id UUID;
  v_mr2_id UUID;
  v_mr3_id UUID;
BEGIN
  -- Obtener IDs de tenants
  SELECT id INTO v_tenant_demo_estetica FROM tenants WHERE slug = 'demo-estetica';
  SELECT id INTO v_tenant_clinica_demo FROM tenants WHERE slug = 'clinica-demo';
  
  -- Obtener IDs de sedes
  SELECT id INTO v_branch_demo_estetica FROM branches WHERE "tenantId" = v_tenant_demo_estetica LIMIT 1;
  SELECT id INTO v_branch_clinica_demo FROM branches WHERE "tenantId" = v_tenant_clinica_demo LIMIT 1;
  
  -- Obtener IDs de usuarios administradores
  SELECT id INTO v_user_admin_demo_estetica FROM users WHERE email = 'roger.caraballo@gmail.com';
  SELECT id INTO v_user_admin_clinica_demo FROM users WHERE email = 'admin@consentimientos.com';
  
  RAISE NOTICE 'Tenant Demo Estetica: %', v_tenant_demo_estetica;
  RAISE NOTICE 'Tenant Clínica Demo: %', v_tenant_clinica_demo;
  RAISE NOTICE 'Branch Demo Estetica: %', v_branch_demo_estetica;
  RAISE NOTICE 'Branch Clínica Demo: %', v_branch_clinica_demo;
  RAISE NOTICE 'User Admin Demo Estetica: %', v_user_admin_demo_estetica;
  RAISE NOTICE 'User Admin Clínica Demo: %', v_user_admin_clinica_demo;
  
  -- =====================================================
  -- CLIENTES PARA DEMO ESTETICA
  -- =====================================================
  
  IF v_tenant_demo_estetica IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '=== Creando clientes para Demo Estetica ===';
    
    -- Cliente 1: María García
    INSERT INTO clients (
      tenant_id, full_name, document_type, document_number,
      email, phone, birth_date, gender, address,
      city, created_at, updated_at
    ) VALUES (
      v_tenant_demo_estetica, 'María García', 'CC', '1234567890',
      'maria.garcia@email.com', '+57 300 123 4567', '1985-03-15', 'Femenino', 'Calle 123 #45-67',
      'Bogotá', NOW(), NOW()
    ) RETURNING id INTO v_client1_id;
    RAISE NOTICE '  ✓ Cliente creado: María García (ID: %)', v_client1_id;
    
    -- Cliente 2: Juan Pérez
    INSERT INTO clients (
      tenant_id, full_name, document_type, document_number,
      email, phone, birth_date, gender, address,
      city, created_at, updated_at
    ) VALUES (
      v_tenant_demo_estetica, 'Juan Pérez', 'CC', '9876543210',
      'juan.perez@email.com', '+57 310 987 6543', '1990-07-22', 'Masculino', 'Carrera 45 #123-45',
      'Medellín', NOW(), NOW()
    ) RETURNING id INTO v_client2_id;
    RAISE NOTICE '  ✓ Cliente creado: Juan Pérez (ID: %)', v_client2_id;
    
    -- Cliente 3: Ana Rodríguez
    INSERT INTO clients (
      tenant_id, full_name, document_type, document_number,
      email, phone, birth_date, gender, address,
      city, created_at, updated_at
    ) VALUES (
      v_tenant_demo_estetica, 'Ana Rodríguez', 'CC', '5555555555',
      'ana.rodriguez@email.com', '+57 320 555 5555', '1988-11-30', 'Femenino', 'Avenida 68 #45-12',
      'Cali', NOW(), NOW()
    ) RETURNING id INTO v_client3_id;
    RAISE NOTICE '  ✓ Cliente creado: Ana Rodríguez (ID: %)', v_client3_id;
    
    -- =====================================================
    -- HISTORIAS CLÍNICAS PARA DEMO ESTETICA
    -- =====================================================
    
    IF v_user_admin_demo_estetica IS NOT NULL AND v_branch_demo_estetica IS NOT NULL THEN
      RAISE NOTICE '';
      RAISE NOTICE '=== Creando historias clínicas para Demo Estetica ===';
      
      -- HC 1: María García - Procedimiento Estético
      INSERT INTO medical_records (
        tenant_id, client_id, branch_id, record_number,
        admission_date, admission_type, status, is_locked,
        created_by, created_at, updated_at
      ) VALUES (
        v_tenant_demo_estetica, v_client1_id, v_branch_demo_estetica, 'HC-2026-001',
        NOW() - INTERVAL '5 days', 'Consulta Externa', 'OPEN', false,
        v_user_admin_demo_estetica, NOW() - INTERVAL '5 days', NOW()
      ) RETURNING id INTO v_mr1_id;
      RAISE NOTICE '  ✓ HC creada: HC-2026-001 para María García (ID: %)', v_mr1_id;
      
      -- Anamnesis para HC 1
      INSERT INTO anamnesis (
        medical_record_id, chief_complaint, current_illness_history,
        allergies, current_medications, family_history, personal_history,
        created_at, updated_at
      ) VALUES (
        v_mr1_id,
        'Consulta para procedimiento de rejuvenecimiento facial',
        'Paciente refiere deseo de mejorar apariencia facial. Sin antecedentes de procedimientos estéticos previos.',
        'Ninguna conocida',
        'Ninguno',
        'Madre con hipertensión arterial',
        'No fuma, no consume alcohol. Actividad física regular.',
        NOW() - INTERVAL '5 days', NOW()
      );
      RAISE NOTICE '    ✓ Anamnesis agregada';
      
      -- Examen físico para HC 1
      INSERT INTO physical_exams (
        medical_record_id, vital_signs, general_appearance,
        systems_review, findings, created_at, updated_at
      ) VALUES (
        v_mr1_id,
        '{"blood_pressure": "120/80", "heart_rate": "72", "temperature": "36.5", "respiratory_rate": "16"}',
        'Paciente en buen estado general, consciente, orientada',
        'Cardiovascular: Normal. Respiratorio: Normal. Neurológico: Normal.',
        'Piel facial con signos de fotoenvejecimiento leve',
        NOW() - INTERVAL '5 days', NOW()
      );
      RAISE NOTICE '    ✓ Examen físico agregado';
      
      -- Diagnóstico para HC 1
      INSERT INTO diagnoses (
        medical_record_id, diagnosis_code, diagnosis_description,
        diagnosis_type, created_at, updated_at
      ) VALUES (
        v_mr1_id, 'L57.0', 'Queratosis actínica', 'Principal',
        NOW() - INTERVAL '5 days', NOW()
      );
      RAISE NOTICE '    ✓ Diagnóstico agregado';
      
      -- HC 2: Juan Pérez - Tratamiento Médico
      INSERT INTO medical_records (
        tenant_id, client_id, branch_id, record_number,
        admission_date, admission_type, status, is_locked,
        created_by, created_at, updated_at
      ) VALUES (
        v_tenant_demo_estetica, v_client2_id, v_branch_demo_estetica, 'HC-2026-002',
        NOW() - INTERVAL '3 days', 'Consulta Externa', 'OPEN', false,
        v_user_admin_demo_estetica, NOW() - INTERVAL '3 days', NOW()
      ) RETURNING id INTO v_mr2_id;
      RAISE NOTICE '  ✓ HC creada: HC-2026-002 para Juan Pérez (ID: %)', v_mr2_id;
      
      -- Anamnesis para HC 2
      INSERT INTO anamnesis (
        medical_record_id, chief_complaint, current_illness_history,
        allergies, current_medications, family_history, personal_history,
        created_at, updated_at
      ) VALUES (
        v_mr2_id,
        'Dolor lumbar crónico',
        'Paciente refiere dolor lumbar de 6 meses de evolución, que aumenta con actividad física.',
        'Penicilina',
        'Ibuprofeno 400mg cada 8 horas',
        'Padre con diabetes tipo 2',
        'Sedentarismo. Trabaja en oficina.',
        NOW() - INTERVAL '3 days', NOW()
      );
      RAISE NOTICE '    ✓ Anamnesis agregada';
      
      -- HC 3: Ana Rodríguez - Procedimiento Estético
      INSERT INTO medical_records (
        tenant_id, client_id, branch_id, record_number,
        admission_date, admission_type, status, is_locked,
        created_by, created_at, updated_at
      ) VALUES (
        v_tenant_demo_estetica, v_client3_id, v_branch_demo_estetica, 'HC-2026-003',
        NOW() - INTERVAL '1 day', 'Consulta Externa', 'OPEN', false,
        v_user_admin_demo_estetica, NOW() - INTERVAL '1 day', NOW()
      ) RETURNING id INTO v_mr3_id;
      RAISE NOTICE '  ✓ HC creada: HC-2026-003 para Ana Rodríguez (ID: %)', v_mr3_id;
      
      -- Anamnesis para HC 3
      INSERT INTO anamnesis (
        medical_record_id, chief_complaint, current_illness_history,
        allergies, current_medications, family_history, personal_history,
        created_at, updated_at
      ) VALUES (
        v_mr3_id,
        'Consulta para tratamiento de acné',
        'Paciente con acné facial moderado desde hace 2 años. Ha probado tratamientos tópicos sin éxito.',
        'Ninguna',
        'Crema tópica con ácido salicílico',
        'Sin antecedentes relevantes',
        'Dieta balanceada. No fuma.',
        NOW() - INTERVAL '1 day', NOW()
      );
      RAISE NOTICE '    ✓ Anamnesis agregada';
      
    END IF;
  END IF;
  
  -- =====================================================
  -- CLIENTES PARA CLÍNICA DEMO
  -- =====================================================
  
  IF v_tenant_clinica_demo IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '=== Creando clientes para Clínica Demo ===';
    
    -- Cliente 1: Carlos Martínez
    INSERT INTO clients (
      tenant_id, full_name, document_type, document_number,
      email, phone, birth_date, gender, address,
      city, created_at, updated_at
    ) VALUES (
      v_tenant_clinica_demo, 'Carlos Martínez', 'CC', '1111111111',
      'carlos.martinez@email.com', '+57 300 111 1111', '1975-05-10', 'Masculino', 'Calle 50 #20-30',
      'Bogotá', NOW(), NOW()
    ) RETURNING id INTO v_client1_id;
    RAISE NOTICE '  ✓ Cliente creado: Carlos Martínez (ID: %)', v_client1_id;
    
    -- Cliente 2: Laura Gómez
    INSERT INTO clients (
      tenant_id, full_name, document_type, document_number,
      email, phone, birth_date, gender, address,
      city, created_at, updated_at
    ) VALUES (
      v_tenant_clinica_demo, 'Laura Gómez', 'CC', '2222222222',
      'laura.gomez@email.com', '+57 310 222 2222', '1992-09-18', 'Femenino', 'Carrera 15 #80-25',
      'Bogotá', NOW(), NOW()
    ) RETURNING id INTO v_client2_id;
    RAISE NOTICE '  ✓ Cliente creado: Laura Gómez (ID: %)', v_client2_id;
    
    -- =====================================================
    -- HISTORIAS CLÍNICAS PARA CLÍNICA DEMO
    -- =====================================================
    
    IF v_user_admin_clinica_demo IS NOT NULL AND v_branch_clinica_demo IS NOT NULL THEN
      RAISE NOTICE '';
      RAISE NOTICE '=== Creando historias clínicas para Clínica Demo ===';
      
      -- HC 1: Carlos Martínez
      INSERT INTO medical_records (
        tenant_id, client_id, branch_id, record_number,
        admission_date, admission_type, status, is_locked,
        created_by, created_at, updated_at
      ) VALUES (
        v_tenant_clinica_demo, v_client1_id, v_branch_clinica_demo, 'HC-CD-001',
        NOW() - INTERVAL '7 days', 'Urgencias', 'CLOSED', true,
        v_user_admin_clinica_demo, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'
      ) RETURNING id INTO v_mr1_id;
      RAISE NOTICE '  ✓ HC creada: HC-CD-001 para Carlos Martínez (ID: %)', v_mr1_id;
      
      -- Anamnesis para HC 1
      INSERT INTO anamnesis (
        medical_record_id, chief_complaint, current_illness_history,
        allergies, current_medications, family_history, personal_history,
        created_at, updated_at
      ) VALUES (
        v_mr1_id,
        'Dolor torácico',
        'Paciente refiere dolor torácico opresivo de 2 horas de evolución.',
        'Ninguna',
        'Atorvastatina 20mg/día',
        'Padre fallecido por infarto agudo de miocardio',
        'Fumador de 20 cigarrillos/día por 30 años',
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'
      );
      RAISE NOTICE '    ✓ Anamnesis agregada';
      
      -- HC 2: Laura Gómez
      INSERT INTO medical_records (
        tenant_id, client_id, branch_id, record_number,
        admission_date, admission_type, status, is_locked,
        created_by, created_at, updated_at
      ) VALUES (
        v_tenant_clinica_demo, v_client2_id, v_branch_clinica_demo, 'HC-CD-002',
        NOW() - INTERVAL '2 days', 'Consulta Externa', 'OPEN', false,
        v_user_admin_clinica_demo, NOW() - INTERVAL '2 days', NOW()
      ) RETURNING id INTO v_mr2_id;
      RAISE NOTICE '  ✓ HC creada: HC-CD-002 para Laura Gómez (ID: %)', v_mr2_id;
      
      -- Anamnesis para HC 2
      INSERT INTO anamnesis (
        medical_record_id, chief_complaint, current_illness_history,
        allergies, current_medications, family_history, personal_history,
        created_at, updated_at
      ) VALUES (
        v_mr2_id,
        'Control prenatal',
        'Paciente embarazada de 12 semanas, primer control prenatal.',
        'Ninguna',
        'Ácido fólico 1mg/día',
        'Sin antecedentes relevantes',
        'Primer embarazo. No fuma, no consume alcohol.',
        NOW() - INTERVAL '2 days', NOW()
      );
      RAISE NOTICE '    ✓ Anamnesis agregada';
      
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Seed de datos completado exitosamente';
  RAISE NOTICE '========================================';
  
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

-- Detalle de clientes
SELECT 
  t.name as tenant,
  c.full_name as cliente,
  c.document_number,
  c.email
FROM tenants t
INNER JOIN clients c ON c.tenant_id = t.id
WHERE t.deleted_at IS NULL
ORDER BY t.name, c.full_name;

-- Detalle de historias clínicas
SELECT 
  t.name as tenant,
  mr.record_number,
  c.full_name as paciente,
  mr.admission_date::date as fecha_admision,
  mr.status,
  mr.is_locked
FROM tenants t
INNER JOIN medical_records mr ON mr.tenant_id = t.id
INNER JOIN clients c ON c.id = mr.client_id
WHERE t.deleted_at IS NULL
ORDER BY t.name, mr.admission_date DESC;
