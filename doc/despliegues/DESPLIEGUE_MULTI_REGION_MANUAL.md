# 🚀 DESPLIEGUE MANUAL MULTI-REGIÓN - PASO A PASO

**Versión:** 30.2.0  
**Fecha:** 2026-02-08  
**Estado:** Listo para Ejecutar

---

## ⚠️ IMPORTANTE

El servidor AWS **NO es accesible por SSH desde mi ubicación**.  
**Necesitas ejecutar el despliegue TÚ MISMO.**

---

## 📋 MÉTODO 1: COPIA Y PEGA TODO (MÁS RÁPIDO)

### Paso 1: Conectarse al Servidor

```powershell
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### Paso 2: Copiar y Pegar Este Bloque Completo

```bash
#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "  DESPLIEGUE SISTEMA MULTI-REGIÓN v30.2.0"
echo "════════════════════════════════════════════════════════════════"
echo ""

# PASO 1: Actualizar código
echo "▶ PASO 1/8: Actualizando código desde GitHub..."
cd /var/www/consentimientos
git stash 2>/dev/null || true
git pull origin main
echo "✓ Código actualizado"
echo ""

# PASO 2: Aplicar migración
echo "▶ PASO 2/8: Aplicando migración de base de datos..."
cd backend
node apply-region-migration.js
echo "✓ Migración aplicada"
echo ""

# PASO 3: Instalar dependencias backend
echo "▶ PASO 3/8: Instalando dependencias del backend..."
npm install
echo "✓ Dependencias instaladas"
echo ""

# PASO 4: Compilar backend
echo "▶ PASO 4/8: Compilando backend..."
npm run build
echo "✓ Backend compilado"
echo ""

# PASO 5: Instalar dependencias frontend
echo "▶ PASO 5/8: Instalando dependencias del frontend..."
cd ../frontend
npm install
echo "✓ Dependencias instaladas"
echo ""

# PASO 6: Compilar frontend
echo "▶ PASO 6/8: Compilando frontend..."
npm run build
echo "✓ Frontend compilado"
echo ""

# PASO 7: Reiniciar servicios
echo "▶ PASO 7/8: Reiniciando servicios..."
pm2 restart all
sudo systemctl reload nginx
echo "✓ Servicios reiniciados"
echo ""

# PASO 8: Verificar
echo "▶ PASO 8/8: Verificando despliegue..."
echo ""
echo "API Response:"
curl -s http://localhost:3000/api/plans/public | head -n 20
echo ""
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  ✓ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "1. Verificar: https://archivoenlinea.com"
echo "2. Debe mostrar: 'Precios en COP para Colombia'"
echo "3. Precios: $89,900 - $189,900 COP"
echo ""
```

**¡Eso es todo!** El script se ejecutará automáticamente.

---

## 📋 MÉTODO 2: PASO A PASO (SI PREFIERES IR DESPACIO)

### 1️⃣ Conectarse

```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### 2️⃣ Actualizar Código

```bash
cd /var/www/consentimientos
git stash
git pull origin main
```

**Verificar:** Debe mostrar "Updating..." y lista de archivos

### 3️⃣ Aplicar Migración

```bash
cd backend
node apply-region-migration.js
```

**Verificar:** Debe mostrar:
```
✅ Migración aplicada exitosamente
📊 Primeros 5 tenants actualizados
```

### 4️⃣ Compilar Backend

```bash
npm install
npm run build
```

**Verificar:** Debe mostrar "Build successful"

### 5️⃣ Compilar Frontend

```bash
cd ../frontend
npm install
npm run build
```

**Verificar:** Debe mostrar "Build successful"

### 6️⃣ Reiniciar Servicios

```bash
pm2 restart all
sudo systemctl reload nginx
```

**Verificar:** Debe mostrar "✓ All processes restarted"

### 7️⃣ Verificar API

```bash
curl http://localhost:3000/api/plans/public
```

**Debe mostrar:**
```json
{
  "region": "Colombia",
  "currency": "COP",
  "symbol": "$",
  "plans": [...]
}
```

---

## ✅ VERIFICACIÓN FINAL

### 1. Abrir Navegador

```
https://archivoenlinea.com
```

### 2. Ir a Sección de Precios

**Debe mostrar:**
- ✅ "Precios en COP para Colombia"
- ✅ Básico: $89,900/mes
- ✅ Emprendedor: $119,900/mes
- ✅ Plus: $149,900/mes
- ✅ Empresarial: $189,900/mes

### 3. Verificar con VPN USA (Opcional)

1. Conectar VPN a Estados Unidos
2. Abrir: https://archivoenlinea.com
3. **Debe mostrar:**
   - ✅ "Precios en USD for United States"
   - ✅ Basic: $79/mes
   - ✅ Professional: $119/mes
   - ✅ Plus: $169/mes
   - ✅ Enterprise: $249/mes

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "git pull fails"

