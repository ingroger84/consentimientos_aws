# 🚀 Despliegue

Esta carpeta contiene scripts y archivos para el despliegue del proyecto.

## 📂 Estructura

### `/archives`
Archivos comprimidos de versiones anteriores:
- `backend-dist-v26.0.3.tar.gz`
- `backend-dist-v26.0.3.zip`
- `backend-dist.tar.gz`

### Scripts de Despliegue
- `deploy-fix.ps1` - Script de corrección de despliegue
- `deploy-server.sh` - Despliegue en servidor
- `deploy-to-existing-server.ps1` - Despliegue a servidor existente
- `deploy-update.ps1` - Actualización de despliegue
- `upload-deploy.ps1` - Subir archivos de despliegue
- `install.sh` - Script de instalación

## 📝 Uso

### Despliegue Completo
```bash
# Windows
.\deploy\deploy-to-existing-server.ps1

# Linux/Mac
bash deploy/deploy-server.sh
```

### Actualización
```bash
# Windows
.\deploy\deploy-update.ps1

# Linux/Mac
bash deploy/install.sh
```

### Subir Archivos
```bash
.\deploy\upload-deploy.ps1
```

## 🔄 Proceso de Despliegue

1. **Preparación:**
   - Compilar backend: `cd backend && npm run build`
   - Compilar frontend: `cd frontend && npm run build`

2. **Despliegue:**
   - Ejecutar script de despliegue apropiado
   - Verificar logs
   - Reiniciar servicios

3. **Verificación:**
   - Verificar versión desplegada
   - Probar funcionalidades críticas
   - Monitorear logs

## ⚠️ Importante

- Hacer backup antes de desplegar
- Probar en staging primero
- Verificar credenciales SSH
- Mantener archivos .pem seguros
- Documentar cada despliegue

## 📞 Soporte

Ver documentación completa en `/doc/despliegues/`
