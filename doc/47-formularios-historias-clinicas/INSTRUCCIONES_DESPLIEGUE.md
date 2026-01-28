# 🚀 Instrucciones de Despliegue - Formularios de Historias Clínicas

**Versión**: 15.0.5  
**Fecha**: 2026-01-24

---

## 📋 Pre-requisitos

Antes de desplegar, asegúrate de tener:

- ✅ Node.js 18+ instalado
- ✅ npm o yarn instalado
- ✅ Base de datos PostgreSQL corriendo
- ✅ Variables de entorno configuradas
- ✅ Acceso al servidor de producción

---

## 🔧 Preparación Local

### 1. Verificar Cambios

```bash
# Ver archivos modificados
git status

# Ver cambios específicos
git diff
```

### 2. Compilar Backend

```bash
cd backend
npm install
npm run build
```

**Resultado Esperado**: ✅ Compilación exitosa sin errores

### 3. Compilar Frontend

```bash
cd frontend
npm install
npm run build
```

**Resultado Esperado**: ✅ Build exitoso en carpeta `dist/`

---

## 🧪 Pruebas Locales

### 1. Iniciar Backend

```bash
cd backend
npm run start:dev
```

**Verificar**: http://localhost:3000/api

### 2. Iniciar Frontend

```bash
cd frontend
npm run dev
```

**Verificar**: http://localhost:5173

### 3. Probar Funcionalidad

Ejecuta los casos de prueba de `GUIA_PRUEBAS.md`:

- [ ] Agregar anamnesis
- [ ] Agregar examen físico
- [ ] Agregar diagnóstico
- [ ] Agregar evolución

---

## 📦 Preparar para Producción

### 1. Actualizar Versión

Ya está actualizado en:
- ✅ `VERSION.md` → 15.0.5
- ✅ `backend/package.json` → 15.0.5
- ✅ `frontend/package.json` → 15.0.5

### 2. Commit de Cambios

```bash
git add .
git commit -m "feat: Implementar formularios completos para historias clínicas v15.0.5

- Backend: Servicios para exámenes físicos, diagnósticos y evoluciones
- Frontend: Modales para agregar información a HC
- Integración completa con endpoints del backend
- Validaciones y auditoría automática
- Documentación completa"
```

### 3. Tag de Versión

```bash
git tag -a v15.0.5 -m "Versión 15.0.5 - Formularios de Historias Clínicas"
git push origin main
git push origin v15.0.5
```

---

## 🌐 Despliegue en Servidor

### Opción 1: Despliegue Manual

#### 1. Conectar al Servidor

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

#### 2. Navegar al Proyecto

```bash
cd /ruta/del/proyecto
```

#### 3. Actualizar Código

```bash
git pull origin main
```

#### 4. Instalar Dependencias Backend

```bash
cd backend
npm install
npm run build
```

#### 5. Instalar Dependencias Frontend

```bash
cd ../frontend
npm install
npm run build
```

#### 6. Reiniciar Servicios

```bash
# Backend (si usas PM2)
pm2 restart backend

# Frontend (si usas PM2)
pm2 restart frontend

# O reiniciar servicios systemd
sudo systemctl restart backend
sudo systemctl restart frontend
```

### Opción 2: Despliegue Automático

Si tienes configurado CI/CD:

```bash
# El push a main debería disparar el despliegue automático
git push origin main
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar Backend

```bash
# Verificar que el servicio esté corriendo
curl http://100.28.198.249:3000/api

# Verificar logs
pm2 logs backend
# o
sudo journalctl -u backend -f
```

### 2. Verificar Frontend

```bash
# Abrir en navegador
http://100.28.198.249

# Verificar logs
pm2 logs frontend
# o
sudo journalctl -u frontend -f
```

### 3. Verificar Funcionalidad

Accede a la aplicación y prueba:

1. **Login**
   - Usuario: operador1@demo-clinica.com
   - Tenant: demo-medico

2. **Historias Clínicas**
   - Abre una historia clínica
   - Verifica que los tabs se muestren
   - Verifica que los botones "Agregar" aparezcan

3. **Agregar Información**
   - Prueba agregar anamnesis
   - Prueba agregar examen físico
   - Prueba agregar diagnóstico
   - Prueba agregar evolución

4. **Verificar Guardado**
   - Verifica que la información se guarde
   - Verifica que aparezca en el listado
   - Verifica que muestre fecha y usuario

---

## 🔍 Troubleshooting

### Problema: Backend no compila

**Solución**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Frontend no compila

**Solución**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Modales no abren

**Verificar**:
1. Consola del navegador (F12)
2. Errores de JavaScript
3. Importaciones de componentes

**Solución**:
```bash
# Limpiar caché del navegador
Ctrl + Shift + Delete

