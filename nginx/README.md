# Nginx - Configuraciones del Servidor Web

Esta carpeta contiene las configuraciones de Nginx para el servidor de producción.

## Archivos

### nginx-aggressive-no-cache.conf
Configuración con caché deshabilitado completamente
- Útil para debugging
- NO usar en producción (impacto en rendimiento)

### nginx-archivoenlinea-nocache.conf
Configuración específica para archivoenlinea.com sin caché
- Configuración de dominio principal
- Headers de seguridad incluidos

### nginx-cache-control.conf
Configuración con control de caché balanceado
- Caché para assets estáticos (CSS, JS, imágenes)
- Sin caché para HTML y API

### nginx-default.conf
Configuración por defecto del servidor
- Configuración base recomendada
- Balance entre rendimiento y actualización

### nginx-nocache.conf
Configuración sin caché para desarrollo
- Útil para testing
- Asegura que siempre se sirvan archivos actualizados

## Configuración Actual en Producción

El servidor AWS usa una configuración personalizada ubicada en:
```
/etc/nginx/sites-available/archivoenlinea
```

## Aplicar Configuración

```bash
# Copiar configuración al servidor
scp -i AWS-ISSABEL.pem nginx/nginx-default.conf ubuntu@100.28.198.249:/tmp/

# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Mover a ubicación correcta
sudo mv /tmp/nginx-default.conf /etc/nginx/sites-available/archivoenlinea

# Verificar sintaxis
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

## Características Importantes

### Headers de Seguridad
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

### CORS
```nginx
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type, Authorization";
```

### Cache Busting
El sistema usa timestamps en archivos para invalidar caché automáticamente.

### Compresión
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## Troubleshooting

### Problema: Cambios no se reflejan
**Solución:** Verificar que caché esté deshabilitado o usar cache busting

### Problema: CORS errors
**Solución:** Verificar headers CORS en configuración

### Problema: 502 Bad Gateway
**Solución:** Verificar que backend esté corriendo en puerto 3000

## Logs de Nginx

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

## Mejores Prácticas

1. Siempre hacer backup antes de cambiar configuración
2. Verificar sintaxis con `nginx -t` antes de recargar
3. Usar `reload` en lugar de `restart` para evitar downtime
4. Monitorear logs después de cambios
5. Documentar cambios importantes

**Última actualización:** 2026-03-28 (v77.1.0)
