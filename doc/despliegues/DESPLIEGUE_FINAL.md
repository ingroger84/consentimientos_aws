# Despliegue Final - DatAgree

## Estado Actual

✅ Instancia AWS Lightsail creada
- **IP:** 18.232.87.116
- **Instancia:** datagree-prod
- **Dominio:** archivoenlinea.com
- **Región:** us-east-1

✅ Credenciales generadas y guardadas en: `credentials_20260127_205953.txt`

## Opción 1: Despliegue Automatizado (Recomendado)

### Paso 1: Descargar clave SSH
1. Ve a: https://lightsail.aws.amazon.com/
2. Descarga la clave SSH de la instancia `datagree-prod`
3. Guárdala como `AWS-ISSABEL.pem` en la raíz del proyecto

### Paso 2: Ejecutar despliegue
```powershell
.\upload-deploy.ps1
```

Este script:
- Comprime el código
- Sube todo al servidor
- Instala dependencias
- Configura base de datos
- Despliega la aplicación

### Paso 3: Configurar SSL
```powershell
ssh -i AWS-ISSABEL.pem ubuntu@18.232.87.116
sudo certbot --nginx -d archivoenlinea.com -d www.archivoenlinea.com
```

## Opción 2: Despliegue Manual

### Paso 1: Subir script
```powershell
scp -i AWS-ISSABEL.pem deploy-server.sh ubuntu@18.232.87.116:/home/ubuntu/
```

### Paso 2: Ejecutar instalación
```powershell
ssh -i AWS-ISSABEL.pem ubuntu@18.232.87.116
chmod +x deploy-server.sh
./deploy-server.sh
```

### Paso 3: Subir código
```powershell
scp -i AWS-ISSABEL.pem -r backend frontend package.json ubuntu@18.232.87.116:/var/www/consentimientos/
```

### Paso 4: Desplegar
```bash
ssh -i AWS-ISSABEL.pem ubuntu@18.232.87.116
/home/ubuntu/deploy-code.sh
```

## Verificación

- **Nginx:** http://18.232.87.116
- **API:** http://18.232.87.116/api/health
- **Logs:** `ssh -i AWS-ISSABEL.pem ubuntu@18.232.87.116 "pm2 logs"`

## Credenciales

Ver archivo: `credentials_20260127_205953.txt`
