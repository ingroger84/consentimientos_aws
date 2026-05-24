#!/bin/bash
# Script de Despliegue v92.3.18 - Corrección Webhook Bold
# Fecha: 20 de mayo de 2026

echo "========================================"
echo "  DESPLIEGUE v92.3.18"
echo "  Corrección Webhook Bold"
echo "========================================"
echo ""

# Paso 1: Editar .env
echo "📝 Paso 1: Editando .env..."
cd /home/ubuntu/consentimientos_aws/backend
sed -i 's/#BOLD_WEBHOOK_SECRET=/BOLD_WEBHOOK_SECRET=/g' .env
echo "✅ .env actualizado"
echo ""

# Verificar cambio
echo "🔍 Verificando cambio:"
grep 'BOLD_WEBHOOK_SECRET' .env
echo ""

# Paso 2: Reiniciar PM2
echo "🔄 Paso 2: Reiniciando PM2..."
pm2 restart datagree
pm2 status
echo ""
echo "✅ PM2 reiniciado"
echo ""

# Paso 3: Verificar configuración
echo "🔍 Paso 3: Verificando configuración..."
cd /home/ubuntu/consentimientos_aws/backend
node -e "require('dotenv').config(); console.log('BOLD_WEBHOOK_SECRET:', process.env.BOLD_WEBHOOK_SECRET ? '✅ Configurado' : '❌ NO configurado');"
echo ""

echo "========================================"
echo "  ✅ DESPLIEGUE COMPLETADO"
echo "========================================"
