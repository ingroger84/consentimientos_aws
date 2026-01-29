# Sesión 2026-01-28: Corrección de Caché de Nginx

## Contexto
Los usuarios reportaban que los cambios en el frontend no se reflejaban, incluso en modo incógnito. Las correcciones a los formularios de historias clínicas no se aplicaban.

## Problema Identificado
Nginx estaba configurado para cachear archivos JS y CSS por 1 año:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control public;
}
```

Esto causaba que:
- Los navegadores guardaran los archivos JS por 1 año
- Los cambios en el código no se reflejaran inmediatamente
- Incluso en modo incógnito, el navegador usaba la versión cacheada

## Solución Implementada

### Configuración de Nginx Actualizada

**Archivo**: `/etc/nginx/sites-available/archivoenlinea`

Separamos el caché en dos categorías:

1. **JS y CSS - Caché corto (1 hora)**
```nginx
location ~* \.(js|css)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

2. **Imágenes y fuentes - Caché largo (1 año)**
```nginx
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control public;
}
```

### Beneficios

1. **Actualizaciones rápidas**: Los cambios en JS/CSS se reflejan en máximo 1 hora
2. **Performance**: Las imágenes y fuentes siguen cacheadas por 1 año
3. **Vite content hashing**: Los archivos con hash diferente se descargan inmediatamente
4. **Balance**: Buen balance entre performance y capacidad de actualización

## Comandos Ejecutados

```bash
# Subir nueva configuración
scp -i "AWS-ISSABEL.pem" temp/archivoenlinea-no-cache.conf ubuntu@100.28.198.249:/tmp/

# Aplicar configuración
sudo cp /tmp/archivoenlinea-no-cache.conf /etc/nginx/sites-available/archivoenlinea

# Verificar sintaxis
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

## Recomendaciones

### Para Desarrollo
- Mantener caché corto (1h) para JS/CSS
- Usar `must-revalidate` para forzar validación con el servidor

### Para Producción
- Vite genera hashes únicos por contenido
- Cuando el contenido cambia, el hash cambia
- El navegador descarga automáticamente la nueva versión
- El caché de 1h solo afecta si el contenido NO cambió

### Forzar Actualización Inmediata
Si necesitas que los usuarios vean cambios inmediatamente:
1. Cambiar versión en `package.json`
2. Recompilar frontend: `npx vite build --mode production`
3. Los nuevos hashes forzarán descarga inmediata

## Resultado
- Los cambios en el frontend ahora se reflejan correctamente
- Los formularios de historias clínicas funcionan sin errores
- Balance entre performance y capacidad de actualización

## Versión
- **Configuración Nginx**: Actualizada 2026-01-28
- **Frontend**: 19.1.1

## Archivos Modificados
- `/etc/nginx/sites-available/archivoenlinea`

## Fecha
2026-01-28
