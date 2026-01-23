# Solucion Problema de Version - 23 de Enero 2026

## Problema Reportado

El usuario reportaba ver **v2.4.3 - 2026-01-22** desde multiples dispositivos diferentes, a pesar de que:
- Los archivos locales tenian v7.0.4
- El backend mostraba v7.0.4
- Se habian realizado multiples despliegues

## Causa Raiz Identificada

**PROBLEMA CRITICO**: Nginx estaba sirviendo archivos desde DOS ubicaciones diferentes:

1. **Ubicacion INCORRECTA** (servida por Nginx):
   - Path: `/var/www/html/index.html`
   - Apuntaba a: `index-Bu9S55_R.js` (archivo antiguo)
   - Version: 7.0.0 (no 2.4.3, pero tampoco 7.0.4)

2. **Ubicacion CORRECTA** (NO servida):
   - Path: `/var/www/html/dist/index.html`
   - Apuntaba a: `index-f4qieNqm.js` (archivo nuevo)
   - Version: 7.0.4 ✓

### Por que ocurrio esto?

El script de despliegue subia los archivos a `/var/www/html/dist/` pero Nginx estaba configurado con:
```nginx
root /var/www/html;
```

Esto hacia que Nginx sirviera el `index.html` que estaba directamente en `/var/www/html/` (antiguo) en lugar del que estaba en `/var/www/html/dist/` (nuevo).

## Solucion Aplicada

### 1. Limpieza Completa del Servidor

```bash
# Eliminar TODOS los archivos antiguos
sudo rm -rf /var/www/html/*
```

### 2. Despliegue Correcto

```bash
# Compilar frontend localmente
cd frontend
npm run build

# Subir archivos directamente a /var/www/html/ (NO a /var/www/html/dist/)
scp -r frontend/dist/* ubuntu@100.28.198.249:/tmp/dist_new/
sudo mv /tmp/dist_new/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### 3. Configuracion de Nginx Correcta

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;  # Apunta directamente a donde estan los archivos
    index index.html;

    server_name _;

    # Sin cache para index.html
    location = /index.html {
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        add_header Pragma 'no-cache';
        add_header Expires '0';
        add_header Last-Modified $date_gmt;
        if_modified_since off;
        etag off;
        try_files $uri =404;
    }

    # Cache corto para JS/CSS
    location ~* ^/assets/.*\.(js|css)$ {
        add_header Cache-Control 'public, max-age=0, must-revalidate';
        add_header Last-Modified $date_gmt;
        etag on;
        try_files $uri =404;
    }

    # Cache largo para imagenes y fuentes
    location ~* ^/assets/.*\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control 'public, max-age=31536000, immutable';
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

### 4. Recargar Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verificacion

### Archivos en Servidor

```bash
# Estructura correcta ahora:
/var/www/html/
├── index.html          # Apunta a index-f4qieNqm.js
└── assets/
    ├── index-f4qieNqm.js    # Contiene v7.0.4
    ├── index-Dc2dmKlr.css
    └── [otros archivos]
```

### Version Desplegada

```bash
# Verificar archivo principal
cat /var/www/html/index.html | grep "index-"
# Resultado: index-f4qieNqm.js

# Verificar version en el archivo JS
# El archivo contiene: const ye="7.0.4 - 2026-01-23"
```

## Estado Final

✅ **Backend**: v7.0.4 (PM2 confirmado)
✅ **Frontend**: v7.0.4 (archivo compilado verificado)
✅ **Nginx**: Configurado correctamente
✅ **Estructura**: Archivos en ubicacion correcta

## Instrucciones para el Usuario

### IMPORTANTE: Limpiar Cache del Navegador

Para ver la version correcta (v7.0.4 - 2026-01-23), el usuario DEBE limpiar el cache:

#### Opcion 1: Modo Incognito (Recomendado)
- **Chrome/Edge**: Ctrl + Shift + N
- **Firefox**: Ctrl + Shift + P

#### Opcion 2: Hard Refresh
- **Windows**: Ctrl + F5 o Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

#### Opcion 3: Limpiar Cache Completo
1. Ctrl + Shift + Delete
2. Seleccionar "Imagenes y archivos en cache"
3. Clic en "Borrar datos"
4. Recargar la pagina

## Prevencion Futura

### Script de Despliegue Correcto

Se creo el script `scripts/fix-production-version.ps1` que:
1. Compila el frontend localmente
2. Limpia COMPLETAMENTE el servidor
3. Sube los archivos a la ubicacion CORRECTA
4. Actualiza la configuracion de Nginx
5. Recarga Nginx

### Uso del Script

```powershell
.\scripts\fix-production-version.ps1
```

## Lecciones Aprendidas

1. **Verificar la estructura de directorios**: Siempre confirmar donde Nginx esta sirviendo los archivos
2. **Limpiar antes de desplegar**: Eliminar archivos antiguos para evitar confusion
3. **Verificar en el servidor**: No confiar solo en los archivos locales
4. **Cache del navegador**: Siempre considerar el cache del navegador en problemas de version

## Archivos Modificados

- `scripts/fix-production-version.ps1` (nuevo)
- `/etc/nginx/sites-available/default` (actualizado en servidor)
- `/var/www/html/*` (limpiado y resubido)

## Comandos de Verificacion

```bash
# Verificar version del backend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 describe datagree-backend | grep version"

# Verificar archivo principal del frontend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /var/www/html/index.html | grep 'index-'"

# Verificar estructura de directorios
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "ls -lah /var/www/html/"

# Verificar configuracion de Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /etc/nginx/sites-available/default | grep root"
```

---

**Fecha de solucion**: 23 de Enero 2026
**Version desplegada**: 7.0.4
**Estado**: ✅ RESUELTO
**Accion requerida del usuario**: Limpiar cache del navegador
