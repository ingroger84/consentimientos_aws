#!/bin/bash
# Script de Despliegue v90 - Ejecutar en el servidor
# Corrección Integración DynamiaERP

set -e  # Salir si hay error

echo "========================================"
echo "  DESPLIEGUE v90: Corrección DynamiaERP"
echo "========================================"
echo ""

REMOTE_PATH="/home/ubuntu/archivo-en-linea"

# Verificar que estamos en el directorio correcto
if [ ! -d "$REMOTE_PATH" ]; then
    echo "❌ Error: Directorio $REMOTE_PATH no encontrado"
    exit 1
fi

cd $REMOTE_PATH

# Paso 1: Backup del .env actual
echo "📦 Paso 1: Haciendo backup de .env..."
cd backend
cp .env .env.backup-v90-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup creado"
echo ""

# Paso 2: Actualizar .env
echo "⚙️  Paso 2: Actualizando .env..."
sed -i 's|DYNAMIAERP_BASE_URL=.*|DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co|g' .env

# Verificar que las otras variables existan
grep -q 'DYNAMIAERP_TOKEN=' .env || echo 'DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6' >> .env
grep -q 'DYNAMIAERP_LLAVE_TECNICA=' .env || echo 'DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca' >> .env
grep -q 'DYNAMIAERP_SUCURSAL=' .env || echo 'DYNAMIAERP_SUCURSAL=PRINCIPAL' >> .env

echo "Configuración DynamiaERP actualizada:"
grep 'DYNAMIAERP_' .env
echo "✅ .env actualizado"
echo ""

# Paso 3: Reiniciar backend
echo "🔄 Paso 3: Reiniciando backend..."
cd $REMOTE_PATH
pm2 restart backend
sleep 3
echo "✅ Backend reiniciado"
echo ""

# Paso 4: Verificar logs
echo "📋 Paso 4: Verificando logs..."
pm2 logs backend --lines 20 --nostream
echo ""

# Paso 5: Probar conexión
echo "🧪 Paso 5: Probando conexión con DynamiaERP..."
node backend/test-dynamiaerp-correct-endpoint.js
echo ""

echo "========================================"
echo "  ✅ DESPLIEGUE COMPLETADO"
echo "========================================"
echo ""
echo "📋 Próximos pasos:"
echo "1. Reenviar factura de Aquiub:"
echo "   node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740"
echo ""
echo "2. Verificar CUFE generado:"
echo "   node backend/diagnose-dynamiaerp-invoice.js"
echo ""
echo "3. Monitorear logs:"
echo "   pm2 logs backend"
echo ""
