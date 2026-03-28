# 🔐 Herramienta Web de Prueba de Conexión Bold

**Fecha**: 22 de Marzo 2026  
**Versión**: 1.0  
**Servidor**: AWS Lightsail (100.28.198.249)

---

## 📋 Descripción

Herramienta web interactiva para probar la conexión con Bold Payment Gateway directamente desde el navegador. Permite verificar credenciales y diagnosticar problemas de autenticación sin necesidad de acceder al servidor por SSH.

---

## 🚀 Despliegue en Producción

### Opción 1: Script Automático (Recomendado)

```powershell
.\scripts\deploy-bold-test-tool.ps1
```

Este script:
1. Copia el archivo HTML al servidor AWS
2. Lo mueve al directorio web público de Nginx
3. Configura los permisos correctos

### Opción 2: Despliegue Manual

```bash
# 1. Copiar archivo al servidor
scp -i "AWS-ISSABEL.pem" test-bold-connection.html ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/

# 2. Conectarse al servidor
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249

# 3. Mover a directorio web público
sudo cp /home/ubuntu/consentimientos_aws/test-bold-connection.html /var/www/html/
sudo chmod 644 /var/www/html/test-bold-connection.html

# 4. Salir del servidor
exit
```

---

## 🌐 Acceso a la Herramienta

Una vez desplegada, accede desde tu navegador:

**URL Principal:**
```
https://archivoenlinea.com/test-bold-connection.html
```

**URL Alternativa (IP directa):**
```
http://100.28.198.249/test-bold-connection.html
```

---

## 💡 Cómo Usar la Herramienta

### Paso 1: Acceder a la URL
Abre la herramienta en tu navegador usando una de las URLs anteriores.

### Paso 2: Verificar Credenciales
Las credenciales de Bold ya están pre-cargadas:
- **API Key**: `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68`
- **Secret Key**: `KVwpsp4WlWny3apOYoGWvg`
- **Merchant ID**: `2M0MTRAD37`
- **API URL**: `https://api.online.payments.bold.co`

Puedes modificarlas si necesitas probar otras credenciales.

### Paso 3: Ejecutar Prueba
Haz clic en el botón **"🚀 Probar Conexión"**

### Paso 4: Revisar Resultados
La herramienta mostrará:
- ✅ Logs detallados del proceso
- 📊 Respuesta completa de Bold en formato JSON
- 🔍 Diagnóstico automático de errores
- 💡 Sugerencias de solución

---

## 📊 Interpretación de Resultados

### ✅ Conexión Exitosa
```
Estado: ✅ Conexión Exitosa
✅ ¡Conexión exitosa con Bold!
✅ Reference ID: TEST-1234567890
✅ Estado: ACTIVE
✅ Las credenciales son válidas y funcionan correctamente
```

**Significa:**
- Las credenciales son válidas
- Bold está respondiendo correctamente
- El formato de autenticación es correcto
- Puedes proceder a usar Bold en producción

### ❌ Error 403: Prohibido
```
Estado: ❌ Error de Conexión
❌ Error HTTP 403: Forbidden
❌ Mensaje: Invalid key=value pair (missing equal-sign)...
```

**Posibles causas:**
1. API Key incorrecta o inválida
2. API Key sin permisos necesarios
3. Formato de autenticación incorrecto
4. Credenciales desactivadas por Bold

**Soluciones:**
1. Contactar a Bold para verificar credenciales
2. Solicitar nuevas credenciales
3. Verificar formato de autenticación en documentación

### ❌ Error 401: No Autorizado
```
Estado: ❌ Error de Conexión
❌ Error HTTP 401: Unauthorized
```

**Causa:** API Key inválida o expirada

**Solución:** Solicitar nuevas credenciales a Bold

### ❌ Error 400: Petición Incorrecta
```
Estado: ❌ Error de Conexión
❌ Error HTTP 400: Bad Request
```

**Causa:** Formato del payload incorrecto

**Solución:** Verificar estructura de datos en documentación de Bold

---

## 🔧 Ventajas sobre el Script Node.js

| Característica | Herramienta Web | Script Node.js |
|----------------|-----------------|----------------|
| Requiere SSH | ❌ No | ✅ Sí |
| Interfaz visual | ✅ Sí | ❌ No |
| Fácil de compartir | ✅ Sí | ❌ No |
| Logs en tiempo real | ✅ Sí | ✅ Sí |
| Cambio de credenciales | ✅ Fácil | ❌ Requiere editar archivo |
| Acceso desde cualquier lugar | ✅ Sí | ❌ Solo desde servidor |

---

## 🔒 Seguridad

### Consideraciones Importantes

⚠️ **Las credenciales están visibles en el código HTML**
- Solo para uso en ambiente de desarrollo/pruebas
- No exponer en producción sin autenticación
- Considerar agregar autenticación básica si es necesario

### Protección Adicional (Opcional)

Si deseas proteger la herramienta con autenticación básica:

```bash
# En el servidor
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/default

# Agregar dentro del bloque location:
location /test-bold-connection.html {
    auth_basic "Área Restringida";
    auth_basic_user_file /etc/nginx/.htpasswd;
}

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Problema: La página no carga
**Solución:**
```bash
# Verificar que el archivo existe
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "ls -la /var/www/html/test-bold-connection.html"

# Verificar permisos
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "sudo chmod 644 /var/www/html/test-bold-connection.html"

# Verificar Nginx
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "sudo systemctl status nginx"
```

### Problema: Error de CORS
**Causa:** Nginx no está configurado para permitir CORS

**Solución:**
```bash
# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/default

# Agregar headers CORS
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: Credenciales no funcionan
**Solución:** Usar el script Node.js para comparar resultados
```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node test-bold-standalone.js
```

---

## 📝 Actualización de la Herramienta

Si necesitas actualizar la herramienta:

```powershell
# 1. Editar el archivo local
# test-bold-connection.html

# 2. Redesplegar
.\scripts\deploy-bold-test-tool.ps1
```

---

## 📞 Soporte

Si la herramienta no funciona correctamente:

1. Verificar que Nginx esté corriendo
2. Verificar permisos del archivo
3. Revisar logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
4. Usar el script Node.js como alternativa
5. Contactar a Bold para verificar credenciales

---

## 🔗 Enlaces Útiles

- **Documentación Bold**: https://developers.bold.co
- **Portal Bold**: https://bold.co
- **Servidor AWS**: http://100.28.198.249
- **Dominio Principal**: https://archivoenlinea.com

---

**Última actualización**: 22 de Marzo 2026  
**Mantenedor**: Equipo de Desarrollo Archivo en Línea
