-- Migración manual para crear tabla de clientes
-- Ejecutar solo si la tabla no existe

-- Crear tabla clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name varchar(100) NOT NULL,
  document_type varchar(10) NOT NULL CHECK (document_type IN ('CC', 'TI', 'CE', 'PA', 'RC', 'NIT')),
  document_number varchar(20) NOT NULL,
  email varchar(100),
  phone varchar(20),
  address varchar(200),
  city varchar(100),
  birth_date date,
  gender varchar(20),
  blood_type varchar(10),
  emergency_contact_name varchar(100),
  emergency_contact_phone varchar(20),
  notes text,
  consents_count int NOT NULL DEFAULT 0,
  last_consent_at timestamp,
  tenant_id uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp
);

-- Crear índice único para tenant_id + document_type + document_number
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_clients_tenant_document" 
ON clients (tenant_id, document_type, document_number);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS "IDX_clients_tenant_email" 
ON clients (tenant_id, email);

CREATE INDEX IF NOT EXISTS "IDX_clients_tenant_phone" 
ON clients (tenant_id, phone);

CREATE INDEX IF NOT EXISTS "IDX_clients_tenant_fullname" 
ON clients (tenant_id, full_name);

-- Crear foreign key con tenants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'FK_clients_tenant'
  ) THEN
    ALTER TABLE clients 
    ADD CONSTRAINT FK_clients_tenant 
    FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Agregar columna client_id a la tabla consents si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consents' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE consents ADD COLUMN client_id uuid NULL;
  END IF;
END $$;

-- Crear índice para client_id en consents
CREATE INDEX IF NOT EXISTS "IDX_consents_client" 
ON consents (client_id);

-- Crear foreign key entre consents y clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'FK_consents_client'
  ) THEN
    ALTER TABLE consents 
    ADD CONSTRAINT FK_consents_client 
    FOREIGN KEY (client_id) 
    REFERENCES clients(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Registrar la migración si no está registrada
INSERT INTO migrations (timestamp, name)
SELECT 1737680000000, 'CreateClientsTable1737680000000'
WHERE NOT EXISTS (
  SELECT 1 FROM migrations 
  WHERE timestamp = 1737680000000
);

-- Verificar que todo se creó correctamente
SELECT 'Tabla clients creada' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients');

SELECT 'Columna client_id agregada a consents' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consents' AND column_name = 'client_id');
