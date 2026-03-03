# 📦 Guía de Despliegue Correcto

**Servidor:** admin.archivoenlinea.com (100.28.198.249)  
**Directorio de Despliegue:** `/home/ubuntu/consentimientos_aws/frontend/dist`  
**Usuario:** ubuntu

---

## ⚠️ IMPORTANTE: Directorio Correcto

Nginx está configurado para servir archivos desde:
```
/home/ubuntu/consentimientos_aws/frontend/dist
```

**NO desplegar en `/var/www/html`** - ese directorio no se usa.

---

## 🚀 Método 1: Script Automático (RECOMENDADO)

### Prerrequisitos
1. Frontend compilado
2. Archivo `frontend/dist-vX.X.X.tar.gz` creado

### Ejecutar
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x deploy/deploy-v52.2.0-correcto.sh

# Ejecutar script
./deploy/deploy-v52.2.0-correcto.sh
```

El script hace:
1. ✅ Sube archivos al servidor
2. ✅ Crea backup automático
3. ✅ Despliega en el directorio correcto
4. ✅ Configura permisos
5. ✅ Limpia caché de Nginx
6. ✅ Reinicia Nginx
7. ✅ Verifica el despliegue
8. ✅ Limpia archivos temporales

---

## 🔧 Método 2: Manual Paso a Paso

### 1. Compilar Frontend
```bash
cd frontend
npm run build
```

### 2. Comprimir Archivos
```bash
cd frontend
tar -czf dist-v52.2.0.tar.gz -C dist .
```

### 3. Subir al Servidor
```bash
scp -i credentials/AWS-ISSABEL.pem frontend/dist-v52.2.0.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
```

### 4. Conectar al Servidor
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### 5. Hacer Backup
```bash
sudo cp -r /home/ubuntu/consentimientos_aws/frontend/dist \
           /home/ubuntu/consentimientos_aws/frontend/dist.backup.$(date +%Y%m%d_%H%M%S)
```

### 6. Descomprimir en Temporal
```bash
mkdir -p /home/ubuntu/dist-temp
tar -xzf /home/ubuntu/dist-v52.2.0.tar.gz -C /home/ubuntu/dist-temp
```

### 7. Copiar al Directorio Correcto
```bash
sudo cp -r /home/ubuntu/dist-temp/* /home/ubuntu/consentimientos_aws/frontend/dist/
```

### 8. Configurar Permisos
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/consentimientos_aws/frontend/dist
```

### 9. Limpiar Caché y Reiniciar Nginx
```bash
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

### 10. Verificar
```bash
# Verificar version.json en el servidor
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json

# Verificar URL pública
curl -s https://admin.archivoenlinea.com/version.json
```

### 11. Limpiar Temporales
```bash
rm -rf /home/ubuntu/dist-temp
rm /home/ubuntu/dist-v52.2.0.tar.gz
exit
```

---

## 🔍 Verificación Post-Despliegue

### Desde el Servidor
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "
  echo 'Version en servidor:' &&
  cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json &&
  echo '' &&
  echo 'Version pública:' &&
  curl -s https://admin.archivoenlinea.com/version.json
"
```

### Desde el Navegador
1. Abrir: https://admin.archivoenlinea.com/version.json
2. Verificar que muestre la versión correcta
3. Abrir: https://admin.archivoenlinea.com
4. Verificar footer con la versión correcta

---

## 📋 Checklist de Despliegue

- [ ] Frontend compilado (`npm run build`)
- [ ] Archivos comprimidos (`tar -czf`)
- [ ] Archivos subidos al servidor (`scp`)
- [ ] Backup creado
- [ ] Archivos desplegados en `/home/ubuntu/consentimientos_aws/frontend/dist`
- [ ] Permisos configurados (`ubuntu:ubuntu`)
- [ ] Caché de Nginx limpiado
- [ ] Nginx reiniciado
- [ ] version.json verificado en servidor
- [ ] URL pública verificada
- [ ] Archivos temporales eliminados

---

## 🗂️ Estructura de Directorios en el Servidor

```
/home/ubuntu/
├── consentimientos_aws/
│   ├── backend/
│   │   └── dist/
│   │       └── main.js (PM2 corre desde aquí)
│   └── frontend/
│       ├── dist/                    ← DIRECTORIO DE DESPLIEGUE
│       │   ├── index.html
│       │   ├── version.json
│       │   ├── actualizar.html
│       │   └── assets/
│       ├── dist.backup.YYYYMMDD_HHMMSS/  ← Backups automáticos
│       └── public/
└── dist-temp/                       ← Temporal (se elimina después)
```

---

## ⚙️ Configuración de Nginx

### Archivo Activo
```
/etc/nginx/sites-enabled/archivoenlinea
```

### Directiva Root
```nginx
root /home/ubuntu/consentimientos_aws/frontend/dist;
```

### Verificar Configuración
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "
  grep -E 'root|server_name' /etc/nginx/sites-enabled/archivoenlinea
"
```

---

## 🔄 Rollback (Volver a Versión Anterior)

Si algo sale mal, puedes volver a la versión anterior:

```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "
  # Listar backups disponibles
  ls -la /home/ubuntu/consentimientos_aws/frontend/ | grep backup
  
  # Restaurar backup (reemplazar FECHA con el backup deseado)
  sudo cp -r /home/ubuntu/consentimientos_aws/frontend/dist.backup.FECHA/* \
             /home/ubuntu/consentimientos_aws/frontend/dist/
  
  # Reiniciar Nginx
  sudo rm -rf /var/cache/nginx/*
  sudo systemctl reload nginx
  
  # Verificar
  curl -s https://admin.archivoenlinea.com/version.json
"
```

---

## 🐛 Troubleshooting

### Problema: Los usuarios siguen viendo versión antigua

**Verificar:**
1. ¿Los archivos están en el directorio correcto?
   ```bash
   cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json
   ```

2. ¿Nginx está sirviendo desde el directorio correcto?
   ```bash
   grep "root" /etc/nginx/sites-enabled/archivoenlinea
   ```

3. ¿La URL pública sirve la versión correcta?
   ```bash
   curl -s https://admin.archivoenlinea.com/version.json
   ```

### Problema: Error de permisos

```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/consentimientos_aws/frontend/dist
```

### Problema: Nginx no reinicia

```bash
# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Verificar configuración
sudo nginx -t

# Reiniciar completamente
sudo systemctl restart nginx
```

---

## 📞 Contacto

Si tienes problemas con el despliegue:
1. Verificar este documento
2. Revisar `PROBLEMA_REAL_V52.2.0_RESUELTO.md`
3. Verificar logs de Nginx: `/var/log/nginx/archivoenlinea-error.log`

---

## 📝 Historial de Cambios

### 2026-03-02
- ✅ Identificado directorio correcto de despliegue
- ✅ Creado script automático de despliegue
- ✅ Documentado proceso completo
- ✅ Agregado troubleshooting

### Versiones Anteriores
- ❌ Se desplegaba incorrectamente en `/var/www/html`
- ❌ Nginx no servía esos archivos
- ❌ Usuarios veían versión antigua
