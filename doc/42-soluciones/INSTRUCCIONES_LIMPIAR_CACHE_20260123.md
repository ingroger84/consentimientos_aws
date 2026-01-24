# Instrucciones para Ver la Versión Correcta

## ✅ SERVIDOR ACTUALIZADO CORRECTAMENTE

El servidor tiene la versión **7.0.4 - 2026-01-23** correctamente desplegada.

## 🔧 SOLUCIONES APLICADAS

### 1. Timestamp Único Agregado
Se agregó un timestamp único (`?v=1769177676`) a todos los archivos JS y CSS para forzar la descarga de nuevas versiones.

### 2. Página de Limpieza de Caché Creada
Se creó una página especial que limpia automáticamente el caché.

## 📋 INSTRUCCIONES PASO A PASO

### OPCIÓN 1: Usar la Página de Limpieza Automática (MÁS FÁCIL)

1. **Ve a esta URL**:
   ```
   https://archivoenlinea.com/force-reload.html
   ```

2. **Espera 3 segundos** mientras la página:
   - Limpia localStorage
   - Limpia sessionStorage
   - Limpia cookies
   - Te redirige automáticamente

3. **Verifica** que veas: **v7.0.4 - 2026-01-23**

### OPCIÓN 2: Modo Incógnito (RÁPIDO)

1. **Abre una ventana de incógnito**:
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`

2. **Ve a**: `https://archivoenlinea.com`

3. **Deberías ver**: **v7.0.4 - 2026-01-23**

### OPCIÓN 3: Limpiar Caché Manualmente (DEFINITIVO)

#### Chrome/Edge:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona **"Desde siempre"**
3. Marca TODAS estas opciones:
   - ✅ Historial de navegación
   - ✅ Cookies y otros datos de sitios
   - ✅ Imágenes y archivos en caché
4. Clic en **"Borrar datos"**
5. **CIERRA COMPLETAMENTE EL NAVEGADOR** (todas las ventanas)
6. Abre el navegador nuevamente
7. Ve a: `https://archivoenlinea.com`
8. Presiona `Ctrl + F5` varias veces

#### Firefox:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona **"Todo"**
3. Marca:
   - ✅ Historial de navegación y descargas
   - ✅ Cookies
   - ✅ Caché
4. Clic en **"Limpiar ahora"**
5. **CIERRA COMPLETAMENTE EL NAVEGADOR**
6. Abre el navegador nuevamente
7. Ve a: `https://archivoenlinea.com`
8. Presiona `Ctrl + F5` varias veces

### OPCIÓN 4: Limpiar Caché de DNS (Si nada funciona)

```cmd
# Windows (ejecutar como Administrador)
ipconfig /flushdns
ipconfig /registerdns
```

Luego reinicia tu computadora.

## 📱 PARA DISPOSITIVOS MÓVILES

### Android (Chrome):
1. Chrome → ⋮ (menú) → Configuración
2. Privacidad y seguridad → Borrar datos de navegación
3. Selecciona "Desde siempre"
4. Marca "Imágenes y archivos en caché"
5. Borrar datos
6. Cierra Chrome completamente
7. Abre Chrome y ve a archivoenlinea.com

### iOS (Safari):
1. Ajustes → Safari
2. Borrar historial y datos de sitios web
3. Confirmar
4. Abre Safari y ve a archivoenlinea.com

## ✅ VERIFICACIÓN

Después de aplicar cualquiera de las soluciones, deberías ver:

```
Versión 7.0.4 - 2026-01-23
```

En la parte inferior de la página (footer).

## 🎯 FUNCIONALIDADES NUEVAS EN v7.0.4

1. ✅ **Período de prueba de 7 días** para plan gratuito
2. ✅ **Visualización de sede** para usuarios operadores
3. ✅ **Sistema de versionamiento automático**

## ❓ SI AÚN VES v2.4.3

Si después de probar TODAS las opciones anteriores aún ves v2.4.3:

1. **Prueba en otro navegador** (Chrome, Firefox, Edge)
2. **Prueba en otro dispositivo** (móvil, tablet)
3. **Verifica que estés en**: `https://archivoenlinea.com` (no otra URL)

## 🔍 VERIFICACIÓN TÉCNICA

Para confirmar que el servidor está correcto:

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar backend
pm2 describe datagree-backend | grep version
# Debe mostrar: 7.0.4

# Verificar frontend
cat /var/www/html/index.html | grep "index-"
# Debe mostrar: index-f4qieNqm.js?v=1769177676
```

## 📞 SOPORTE

Si después de seguir TODAS estas instrucciones aún tienes problemas:

1. Toma una captura de pantalla de lo que ves
2. Indica qué navegador y versión usas
3. Indica si probaste en modo incógnito
4. Indica si probaste la página force-reload.html

---

**Fecha**: 23 de Enero 2026
**Versión Correcta**: 7.0.4 - 2026-01-23
**Estado del Servidor**: ✅ Correcto y Actualizado
