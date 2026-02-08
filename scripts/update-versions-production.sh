#!/bin/bash

# Script para actualizar versiones en producción
# Fecha: 2026-02-07

echo "=== Actualizando versiones en producción ==="

cd /home/ubuntu/consentimientos_aws

# Actualizar frontend
echo "Actualizando frontend package.json..."
sed -i 's/"version": "26.0.3"/"version": "28.1.1"/' frontend/package.json

# Actualizar backend
echo "Actualizando backend package.json..."
sed -i 's/"version": "26.0.3"/"version": "28.1.1"/' backend/package.json

# Verificar cambios
echo ""
echo "=== Versiones actualizadas ==="
echo "Frontend:"
cat frontend/package.json | grep '"version"'
echo ""
echo "Backend:"
cat backend/package.json | grep '"version"'

echo ""
echo "✅ Versiones sincronizadas a 28.1.1"
