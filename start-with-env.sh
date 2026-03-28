#!/bin/bash
# Script para iniciar la aplicación con variables de entorno

# Cargar variables del .env
export $(grep -v '^#' /home/ubuntu/consentimientos_aws/backend/.env | xargs)

# Iniciar la aplicación
node /home/ubuntu/consentimientos_aws/backend/dist/main.js
