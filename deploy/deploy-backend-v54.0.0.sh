#!/bin/bash

# Script de despliegue para v54.0.0 - Mejoras Sistema de Perfiles
# Este script despliega las mejoras de seguridad y control de acceso al módulo de perfiles

set -e

echo "========================================="
echo "  DESPLIEGUE v54.0.0"
echo "  Mejoras Sistema de Perfiles"
echo "========================================="
echo ""

# Variables
SERVER_USER="ubuntu"
SERVER_HOST="100.28.198.249"
SERVER_PATH="/home/ubuntu/consentimientos_aws"
LOCAL_BACKEND="./backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$SERVER_PATH/backups/v54.0.0_$TIMESTAMP"

echo "📋 Configuración:"
echo "   Servidor: $SERVER_USER@$SERVER_HOST"
echo "   Ruta: $SERVER_PATH"
echo "   Backup: $BACKUP_DIR"
echo ""

# Función para ejecutar comandos en el servidor
run_remote() {
    ssh -i "credentials/AWS-ISSABEL.pem" "$SERVER_USER@$SERVER_HOST" "$1"
}

# Función para copiar archivos al servidor
copy_to_server() {
    scp -i "credentials/AWS-ISSABEL.pem" -r "$1" "$SERVER_USER@$SERVER_HOST:$2"
}

echo "🔍 Paso 1: Verificar conexión al servidor..."
if run_remote "echo 'Conexión exitosa'"; then
    echo "✅ Conexión establecida"
else
    echo "❌ Error: No se pudo conectar al servidor"
    exit 1
fi
echo ""

echo "📦 Paso 2: Crear backup del código actual..."
run_remote "mkdir -p $BACKUP_DIR"
run_remote "cp -r $SERVER_PATH/backend/dist $BACKUP_DIR/" || echo "⚠️  No hay dist anterior"
run_remote "cp -r $SERVER_PATH/backend/src $BACKUP_DIR/" || echo "⚠️  No hay src anterior"
run_remote "cp $SERVER_PATH/backend/package.json $BACKUP_DIR/" || echo "⚠️  No hay package.json anterior"
echo "✅ Backup creado en $BACKUP_DIR"
echo ""

echo "🏗️  Paso 3: Compilar backend localmente..."
cd "$LOCAL_BACKEND"
echo "   Instalando dependencias..."
npm install --silent
echo "   Compilando TypeScript..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend compilado exitosamente"
else
    echo "❌ Error al compilar backend"
    exit 1
fi
cd ..
echo ""

echo "📤 Paso 4: Subir archivos al servidor..."
echo "   Subiendo dist/..."
copy_to_server "$LOCAL_BACKEND/dist" "$SERVER_PATH/backend/"
echo "   Subiendo src/..."
copy_to_server "$LOCAL_BACKEND/src" "$SERVER_PATH/backend/"
echo "   Subiendo package.json..."
copy_to_server "$LOCAL_BACKEND/package.json" "$SERVER_PATH/backend/"
echo "   Subiendo scripts de migración..."
copy_to_server "$LOCAL_BACKEND/ensure-profile-codes.js" "$SERVER_PATH/backend/"
echo "✅ Archivos subidos"
echo ""

echo "📦 Paso 5: Instalar dependencias en servidor..."
run_remote "cd $SERVER_PATH/backend && npm install --production"
echo "✅ Dependencias instaladas"
echo ""

echo "🗄️  Paso 6: Ejecutar script de códigos de perfiles..."
echo "   Este script asegura que todos los perfiles tengan código único"
run_remote "cd $SERVER_PATH/backend && node ensure-profile-codes.js"
echo "✅ Códigos de perfiles actualizados"
echo ""

echo "🔄 Paso 7: Reiniciar aplicación con PM2..."
run_remote "pm2 restart datagree --update-env"
echo "✅ Aplicación reiniciada"
echo ""

echo "⏳ Paso 8: Esperar que la aplicación inicie..."
sleep 5
echo ""

echo "🏥 Paso 9: Verificar estado de la aplicación..."
run_remote "pm2 status datagree"
echo ""

echo "🔍 Paso 10: Verificar logs..."
echo "   Últimas 20 líneas del log:"
run_remote "pm2 logs datagree --lines 20 --nostream"
echo ""

echo "✅ Paso 11: Verificar health check..."
HEALTH_CHECK=$(run_remote "curl -s http://localhost:3000/health || echo 'ERROR'")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "✅ Health check: OK"
else
    echo "⚠️  Health check: No disponible (puede tardar unos segundos)"
fi
echo ""

echo "========================================="
echo "  ✅ DESPLIEGUE COMPLETADO"
echo "========================================="
echo ""
echo "📊 Resumen de cambios v54.0.0:"
echo "   ✅ Decorador @RequireSuperAdmin() implementado"
echo "   ✅ Endpoints de perfiles protegidos (solo super admin)"
echo "   ✅ Endpoints de módulos protegidos (solo super admin)"
echo "   ✅ Guard de permisos mejorado"
echo "   ✅ Códigos de perfiles asegurados"
echo ""
echo "🔒 Seguridad:"
echo "   ✅ Solo Super Admin puede gestionar perfiles"
echo "   ✅ Validación en todos los endpoints"
echo "   ✅ Mensajes de error 403 claros"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Desplegar frontend con componentes de protección"
echo "   2. Probar acceso con super admin"
echo "   3. Probar acceso con usuario normal (debe denegar)"
echo "   4. Verificar que menú de perfiles solo aparece para super admin"
echo ""
echo "🔗 URLs:"
echo "   Backend: https://archivoenlinea.com/api"
echo "   Health: https://archivoenlinea.com/api/health"
echo "   Swagger: https://archivoenlinea.com/api/docs"
echo ""
echo "📞 Comandos útiles:"
echo "   Ver logs: ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'"
echo "   Ver estado: ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 status'"
echo "   Reiniciar: ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 restart datagree'"
echo ""
