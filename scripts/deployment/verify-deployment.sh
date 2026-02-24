#!/bin/bash

# ============================================
# Script de Verificación de Despliegue
# Verifica que la versión correcta esté desplegada
# ============================================

echo "============================================"
echo "  VERIFICACIÓN DE DESPLIEGUE"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar version.json
echo -e "${CYAN}📋 Verificando version.json...${NC}"
if [ -f /var/www/consentimientos/frontend/version.json ]; then
    echo -e "${GREEN}✅ version.json encontrado${NC}"
    cat /var/www/consentimientos/frontend/version.json
    echo ""
else
    echo -e "${RED}❌ version.json NO encontrado${NC}"
    echo ""
fi

# Verificar index.html
echo -e "${CYAN}📄 Verificando index.html...${NC}"
if [ -f /var/www/consentimientos/frontend/index.html ]; then
    echo -e "${GREEN}✅ index.html encontrado${NC}"
    
    # Extraer timestamp del index.html
    BUILD_TIMESTAMP=$(grep -oP 'build-timestamp" content="\K[^"]+' /var/www/consentimientos/frontend/index.html || echo "No encontrado")
    APP_VERSION=$(grep -oP 'app-version" content="\K[^"]+' /var/www/consentimientos/frontend/index.html || echo "No encontrado")
    
    echo "   Build Timestamp: $BUILD_TIMESTAMP"
    echo "   App Version: $APP_VERSION"
    echo ""
else
    echo -e "${RED}❌ index.html NO encontrado${NC}"
    echo ""
fi

# Verificar archivos JS con hash
echo -e "${CYAN}📦 Verificando archivos JavaScript...${NC}"
JS_FILES=$(find /var/www/consentimientos/frontend/assets -name "*.js" -type f 2>/dev/null | wc -l)
if [ $JS_FILES -gt 0 ]; then
    echo -e "${GREEN}✅ $JS_FILES archivos JavaScript encontrados${NC}"
    echo "   Últimos 5 archivos:"
    find /var/www/consentimientos/frontend/assets -name "*.js" -type f -printf "   %f\n" 2>/dev/null | head -5
    echo ""
else
    echo -e "${RED}❌ No se encontraron archivos JavaScript${NC}"
    echo ""
fi

# Verificar permisos
echo -e "${CYAN}🔐 Verificando permisos...${NC}"
OWNER=$(stat -c '%U:%G' /var/www/consentimientos/frontend 2>/dev/null || echo "unknown")
PERMS=$(stat -c '%a' /var/www/consentimientos/frontend 2>/dev/null || echo "unknown")
echo "   Owner: $OWNER"
echo "   Permisos: $PERMS"
echo ""

# Verificar PM2
echo -e "${CYAN}⚙️ Verificando PM2...${NC}"
pm2 list | grep -E "consentimientos|backend"
echo ""

# Verificar Nginx
echo -e "${CYAN}🌐 Verificando Nginx...${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está activo${NC}"
else
    echo -e "${RED}❌ Nginx NO está activo${NC}"
fi

# Verificar configuración de Nginx
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
else
    echo -e "${RED}❌ Configuración de Nginx tiene errores${NC}"
fi
echo ""

# Verificar caché de Nginx
echo -e "${CYAN}🧹 Verificando caché de Nginx...${NC}"
CACHE_SIZE=$(du -sh /var/cache/nginx 2>/dev/null | cut -f1 || echo "0")
echo "   Tamaño de caché: $CACHE_SIZE"
echo ""

# Test de conectividad
echo -e "${CYAN}🔗 Test de conectividad local...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Servidor responde (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Servidor no responde correctamente (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Verificar headers de caché
echo -e "${CYAN}📡 Verificando headers de caché...${NC}"
echo "   Headers de index.html:"
curl -s -I http://localhost/index.html 2>/dev/null | grep -i "cache-control" || echo "   No encontrado"
echo ""

# Resumen
echo "============================================"
echo -e "${GREEN}  VERIFICACIÓN COMPLETADA${NC}"
echo "============================================"
echo ""
echo -e "${YELLOW}⚠️ Si los usuarios no ven la versión correcta:${NC}"
echo "   1. Verificar que version.json tenga el timestamp correcto"
echo "   2. Limpiar caché de Nginx: sudo rm -rf /var/cache/nginx/*"
echo "   3. Recargar Nginx: sudo systemctl reload nginx"
echo "   4. Usuarios deben limpiar caché del navegador"
echo ""
