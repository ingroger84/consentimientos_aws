#!/bin/bash

###############################################################################
# Script de Despliegue Multi-Región
# Versión: 30.0.1
# Fecha: 2026-02-08
# 
# Este script despliega el sistema multi-región en AWS
###############################################################################

set -e  # Salir si hay algún error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     DESPLIEGUE SISTEMA MULTI-REGIÓN v30.0.1                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

###############################################################################
# PASO 1: Actualizar código desde GitHub
###############################################################################

print_step "PASO 1: Actualizando código desde GitHub..."
cd /var/www/consentimientos

# Guardar cambios locales si existen
if [[ -n $(git status -s) ]]; then
    print_warning "Hay cambios locales, guardando..."
    git stash
fi

# Actualizar código
git pull origin main

if [ $? -eq 0 ]; then
    print_success "Código actualizado exitosamente"
else
    print_error "Error actualizando código"
    exit 1
fi

echo ""

###############################################################################
# PASO 2: Aplicar migración de base de datos
###############################################################################

print_step "PASO 2: Aplicando migración de base de datos..."
cd /var/www/consentimientos/backend

# Verificar que el archivo de migración existe
if [ ! -f "apply-region-migration.js" ]; then
    print_error "Archivo de migración no encontrado"
    exit 1
fi

# Aplicar migración
node apply-region-migration.js

if [ $? -eq 0 ]; then
    print_success "Migración aplicada exitosamente"
else
    print_error "Error aplicando migración"
    exit 1
fi

echo ""

###############################################################################
# PASO 3: Instalar dependencias del backend
###############################################################################

print_step "PASO 3: Instalando dependencias del backend..."
cd /var/www/consentimientos/backend

npm install --production

if [ $? -eq 0 ]; then
    print_success "Dependencias del backend instaladas"
else
    print_error "Error instalando dependencias del backend"
    exit 1
fi

echo ""

###############################################################################
# PASO 4: Compilar backend
###############################################################################

print_step "PASO 4: Compilando backend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Backend compilado exitosamente"
else
    print_error "Error compilando backend"
    exit 1
fi

echo ""

###############################################################################
# PASO 5: Instalar dependencias del frontend
###############################################################################

print_step "PASO 5: Instalando dependencias del frontend..."
cd /var/www/consentimientos/frontend

npm install --production

if [ $? -eq 0 ]; then
    print_success "Dependencias del frontend instaladas"
else
    print_error "Error instalando dependencias del frontend"
    exit 1
fi

echo ""

###############################################################################
# PASO 6: Compilar frontend
###############################################################################

print_step "PASO 6: Compilando frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend compilado exitosamente"
else
    print_error "Error compilando frontend"
    exit 1
fi

echo ""

###############################################################################
# PASO 7: Reiniciar servicios
###############################################################################

print_step "PASO 7: Reiniciando servicios..."

# Reiniciar PM2
pm2 restart all

if [ $? -eq 0 ]; then
    print_success "Servicios PM2 reiniciados"
else
    print_warning "Error reiniciando PM2, continuando..."
fi

# Recargar Nginx
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    print_success "Nginx recargado"
else
    print_warning "Error recargando Nginx, continuando..."
fi

echo ""

###############################################################################
# PASO 8: Verificar despliegue
###############################################################################

print_step "PASO 8: Verificando despliegue..."

# Verificar API
echo "Verificando API de planes..."
API_RESPONSE=$(curl -s http://localhost:3000/api/plans/public)

if echo "$API_RESPONSE" | grep -q "region"; then
    print_success "API respondiendo correctamente"
    echo "$API_RESPONSE" | head -n 5
else
    print_warning "API no responde como se esperaba"
fi

echo ""

# Verificar tenants migrados
echo "Verificando tenants migrados..."
cd /var/www/consentimientos/backend

TENANT_CHECK=$(node -e "
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

client.connect()
  .then(() => client.query('SELECT COUNT(*) as count FROM tenants WHERE region IS NOT NULL'))
  .then(result => {
    console.log('Tenants con región:', result.rows[0].count);
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
")

if [ $? -eq 0 ]; then
    print_success "Base de datos verificada"
    echo "$TENANT_CHECK"
else
    print_warning "No se pudo verificar base de datos"
fi

echo ""

###############################################################################
# RESUMEN FINAL
###############################################################################

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  DESPLIEGUE COMPLETADO                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
print_success "✓ Código actualizado desde GitHub"
print_success "✓ Migración de base de datos aplicada"
print_success "✓ Backend compilado"
print_success "✓ Frontend compilado"
print_success "✓ Servicios reiniciados"
echo ""
echo "Sistema multi-región desplegado exitosamente!"
echo ""
echo "Próximos pasos:"
echo "1. Verificar landing page: https://archivoenlinea.com"
echo "2. Verificar precios en COP para Colombia"
echo "3. Testing con VPN USA para verificar precios en USD"
echo ""
echo "Versión desplegada: 30.0.1"
echo "Fecha: $(date)"
echo ""
