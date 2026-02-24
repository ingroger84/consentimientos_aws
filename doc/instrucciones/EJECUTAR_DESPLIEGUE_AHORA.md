# 🚀 EJECUTAR DESPLIEGUE AHORA

**IMPORTANTE:** El servidor AWS no es accesible por SSH desde mi ubicación.  
**Necesitas ejecutar estos comandos TÚ MISMO.**

---

## ⚡ OPCIÓN RÁPIDA (Recomendada)

### Paso 1: Abrir PowerShell como Administrador

```
Presiona: Windows + X
Selecciona: Windows PowerShell (Admin)
```

### Paso 2: Ir al directorio del proyecto

```powershell
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL
```

### Paso 3: Conectarse al servidor

```powershell
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### Paso 4: Copiar y pegar estos comandos (TODO DE UNA VEZ)

```bash
# Actualizar código
cd /var/www/consentimientos
git pull origin main

# Aplicar migración
cd backend
node apply-region-migration.js

# Compilar backend
npm install
npm run build

# Compilar frontend
cd ../frontend
npm install
npm run build

# Reiniciar servicios
pm2 restart all
sudo systemctl reload nginx

# Verificar
curl http://localhost:3000/api/plans/public | head -n 20

echo ""
echo "✅ DESPLIEGUE COMPLETADO"
echo "Verifica en: https://archivoenlinea.com"
```

---

## 📋 OPCIÓN PASO A PASO (Si prefieres ir despacio)

### 1. Conectarse

```powershell
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### 2. Actualizar código

```bash
cd /var/www/consentimientos
git pull origin main
```

**Debe mostrar:** "Updating..." y lista de archivos actualizados

### 3. Aplicar migración

```bash
cd backend
node apply-region-migration.js
```

**Debe mostrar:**
```
✅ Migración aplicada exitosamente
📊 Primeros 5 tenants actualizados
📈 Distribución de tenants por región
```

### 4. Compilar backend

```bash
npm install
npm run build
```

**Debe mostrar:** "Build successful"

### 5. Compilar frontend

```bash
cd ../frontend
npm install
npm run build
```

**Debe mostrar:** "Build successful" y "dist folder created"

### 6. Reiniciar servicios

```bash
pm2 restart all
sudo systemctl reload nginx
```

**Debe mostrar:** "✓ All processes restarted"

### 7. Verificar

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

## ✅ VERIFICAR QUE FUNCIONA

### 1. Abrir navegador

```
https://archivoenlinea.com
```

### 2. Ir a sección de precios

Debe mostrar:
- **"Precios en COP para Colombia"**
- Precios: $89,900 - $189,900 COP

### 3. Verificar con VPN USA (Opcional)

1. Conectar VPN a USA
2. Abrir: https://archivoenlinea.com
3. Debe mostrar: **"Precios en USD for United States"**
4. Precios: $79 - $249 USD

---

## 🐛 SI HAY PROBLEMAS

### Error: "git pull fails"

```bash
cd /var/www/consentimientos
git stash
git pull origin main
```

### Error: "node apply-region-migration.js fails"

```bash
# Verificar que PostgreSQL está corriendo
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

---

## 📊 VERIFICAR LOGS

### Ver logs de PM2

```bash
pm2 logs backend --lines 50
```

### Ver logs de Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ CHECKLIST

Marca cada paso cuando lo completes:

- [ ] Conectado al servidor
- [ ] Código actualizado (git pull)
- [ ] Migración aplicada
- [ ] Backend compilado
- [ ] Frontend compilado
- [ ] Servicios reiniciados
- [ ] API verificada (curl)
- [ ] Landing page verificada (navegador)
- [ ] Precios en COP visibles
- [ ] Sin errores en logs

---

## 🎯 RESULTADO ESPERADO

Después de ejecutar todos los comandos:

✅ Landing page muestra: "Precios en COP para Colombia"  
✅ Precios en: $89,900 - $189,900 COP  
✅ API retorna: `{"region": "Colombia", "currency": "COP", ...}`  
✅ Tenants existentes mantienen sus precios  
✅ Sistema funcionando con multi-región  

---

## 📞 SI NECESITAS AYUDA

1. **Ver logs:** `pm2 logs backend`
2. **Verificar base de datos:**
   ```bash
   sudo -u postgres psql consentimientos
   SELECT region, currency, COUNT(*) FROM tenants GROUP BY region, currency;
   ```
3. **Consultar documentación:** `COMANDOS_DESPLIEGUE_AWS.md`

---

## 🚀 ¡ADELANTE!

**TODO ESTÁ LISTO.** Solo necesitas:

1. Abrir PowerShell
2. Conectarte al servidor
3. Copiar y pegar los comandos
4. ¡Listo!

**El sistema multi-región estará funcionando en 5 minutos.** ⏱️

---

**Versión:** 30.1.0  
**Fecha:** 2026-02-08  
**Estado:** Listo para Ejecutar
