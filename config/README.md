# 🔧 Configuración del Proyecto

Esta carpeta contiene todos los archivos de configuración del proyecto.

## 📂 Estructura

### `/nginx`
Archivos de configuración de Nginx:
- `nginx-aggressive-no-cache.conf` - Configuración sin caché agresiva
- `nginx-archivoenlinea-nocache.conf` - Configuración específica sin caché
- `nginx-cache-control.conf` - Control de caché
- `nginx-default.conf` - Configuración por defecto
- `nginx-nocache.conf` - Sin caché

### `/ecosystem`
Archivos de configuración de PM2:
- `ecosystem.config.js` - Configuración principal
- `ecosystem.config.example.js` - Ejemplo de configuración
- `ecosystem.config.production.js` - Configuración de producción

### Archivos Raíz
- `package.json` - Dependencias del proyecto raíz
- `package-lock.json` - Lock de dependencias

## 📝 Uso

### Nginx
```bash
# Copiar configuración al servidor
sudo cp config/nginx/nginx-default.conf /etc/nginx/sites-available/archivoenlinea
sudo ln -s /etc/nginx/sites-available/archivoenlinea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### PM2
```bash
# Usar configuración de PM2
pm2 start config/ecosystem/ecosystem.config.js
pm2 start config/ecosystem/ecosystem.config.production.js
```

## ⚠️ Importante

- NO commitear archivos con credenciales sensibles
- Usar archivos `.example` como plantillas
- Mantener configuraciones de producción seguras
