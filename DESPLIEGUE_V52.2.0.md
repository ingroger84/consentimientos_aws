# 🚀 Despliegue v52.2.0 - Sistema de Perfiles y Permisos

**Fecha:** 2026-03-01  
**Versión:** 52.2.0  
**Servidor:** demo-estetica.archivoenlinea.com (100.28.198.249)

---

## ⚠️ IMPORTANTE

Actualmente estás viendo la versión 51.0.0 en producción porque NO hemos desplegado la nueva versión al servidor AWS. Los cambios solo existen en tu máquina local.

**Local (localhost:5173):** ✅ v52.2.0  
**Producción (demo-estetica.archivoenlinea.com):** ❌ v51.0.0

---

## 📋 Plan de Despliegue

### Opción 1: Despliegue Manual (RECOMENDADO)

#### Paso 1: Preparar Archivos
```bash
# Ya está hecho - frontend/dist/ contiene la versión 52.2.0
```

#### Paso 2: Conectar al Servidor
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
```

#### Paso 3: Hacer Backup
```bash
# En el servidor
cd /var/www/html
sudo cp -r dist dist_backup_51.0.0_$(date +%Y%m%d_%H%M%S)
```

#### Paso 4: Subir Archivos
Desde tu máquina local:
```bash
# Comprimir dist
cd frontend
tar -czf dist-v52.2.0.tar.gz dist/

# Subir al servidor
scp -i ../credentials/AWS-ISSABEL.pem dist-v52.2.0.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
```

#### Paso 5: Descomprimir en el Servidor
```bash
# En el servidor
cd /home/ubuntu
tar -xzf dist-v52.2.0.tar.gz

# Reemplazar archivos
sudo rm -rf /var/www/html/dist/*
sudo cp -r dist/* /var/www/html/dist/
sudo chown -R www-data:www-data /var/www/html/dist
```

#### Paso 6: Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

#### Paso 7: Verificar
```bash
# Verificar version.json
curl https://demo-estetica.archivoenlinea.com/version.json

# Debe mostrar:
# {
#   "version": "52.2.0",
#   "buildDate": "2026-03-01",
#   "buildHash": "mm855r3o",
#   "buildTimestamp": "1772393217396"
# }
```

---

### Opción 2: Script Automático

#### Paso 1: Usar Script de Despliegue
```bash
cd deploy
./deploy-update.ps1
```

Este script:
1. Comprime frontend/dist
2. Sube al servidor
3. Hace backup
4. Reemplaza archivos
5. Reinicia nginx

---

## 🔧 Backend (Si es necesario)

### Actualizar Backend en Producción

#### Paso 1: Compilar Backend
```bash
cd backend
npm run build
```

#### Paso 2: Subir al Servidor
```bash
# Comprimir
tar -czf dist-backend-v52.2.0.tar.gz dist/

# Subir
scp -i ../credentials/AWS-ISSABEL.pem dist-backend-v52.2.0.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
```

#### Paso 3: Desplegar en Servidor
```bash
# En el servidor
cd /home/ubuntu/backend
tar -xzf ../dist-backend-v52.2.0.tar.gz

# Reiniciar PM2
pm2 restart datagree
pm2 save
```

---

## 📝 Checklist de Despliegue

### Pre-Despliegue
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] version.json actualizado a 52.2.0
- [ ] Backup de base de datos realizado
- [ ] Migración SQL lista (si aplica)

### Despliegue Frontend
- [ ] Conectado al servidor AWS
- [ ] Backup de archivos actuales creado
- [ ] Archivos nuevos subidos
- [ ] Permisos correctos aplicados
- [ ] Nginx reiniciado
- [ ] version.json verificado

### Despliegue Backend (Opcional)
- [ ] Backend compilado
- [ ] Archivos subidos
- [ ] PM2 reiniciado
- [ ] Logs verificados

### Post-Despliegue
- [ ] Versión 52.2.0 visible en producción
- [ ] Login funciona
- [ ] Página de perfiles carga
- [ ] Crear perfil funciona
- [ ] No hay errores en consola

---

## 🧪 Verificación Post-Despliegue

### 1. Verificar Versión
```bash
# Desde tu máquina
curl https://demo-estetica.archivoenlinea.com/version.json
```

Debe mostrar:
```json
{
  "version": "52.2.0",
  "buildDate": "2026-03-01",
  "buildHash": "mm855r3o",
  "buildTimestamp": "1772393217396"
}
```

### 2. Verificar en Navegador
1. Abrir: https://demo-estetica.archivoenlinea.com
2. Limpiar caché: Ctrl + Shift + Delete
3. Recargar: Ctrl + F5
4. Verificar footer: "v52.2.0"
5. Verificar DevTools Console: "Nueva versión: 52.2.0"

### 3. Verificar Funcionalidades
1. Login funciona
2. Dashboard carga
3. Menú "Perfiles" aparece
4. Página de perfiles carga
5. Crear perfil funciona

---

## 🔄 Rollback (Si algo sale mal)

### Restaurar Versión Anterior
```bash
# En el servidor
cd /var/www/html
sudo rm -rf dist/*
sudo cp -r dist_backup_51.0.0_*/* dist/
sudo systemctl restart nginx
```

---

## 📞 Comandos Útiles

### Verificar Estado del Servidor
```bash
# Conectar
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Ver logs de PM2
pm2 logs datagree

# Ver estado de PM2
pm2 status

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar PM2
pm2 restart datagree
```

### Verificar Archivos
```bash
# Ver version.json
cat /var/www/html/dist/version.json

# Ver tamaño de archivos
du -sh /var/www/html/dist

# Ver permisos
ls -la /var/www/html/dist
```

---

## ⚠️ Notas Importantes

1. **Backup:** Siempre hacer backup antes de desplegar
2. **Horario:** Desplegar en horario de bajo tráfico
3. **Notificación:** Avisar a usuarios sobre la actualización
4. **Monitoreo:** Revisar logs después del despliegue
5. **Rollback:** Tener plan de rollback listo

---

## 🎯 Resumen

Para que veas la versión 52.2.0 en todos los computadores, necesitas:

1. ✅ Subir `frontend/dist/` al servidor AWS
2. ✅ Reemplazar archivos en `/var/www/html/dist/`
3. ✅ Reiniciar Nginx
4. ✅ Limpiar caché en navegadores
5. ✅ Verificar que version.json muestre 52.2.0

**Actualmente:**
- Local: ✅ v52.2.0
- Producción: ❌ v51.0.0 (necesita despliegue)

**Después del despliegue:**
- Local: ✅ v52.2.0
- Producción: ✅ v52.2.0