# Recompilar frontend
npm run build
```

### Problema: Endpoints no responden

**Verificar**:
1. Backend está corriendo
2. Puerto 3000 está abierto
3. Base de datos está conectada

**Solución**:
```bash
# Verificar logs del backend
pm2 logs backend

# Reiniciar backend
pm2 restart backend
```

### Problema: Datos no se guardan

**Verificar**:
1. Token JWT válido
2. Permisos del usuario
3. Tenant correcto

**Solución**:
```bash
# Cerrar sesión y volver a iniciar
# Verificar permisos en la base de datos
```

---

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear

1. **Rendimiento**
   - Tiempo de respuesta de endpoints
   - Tiempo de carga de modales
   - Uso de memoria

2. **Errores**
   - Errores 500 en backend
   - Errores de JavaScript en frontend
   - Errores de validación

3. **Uso**
   - Número de historias clínicas creadas
   - Número de anamnesis agregadas
   - Número de exámenes agregados
   - Número de diagnósticos agregados
   - Número de evoluciones agregadas

### Comandos de Monitoreo

```bash
# Ver logs en tiempo real
pm2 logs

# Ver uso de recursos
pm2 monit

# Ver estado de servicios
pm2 status

# Ver logs del sistema
sudo journalctl -f
```

---

## 🔄 Rollback (Si es necesario)

Si algo sale mal, puedes hacer rollback:

### 1. Volver a Versión Anterior

```bash
git checkout v15.0.4
```

### 2. Recompilar

```bash
cd backend
npm install
npm run build

cd ../frontend
npm install
npm run build
```

### 3. Reiniciar Servicios

```bash
pm2 restart all
```

---

## 📝 Checklist de Despliegue

### Pre-Despliegue
- [ ] Código compilado localmente sin errores
- [ ] Pruebas locales exitosas
- [ ] Versión actualizada en todos los archivos
- [ ] Commit y tag creados
- [ ] Backup de base de datos realizado

### Durante Despliegue
- [ ] Código actualizado en servidor
- [ ] Dependencias instaladas
- [ ] Backend compilado
- [ ] Frontend compilado
- [ ] Servicios reiniciados

### Post-Despliegue
- [ ] Backend responde correctamente
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Historias clínicas se muestran
- [ ] Modales abren correctamente
- [ ] Datos se guardan correctamente
- [ ] No hay errores en logs
- [ ] Monitoreo activo

---

## 🎯 Criterios de Éxito

El despliegue es exitoso si:

1. ✅ Backend compila sin errores
2. ✅ Frontend compila sin errores
3. ✅ Servicios están corriendo
4. ✅ Login funciona
5. ✅ Historias clínicas se muestran
6. ✅ Modales abren correctamente
7. ✅ Formularios validan correctamente
8. ✅ Datos se guardan en la base de datos
9. ✅ Auditoría registra las acciones
10. ✅ No hay errores en logs

---

## 📞 Contacto de Emergencia

Si hay problemas críticos durante el despliegue:

1. **Hacer rollback inmediatamente**
2. **Notificar al equipo**
3. **Revisar logs para identificar el problema**
4. **Documentar el incidente**
5. **Planificar nuevo despliegue**

---

## 🎉 Post-Despliegue

Una vez que el despliegue sea exitoso:

1. ✅ Notificar a los usuarios
2. ✅ Actualizar documentación de usuario
3. ✅ Monitorear durante las primeras 24 horas
4. ✅ Recopilar feedback de usuarios
5. ✅ Documentar lecciones aprendidas

---

## 📚 Recursos Adicionales

- **Documentación**: `doc/47-formularios-historias-clinicas/`
- **Guía de Pruebas**: `GUIA_PRUEBAS.md`
- **Resumen Visual**: `RESUMEN_VISUAL.md`
- **Resumen Final**: `RESUMEN_FINAL.md`

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-24  
**Versión**: 15.0.5  
**Estado**: ✅ Listo para Despliegue
