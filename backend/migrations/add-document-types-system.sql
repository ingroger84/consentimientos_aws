-- Migración: Sistema de Tipos de Documentos
-- Fecha: 2026-03-26
-- Descripción: Agregar tabla de tipos de documentos y campos a tenants

-- 1. Crear tabla de tipos de documentos
CREATE TABLE IF NOT EXISTS document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country VARCHAR(10) DEFAULT 'CO',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 2. Agregar campos a la tabla tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES document_types(id),
ADD COLUMN IF NOT EXISTS document_number VARCHAR(50);

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_document_types_code ON document_types(code);
CREATE INDEX IF NOT EXISTS idx_document_types_country ON document_types(country);
CREATE INDEX IF NOT EXISTS idx_document_types_active ON document_types(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_document_type ON tenants(document_type_id);
CREATE INDEX IF NOT EXISTS idx_tenants_document_number ON tenants(document_number);

-- 4. Insertar tipos de documentos por defecto para Colombia
INSERT INTO document_types (code, name, description, country, display_order) VALUES
('CC', 'Cédula de Ciudadanía', 'Documento de identidad para ciudadanos colombianos mayores de edad', 'CO', 1),
('CE', 'Cédula de Extranjería', 'Documento de identidad para extranjeros residentes en Colombia', 'CO', 2),
('TI', 'Tarjeta de Identidad', 'Documento de identidad para menores de edad', 'CO', 3),
('NIT', 'Número de Identificación Tributaria', 'Identificación tributaria para empresas y personas jurídicas', 'CO', 4),
('PAS', 'Pasaporte', 'Documento de viaje internacional', 'CO', 5),
('RC', 'Registro Civil', 'Documento de identidad para niños menores de 7 años', 'CO', 6),
('DNI', 'Documento Nacional de Identidad', 'Documento de identidad general', 'DEFAULT', 7),
('RUT', 'Registro Único Tributario', 'Identificación tributaria', 'DEFAULT', 8),
('OTHER', 'Otro', 'Otro tipo de documento', 'DEFAULT', 99)
ON CONFLICT (code) DO NOTHING;

-- 5. Comentarios en las tablas
COMMENT ON TABLE document_types IS 'Catálogo de tipos de documentos de identidad';
COMMENT ON COLUMN document_types.code IS 'Código único del tipo de documento (ej: CC, NIT, PAS)';
COMMENT ON COLUMN document_types.name IS 'Nombre descriptivo del tipo de documento';
COMMENT ON COLUMN document_types.country IS 'Código de país ISO 3166-1 alpha-2 (CO, US, etc.) o DEFAULT';
COMMENT ON COLUMN document_types.is_active IS 'Indica si el tipo de documento está activo y disponible';
COMMENT ON COLUMN document_types.display_order IS 'Orden de visualización en listas';

COMMENT ON COLUMN tenants.document_type_id IS 'Tipo de documento del tenant (referencia a document_types)';
COMMENT ON COLUMN tenants.document_number IS 'Número de documento del tenant';
