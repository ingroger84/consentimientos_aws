#!/bin/bash
set -e

echo "🚀 Iniciando despliegue a producción..."
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Debes estar en la rama 'main' para desplegar${NC}"
    exit 1
fi

# Verificar que no hay cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Error: Hay cambios sin commitear${NC}"
    git status -s
    exit 1
fi

# 1. Backup de base de datos
echo -e "${YELLOW}📦 Creando backup de base de datos...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE > backups/$BACKUP_FILE
echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"

# 2. Pull latest code
echo -e "${YELLOW}📥 Obteniendo último código...${NC}"
git pull origin main
echo -e "${GREEN}✅ Código actualizado${NC}"

# 3. Install backend dependencies
echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
cd backend
npm ci --production
echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"

# 4. Run migrations
echo -e "${YELLOW}🔄 Ejecutando migraciones de base de datos...${NC}"
npm run migration:run
echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"

# 5. Build backend
echo -e "${YELLOW}🏗️  Compilando backend...${NC}"
npm run build
echo -e "${GREEN}✅ Backend compilado${NC}"

# 6. Install frontend dependencies
echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
npm ci
echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"

# 7. Build frontend
echo -e "${YELLOW}🏗️  Compilando frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend compilado${NC}"

# 8. Restart services with PM2
echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
cd ..
pm2 restart ecosystem.config.js --env production
echo -e "${GREEN}✅ Servicios reiniciados${NC}"

# 9. Health check
echo -e "${YELLOW}🏥 Verificando salud del servicio...${NC}"
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Servicio saludable${NC}"
else
    echo -e "${RED}❌ Error: Servicio no responde correctamente (HTTP $HEALTH_CHECK)${NC}"
    echo -e "${YELLOW}Revirtiendo despliegue...${NC}"
    pm2 restart ecosystem.config.js
    exit 1
fi

echo ""
echo -e "${GREEN}========================================"
echo -e "✅ Despliegue completado exitosamente!"
echo -e "========================================${NC}"
echo ""
echo "📊 Estado de los servicios:"
pm2 status
echo ""
echo "📝 Logs disponibles en:"
echo "  - Backend: ./logs/backend-out.log"
echo "  - Errores: ./logs/backend-err.log"
echo ""
echo "🔍 Monitorear con: pm2 monit"