```bash
cd /var/www/consentimientos
git stash
git pull origin main
```

### Error: "node apply-region-migration.js fails"

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar .env
cd /var/www/consentimientos/backend
cat .env | grep DB_
```

### Error: "npm install fails"

```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules
npm install
```

### Error: "pm2 not found"

```bash
sudo npm install -g pm2
```

### Error: "Permission denied"

```bash
# Dar permisos
sudo chown -R ubuntu:ubuntu /var/www/consentimientos
```

---

## 📊 VERIFICAR LOGS

### Ver Logs de Backend

```bash
pm2 logs backend --lines 50
```

### Ver Logs de Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### Ver Logs de PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🔍 VERIFICAR BASE DE DATOS

### Conectarse a PostgreSQL

```bash
sudo -u postgres psql consentimientos
```

### Verificar Tenants Migrados

```sql
SELECT 
  id,
  name,
  region,
  currency,
  plan_price_original,
  price_locked
FROM tenants
LIMIT 10;
```

**Debe mostrar:**
- region = 'CO'
- currency = 'COP'
- price_locked = true

### Verificar Distribución por Región

```sql
SELECT 
  region,
  currency,
  COUNT(*) as total
FROM tenants
GROUP BY region, currency;
```

**Debe mostrar:**
```
 region | currency | total
--------+----------+-------
 CO     | COP      | [número de tenants]
```

### Salir de PostgreSQL

```sql
\q
```

---

## ✅ CHECKLIST DE DESPLIEGUE

Marca cada paso cuando lo completes:

- [ ] Conectado al servidor AWS
- [ ] Código actualizado (git pull)
- [ ] Migración aplicada exitosamente
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] Servicios reiniciados (pm2 + nginx)
- [ ] API verificada (curl)
- [ ] Landing page verificada (navegador)
- [ ] Precios en COP visibles
- [ ] Sin errores en logs
- [ ] Base de datos verificada

---

## 🎯 RESULTADO ESPERADO

Después de completar todos los pasos:

✅ **Landing Page:**
- Muestra: "Precios en COP para Colombia"
- Precios: $89,900 - $189,900 COP
- Formato correcto sin decimales

✅ **API:**
- Endpoint: `/api/plans/public`
- Retorna: `{"region": "Colombia", "currency": "COP", ...}`
- Precios dinámicos según región

✅ **Base de Datos:**
- Tenants existentes: region='CO', currency='COP'
- price_locked=true (mantienen precios actuales)
- Nuevos campos agregados correctamente

✅ **Servicios:**
- Backend corriendo sin errores
- Frontend servido correctamente
- Nginx funcionando
- Sin errores en logs

---

## 📈 PRÓXIMOS PASOS

### Inmediato:
1. ✅ Verificar que todo funciona
2. ✅ Testing con VPN USA
3. ✅ Verificar logs por 24 horas

### Fase 3 (Futuro):
1. ⏳ Integrar Stripe para pagos en USD
2. ⏳ Testing de facturación USA
3. ⏳ Lanzamiento oficial mercado USA

---

## 📞 SOPORTE

### Si necesitas ayuda:

1. **Revisar logs:**
   ```bash
   pm2 logs backend --lines 100
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verificar servicios:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

3. **Consultar documentación:**
   - `ESTADO_FINAL_MULTI_REGION.md`
   - `COMANDOS_DESPLIEGUE_AWS.md`
   - `doc/98-estrategia-multi-mercado/FAQ.md`

---

## 💡 TIPS

### Tip 1: Guardar Output
```bash
# Guardar output del despliegue
script despliegue-$(date +%Y%m%d-%H%M%S).log
# Ejecutar comandos
# Presionar Ctrl+D para terminar
```

### Tip 2: Verificar Antes de Desplegar
```bash
# Ver qué archivos cambiarán
cd /var/www/consentimientos
git fetch origin main
git diff HEAD origin/main --name-only
```

### Tip 3: Backup Antes de Desplegar
```bash
# Backup de base de datos
sudo -u postgres pg_dump consentimientos > backup-$(date +%Y%m%d).sql
```

---

## ✅ CONCLUSIÓN

**TODO ESTÁ IMPLEMENTADO Y LISTO.**

**Solo necesitas:**
1. Conectarte al servidor AWS
2. Copiar y pegar el bloque de comandos
3. Esperar 5 minutos
4. ¡Listo! 🚀

**El sistema multi-región estará funcionando.**

---

**Versión:** 30.2.0  
**Fecha:** 2026-02-08  
**Estado:** ✅ Listo para Ejecutar  
**Tiempo Estimado:** 5-10 minutos

