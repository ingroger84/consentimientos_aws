# Problema Backend V58 - Solución

## 🔍 Diagnóstico

### Problema Actual
- Frontend v41.1.6 desplegado correctamente ✅
- Backend v41.1.2 NO tiene los endpoints `/consent-templates/all/grouped` ❌
- Frontend intenta llamar endpoints que no existen → Error 404
- Usuario ve "No hay plantillas registradas" y errores en consola

### Causa Raíz
El backend en el servidor está en versión 41.1.2, que NO incluye:
- Endpoint `GET /consent-templates/all/grouped`
- Endpoint `GET /medical-record-consent-templates/all/grouped`
- Método `getAllGroupedByTenant()` en los servicios

## ✅ Solución

Necesito desplegar el backend v58 que incluye estos endpoints. El problema es que el servidor solo tiene el código compilado (dist), no el código fuente.

### Opción 1: Desplegar Backend Compilado Correctamente

El backend v58 que tengo (`backend-dist-v58-templates-grouped.zip`) necesita ser desplegado en la estructura correcta:

```
/home/ubuntu/consentimientos_aws/backend/
├── dist/
│   ├── main.js
│   ├── app.module.js
│   ├── consent-templates/
│   │   ├── consent-templates.controller.js
│   │   └── consent-templates.service.js
│   └── ...
├── node_modules/
├── package.json
└── .env
```

### Opción 2: Compilar Backend en el Servidor (FALLIDA)

Intenté compilar el backend en el servidor pero:
- No hay directorio `src/` (código fuente)
- Solo existe el código compilado en `dist/`
- No se puede compilar sin código fuente

## 🚀 Plan de Acción

1. **Restaurar backend funcional v41.1.2**
2. **Subir código fuente del backend v58 al servidor**
3. **Compilar backend v58 en el servidor**
4. **Reiniciar PM2**

## 📝 Comandos para Ejecutar

```bash
# 1. Subir código fuente del backend
scp -r backend/src ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# 2. Compilar en el servidor
ssh ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
npm run build

# 3. Reiniciar PM2
pm2 restart datagree
```

## ⚠️ Estado Actual

- Backend: CAÍDO (errored en PM2)
- Frontend: Funcionando pero sin datos
- Usuario: Ve errores 404 al cargar plantillas

## 🔄 Próximos Pasos

1. Restaurar backend funcional v41.1.2 primero
2. Luego desplegar backend v58 correctamente
