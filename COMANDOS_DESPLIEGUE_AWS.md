# 🚀 Comandos para Desplegar en AWS

**Versión:** 30.0.1  
**Fecha:** 2026-02-08

---

## ⚠️ IMPORTANTE

El servidor AWS no está respondiendo por SSH desde aquí. Necesitas ejecutar estos comandos **directamente en el servidor** o desde tu máquina local con acceso SSH.

---

## 📋 OPCIÓN 1: Script Automatizado (Recomendado)

### Desde Windows (PowerShell):

```powershell
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL
.\scripts\deploy-multi-region.ps1
```

### Desde Linux/Mac:

```bash
cd /ruta/al/proyecto
chmod +x scripts/deploy-multi-region.sh
./scripts/deploy-multi-region.sh
```

---

## 📋 OPCIÓN 2: Comandos Manuales

### 1. Conectarse al Servidor

```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### 2. Actualizar Código

```bash
cd /var/www/consentimientos
git pull origin main
```

### 3. Aplicar Migración

```bash
cd /var/www/consentimientos/backend
node apply-region-migration.js
```

**Resultado esperado:**
```
✅ Migración aplicada exitosamente
📊 Primeros 5 tenants actualizados
📈 Distribución de tenants por región
```

### 4. Instalar y Compilar Backend

```bash
cd /var/www/consentimientos/backend
npm install
npm run build
```

### 5. Instalar y Compilar Frontend

```bash
cd /var/www/consentimientos/frontend
npm install
npm run build
```

### 6. Reiniciar Servicios

```bash
pm2 restart all
sudo systemctl reload nginx
```

### 7. Verificar Despliegue

```bash
# Verificar API
curl http://localhost:3000/api/plans/public

# Verificar tenants
cd /var/www/consentimientos/backend
node -e "
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
  .then(() => client.query('SELECT region, currency, COUNT(*) as count FROM tenants GROUP BY region, currency'))
  .then(result => {
    console.table(result.rows);
    return client.end();
  });
"
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar Landing Page

Abrir en navegador: `https://archivoenlinea.com`

**Debe mostrar:**
- "Precios en COP para Colombia"
- Precios: $89,900 - $189,900 COP

### 2. Verificar API

```bash
curl https://archivoenlinea.com/api/plans/public
```

**Debe retornar:**
```json
{
  "region": "Colombia",
  "currency": "COP",
  "symbol": "$",
  "taxRate": 0.19,
  "taxName": "IVA",
  "plans": [...]
}
```

### 3. Verificar con VPN USA

1. Conectar VPN a servidor USA
2. Abrir: `https://archivoenlinea.com`
3. Debe mostrar: "Precios en USD for United States"
4. Precios: $79 - $249 USD

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar variables de entorno
cd /var/www/consentimientos/backend
cat .env | grep DB_
```

### Error: "npm install fails"

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Error: "pm2 not found"

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2
```

### Error: "Permission denied"

```bash
# Dar permisos correctos
sudo chown -R ubuntu:ubuntu /var/www/consentimientos
```

---

## 📊 Verificar Estado del Sistema

### Ver Logs de PM2

```bash
pm2 logs backend
pm2 logs frontend
```

### Ver Logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ver Estado de Servicios

```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## ✅ Checklist de Despliegue

- [ ] Conectado al servidor
- [ ] Código actualizado (git pull)
- [ ] Migración aplicada
- [ ] Backend compilado
- [ ] Frontend compilado
- [ ] Servicios reiniciados
- [ ] API verificada
- [ ] Landing page verificada
- [ ] Tenants verificados
- [ ] Sin errores en logs

---

## 🎯 Resultado Esperado

Después del despliegue:

✅ **Colombia:** Usuarios ven precios en COP  
✅ **USA:** Usuarios ven precios en USD  
✅ **Tenants existentes:** Mantienen precios en COP  
✅ **Sistema:** Funcionando con multi-región  

---

## 📞 Si Necesitas Ayuda

1. Revisar logs: `pm2 logs backend`
2. Verificar base de datos
3. Revisar documentación: `INSTRUCCIONES_DESPLIEGUE_MULTI_REGION.md`

---

**Versión:** 30.0.1  
**Fecha:** 2026-02-08  
**Estado:** Listo para Desplegar
