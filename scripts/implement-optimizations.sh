#!/bin/bash

# ============================================
# Script de Implementación de Optimizaciones
# ============================================
# Implementa todas las optimizaciones automáticamente
# Uso: ./implement-optimizations.sh

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IMPLEMENTACIÓN DE OPTIMIZACIONES         ║${NC}"
echo -e "${BLUE}║  Sistema DatAgree v31.0.0                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ Error: Ejecutar desde la raíz del proyecto${NC}"
    exit 1
fi

# Función para preguntar confirmación
confirm() {
    read -p "$1 (yes/no): " response
    if [ "$response" != "yes" ]; then
        echo -e "${RED}❌ Operación cancelada${NC}"
        exit 0
    fi
}

echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo -e "   Esta operación realizará cambios en:"
echo -e "   - Base de datos (crear índices)"
echo -e "   - Configuración del backend"
echo -e "   - Configuración de PM2"
echo ""
confirm "¿Desea continuar?"

# ============================================
# FASE 1: OPTIMIZACIONES DE BASE DE DATOS
# ============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}FASE 1: Optimizaciones de Base de Datos${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "${YELLOW}📊 Creando índices optimizados...${NC}"

# Crear archivo SQL temporal con todos los índices
cat > /tmp/create-indexes.sql << 'EOF'
-- Índices para Tenants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;

-- Índices para Users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Índices para Clients
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_document ON clients(document_number) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Índices para Medical Records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_client_id ON medical_records(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);

-- Índices para Consents
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consents_client_id ON consents(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consents_status ON consents(status);

-- Índices para Invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Tabla para caché de queries
CREATE TABLE IF NOT EXISTS query_result_cache (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255),
  time BIGINT NOT NULL,
  duration INT NOT NULL,
  query TEXT NOT NULL,
  result TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_cache_identifier ON query_result_cache(identifier);
EOF

# Ejecutar SQL
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USERNAME -d $DB_DATABASE -f /tmp/create-indexes.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Índices creados exitosamente${NC}"
else
    echo -e "${RED}❌ Error al crear índices${NC}"
    exit 1
fi

# Limpiar archivo temporal
rm /tmp/create-indexes.sql

# ============================================
# FASE 2: OPTIMIZACIONES DEL BACKEND
# ============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}FASE 2: Optimizaciones del Backend${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
cd backend
npm install

echo -e "${YELLOW}🔨 Compilando backend...${NC}"
NODE_OPTIONS='--max-old-space-size=2048' npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend compilado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al compilar backend${NC}"
    exit 1
fi

cd ..

# ============================================
# FASE 3: ACTUALIZAR PM2
# ============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}FASE 3: Actualizar PM2${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "${YELLOW}🔄 Reiniciando PM2...${NC}"
pm2 restart datagree

sleep 5

# Verificar estado
pm2 list | grep datagree

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PM2 reiniciado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al reiniciar PM2${NC}"
    exit 1
fi

# ============================================
# VERIFICACIÓN FINAL
# ============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICACIÓN FINAL${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "${YELLOW}🔍 Verificando API...${NC}"
sleep 3
curl -s http://localhost:3000/api/health | head -5

echo ""
echo -e "${GREEN}✅ IMPLEMENTACIÓN COMPLETADA${NC}"
echo ""
echo -e "${BLUE}📊 Próximos pasos:${NC}"
echo -e "   1. Monitorear logs: pm2 logs datagree"
echo -e "   2. Verificar uso de memoria: pm2 monit"
echo -e "   3. Probar endpoints críticos"
echo -e "   4. Configurar sistema de backups (ver SISTEMA_BACKUPS_S3.md)"
echo ""
