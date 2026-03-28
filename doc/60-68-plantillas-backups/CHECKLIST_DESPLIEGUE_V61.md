# ✅ Checklist de Despliegue V61

## 📋 Pre-Despliegue

### Verificación de Código
- [x] Backend compila sin errores
- [x] Frontend compila sin errores
- [x] No hay errores de TypeScript
- [x] Todas las validaciones implementadas
- [x] DTOs actualizados correctamente
- [x] Entidades con relaciones correctas

### Archivos Preparados
- [x] Migración SQL creada: `add-consent-template-services-relation.sql`
- [x] Script de migración de datos: `migrate-existing-templates-to-services.js`
- [x] Script de despliegue: `deploy-consent-templates-services-v61.ps1`
- [x] Documentación completa generada

### Backup
- [ ] Backup de base de datos actual
- [ ] Backup de backend/dist actual
- [ ] Backup de frontend/dist actual

---

## 🚀 Durante el Despliegue

### Fase 1: Base de Datos
- [ ] Conectar a servidor de producción
- [ ] Ejecutar migración SQL
- [ ] Verificar tabla `consent_template_services` creada
- [ ] Verificar índices creados
- [ ] Ejecutar script de migración de datos
- [ ] Verificar asociaciones creadas

### Fase 2: Backend
- [ ] Compilar backend localmente
- [ ] Verificar compilación exitosa
- [ ] Subir archivos a servidor
- [ ] Verificar archivos subidos correctamente

### Fase 3: Frontend
- [ ] Actualizar versión a v61.0.0
- [ ] Compilar frontend localmente
- [ ] Verificar compilación exitosa
- [ ] Subir archivos a servidor
- [ ] Verificar archivos subidos correctamente

### Fase 4: Servicios
- [ ] Reiniciar backend con PM2
- [ ] Verificar backend corriendo
- [ ] Recargar Nginx
- [ ] Verificar Nginx corriendo

---

## ✅ Post-Despliegue

### Verificación de Base de Datos
```sql
-- Ejecutar en servidor
psql $DATABASE_URL

-- Verificar tabla
\d consent_template_services

-- Verificar asociaciones
SELECT COUNT(*) FROM consent_template_services;

-- Ver ejemplo de asociaciones
SELECT 
  ct.name as template,
  s.name as service
FROM consent_template_services cts
JOIN consent_templates ct ON cts."consentTemplateId" = ct.id
JOIN services s ON cts."serviceId" = s.id
LIMIT 5;
```

- [ ] Tabla existe
- [ ] Índices creados
- [ ] Asociaciones creadas
- [ ] Datos coherentes

### Verificación de Backend
```bash
# En servidor
pm2 status
pm2 logs archivoenlinea-backend --lines 50
```

- [ ] Proceso corriendo
- [ ] Sin errores en logs
- [ ] Endpoints respondiendo

### Verificación de API
```bash
# Desde local o Postman
curl https://archivoenlinea.com/api/consent-templates
```

- [ ] Endpoint `/consent-templates` retorna datos
- [ ] Plantillas incluyen campo `services`
- [ ] Servicios tienen datos correctos

### Verificación de Frontend
- [ ] Abrir https://archivoenlinea.com
- [ ] Login exitoso
- [ ] Ir a "Gestión de Plantillas" → "Plantillas de CN"
- [ ] Plantillas cargan correctamente
- [ ] Badges de servicios se muestran
- [ ] Abrir modal de creación
- [ ] Selector de servicios aparece
- [ ] Servicios cargan correctamente

### Pruebas Funcionales

#### Test 1: Ver Plantillas Existentes
- [ ] Abrir lista de plantillas
- [ ] Verificar que muestran servicios asociados
- [ ] Badges se ven correctamente
- [ ] Información completa visible

#### Test 2: Crear Nueva Plantilla
- [ ] Clic en "Nueva Plantilla"
- [ ] Llenar nombre y tipo
- [ ] Selector de servicios aparece
- [ ] Seleccionar 2-3 servicios
- [ ] Contador muestra cantidad correcta
- [ ] Escribir contenido
- [ ] Guardar plantilla
- [ ] Plantilla aparece en lista con servicios

#### Test 3: Editar Plantilla
- [ ] Seleccionar plantilla existente
- [ ] Clic en "Editar"
- [ ] Servicios pre-seleccionados correctamente
- [ ] Cambiar servicios seleccionados
- [ ] Guardar cambios
- [ ] Verificar cambios aplicados

#### Test 4: Validaciones
- [ ] Intentar crear sin servicios
- [ ] Ver mensaje de error
- [ ] Intentar guardar sin nombre
- [ ] Ver mensaje de error
- [ ] Validaciones funcionan correctamente

#### Test 5: Super Admin (si aplica)
- [ ] Login como Super Admin
- [ ] Ver plantillas agrupadas por tenant
- [ ] Expandir/colapsar tenants
- [ ] Ver servicios de cada plantilla
- [ ] Funcionalidad completa

---

## 🐛 Troubleshooting

### Problema: Tabla no se crea
**Verificar**:
- [ ] Conexión a base de datos correcta
- [ ] Permisos de usuario de BD
- [ ] Sintaxis SQL correcta

**Solución**:
```bash
ssh ubuntu@archivoenlinea.com
cd /home/ubuntu/archivoenlinea/backend
psql $DATABASE_URL -f migrations/add-consent-template-services-relation.sql
```

### Problema: Migración de datos falla
**Verificar**:
- [ ] Tabla `consent_template_services` existe
- [ ] Hay plantillas en la BD
- [ ] Hay servicios en la BD

**Solución**:
```bash
ssh ubuntu@archivoenlinea.com
cd /home/ubuntu/archivoenlinea/backend
node migrate-existing-templates-to-services.js
```

### Problema: Backend no reinicia
**Verificar**:
- [ ] PM2 instalado
- [ ] Proceso existe en PM2
- [ ] No hay errores de compilación

**Solución**:
```bash
ssh ubuntu@archivoenlinea.com
pm2 list
pm2 restart archivoenlinea-backend
pm2 logs archivoenlinea-backend
```

### Problema: Servicios no aparecen en modal
**Verificar**:
- [ ] Tenant tiene servicios creados
- [ ] Servicios están activos
- [ ] API responde correctamente

**Solución**:
```bash
# Verificar servicios en BD
psql $DATABASE_URL -c "SELECT * FROM services WHERE \"isActive\" = true;"
```

### Problema: Frontend muestra error
**Verificar**:
- [ ] Archivos subidos correctamente
- [ ] Nginx configurado correctamente
- [ ] Caché limpiada

**Solución**:
```bash
ssh ubuntu@archivoenlinea.com
sudo systemctl reload nginx
# Limpiar caché del navegador: Ctrl+Shift+R
```

---

## 📊 Métricas de Éxito

### Técnicas
- [ ] 0 errores en logs de backend
- [ ] 0 errores en consola de frontend
- [ ] Tiempo de respuesta < 500ms
- [ ] Todas las queries SQL optimizadas

### Funcionales
- [ ] Crear plantilla con servicios: ✅
- [ ] Editar servicios de plantilla: ✅
- [ ] Ver servicios en listado: ✅
- [ ] Validaciones funcionan: ✅
- [ ] Migración de datos exitosa: ✅

### Usuario
- [ ] Interfaz intuitiva
- [ ] Mensajes claros
- [ ] Sin confusión en uso
- [ ] Feedback visual adecuado

---

## 📸 Capturas de Pantalla (Opcional)

### Antes del Despliegue
- [ ] Captura de plantillas sin servicios

### Después del Despliegue
- [ ] Captura de plantillas con servicios
- [ ] Captura de modal de creación
- [ ] Captura de modal de edición
- [ ] Captura de validaciones

---

## 📝 Notas del Despliegue

**Fecha**: _______________  
**Hora inicio**: _______________  
**Hora fin**: _______________  
**Duración**: _______________

**Ejecutado por**: _______________

**Incidencias**:
- [ ] Ninguna
- [ ] Descripción: _______________________________________________

**Rollback necesario**:
- [ ] No
- [ ] Sí - Razón: _______________________________________________

**Observaciones**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## ✅ Aprobación Final

- [ ] Todas las verificaciones pasadas
- [ ] Todas las pruebas exitosas
- [ ] Sin errores críticos
- [ ] Documentación actualizada
- [ ] Usuario informado de cambios

**Aprobado por**: _______________  
**Fecha**: _______________  
**Firma**: _______________

---

## 🎉 Despliegue Completado

**Estado**: ⬜ En progreso | ⬜ Completado | ⬜ Rollback

**Versión desplegada**: v61.0.0  
**URL**: https://archivoenlinea.com  
**Documentación**: SISTEMA_PLANTILLAS_CN_POR_SERVICIO_V61.md

---

**Próximos pasos**:
1. Monitorear logs por 24 horas
2. Recopilar feedback de usuarios
3. Documentar lecciones aprendidas
4. Planificar mejoras futuras
