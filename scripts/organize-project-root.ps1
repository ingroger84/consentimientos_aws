# Script para organizar la raiz del proyecto
# Version: 1.0.0
# Fecha: 2026-03-28

Write-Host "=== Organizando Proyecto ===" -ForegroundColor Cyan
Write-Host ""

# Crear estructura de carpetas
Write-Host "Creando estructura de carpetas..." -ForegroundColor Yellow

$folders = @(
    "archive/builds",
    "archive/old-docs",
    "archive/old-scripts",
    "archive/logs",
    "archive/temp-files",
    "database/migrations",
    "database/seeds",
    "database/queries",
    "database/scripts",
    "tests/api",
    "tests/integration",
    "tests/diagnostics",
    "nginx"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  [OK] Creado: $folder" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Moviendo archivos..." -ForegroundColor Yellow

# 1. BUILDS Y DISTRIBUCIONES
Write-Host "  >> Moviendo builds antiguos..." -ForegroundColor Gray
$builds = @(
    "backend-dist-fix.zip",
    "backend-dist-profiles-fix.zip",
    "backend-dist-v42.2.1.tar.gz",
    "backend-dist-v58-final-compiled.zip",
    "backend-dist-v58-templates-grouped.zip",
    "backend-dist-v59-content-fix.zip",
    "backend-dist-v59-final.zip",
    "backend-dist-v69-debug-logs.zip",
    "backend-dist-v70-check-answers.zip",
    "backend-dist-v71-check-consent-answers.zip",
    "backend-dist.zip",
    "frontend-dist-v58-final-correct.zip",
    "frontend-dist-v58-final.zip",
    "frontend-dist-v58-templates-grouped.zip"
)
foreach ($file in $builds) {
    if (Test-Path $file) {
        Move-Item $file "archive/builds/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 2. DOCUMENTOS MARKDOWN ANTIGUOS
Write-Host "  >> Moviendo documentacion antigua..." -ForegroundColor Gray
$oldDocs = @(
    "ANALISIS_INTEGRACION_DYNAMIAERP_FACTURACION.md",
    "BACKEND_RESTAURADO_V59_FINAL.md",
    "COMPARACION_IMPLEMENTACION_VS_NECESIDAD.md",
    "CONFIGURACION_ZONA_HORARIA_COLOMBIA.md",
    "CONSENTIMIENTO_INFORMADO_SERVICIOS_GLAMPING_LA_POLKA.md",
    "CORRECCION_ADMISSIONTYPE_HC.md",
    "CORRECCION_AISLAMIENTO_TENANTS_COMPLETADA.md",
    "CORRECCION_BUCLE_RECARGA_V52.2.0.md",
    "CORRECCION_CONSTRAINT_RECORD_NUMBER_FINAL.md",
    "CORRECCION_CONSTRAINT_RECORD_NUMBER.md",
    "CORRECCION_CORS_V53.0.0.md",
    "CORRECCION_EMAIL_SOPORTE_SOLO_SUPER_ADMIN.md",
    "CORRECCION_ERROR_403_PERFILES.md",
    "CORRECCION_ERROR_CORS_CREAR_PERFIL.md",
    "CORRECCION_ERROR_HC_TIPO_ADMISION.md",
    "CORRECCION_ESTADISTICAS_PLANTILLAS_CN.md",
    "CORRECCION_FORMATO_PERMISOS_V53.0.0.md",
    "CORRECCION_GUARDADO_PERFILES_USUARIOS.md",
    "CORRECCION_PERMISOS_SUPER_ADMIN_V53.0.0.md",
    "CORRECCION_SUPER_ADMIN_EDITAR_PERFILES_SISTEMA.md",
    "CORRECCION_SUPER_ADMIN_ELIMINAR_HC_V42.2.0.md",
    "CORRECCION_SUPER_ADMIN_ELIMINAR_HC.md",
    "CORRECCION_SUPER_ADMIN_VER_TODO.md",
    "CORRECCION_URLS_TENANTS_DESARROLLO.md",
    "DESPLIEGUE_BACKEND_V58_COMPLETADO.md",
    "DESPLIEGUE_BACKEND_V59_FINAL_COMPLETADO.md",
    "DESPLIEGUE_COMPLETADO_V58_LIGHTSAIL.md",
    "DESPLIEGUE_EMAIL_SOPORTE_SUPER_ADMIN.md",
    "DESPLIEGUE_ESTADISTICAS_CN_COMPLETADO.md",
    "DESPLIEGUE_EXITOSO_V58_ARCHIVOENLINEA.md",
    "DESPLIEGUE_FRONTEND_V41.1.6_FINAL.md",
    "DESPLIEGUE_V41_PRODUCCION_COMPLETADO.md",
    "DESPLIEGUE_V72_FIX_TEXT_OVERLAP_COMPLETADO.md",
    "DIAGNOSTICO_FINAL_V58.md",
    "DIAGNOSTICO_LANDING_PAGE.md",
    "DIAGRAMA_FLUJO_PLANTILLAS_SERVICIOS.md",
    "EJECUTAR_AHORA_V58.md",
    "ELIMINACION_PLANTILLAS_HC_SIN_TENANT_COMPLETADA.md",
    "ESTRATEGIA_MULTI_MERCADO_RESUMEN.md",
    "ESTRUCTURA_PROYECTO.md",
    "GENERAR_CONSENTIMIENTO_AHORA_V71.md",
    "GUIA_VISUAL_VERIFICACION_PLANTILLAS.md",
    "IMPLEMENTACION_PLANTILLAS_SERVICIOS_COMPLETADA.md",
    "INSTRUCCIONES_ACTUALIZACION_V52.2.0.md",
    "INSTRUCCIONES_BACKUPS_AUTOMATICOS.md",
    "INSTRUCCIONES_CLONAR_PRODUCCION_MANUAL.md",
    "INSTRUCCIONES_DEBUG_PERFILES.md",
    "INSTRUCCIONES_DEBUG_PUBLIC_SUSPENDED.md",
    "INSTRUCCIONES_DEBUG_SUPER_ADMIN.md",
    "INSTRUCCIONES_DEBUG_TENANT_ID.md",
    "INSTRUCCIONES_DESPLIEGUE_FIX_BOTON.md",
    "INSTRUCCIONES_DESPLIEGUE_MANUAL_V58.md",
    "INSTRUCCIONES_DESPLIEGUE_PLANTILLAS_V58.md",
    "INSTRUCCIONES_DESPLIEGUE_V41_PRODUCCION.md",
    "INSTRUCCIONES_DIAGNOSTICO_SERVIDOR.md",
    "INSTRUCCIONES_DIAGNOSTICO_SUPER_ADMIN.md",
    "INSTRUCCIONES_ELIMINAR_CACHE_PERFILES.md",
    "INSTRUCCIONES_FINALES_SUPER_ADMIN.md",
    "INSTRUCCIONES_GENERAR_CONSENTIMIENTO_V70.md",
    "INSTRUCCIONES_PRUEBA_CREAR_PERFIL.md",
    "INSTRUCCIONES_PRUEBA_V69_DEBUG.md",
    "INSTRUCCIONES_RAPIDAS.md",
    "INSTRUCCIONES_SISTEMA_RESTAURADO.md",
    "INSTRUCCIONES_URGENTES_SUPER_ADMIN.md",
    "INSTRUCCIONES_USUARIO_CREAR_HC.md",
    "INSTRUCCIONES_USUARIO_PLANTILLAS_SERVICIOS.md",
    "INSTRUCCIONES_USUARIO_SUPER_ADMIN_PLANTILLAS.md",
    "INSTRUCCIONES_USUARIO_SUPER_ADMIN.md",
    "LEEME_OPTIMIZACIONES.md",
    "LEEME_PRIMERO.md",
    "LIMPIEZA_PLANTILLAS_SIN_TENANT_COMPLETADA.md",
    "LIMPIEZA_PLANTILLAS_Y_CONTENIDO_V59_COMPLETADA.md",
    "LISTO_PARA_USAR.md",
    "MENU_SISTEMA_DESPLEGABLE_COMPLETADO.md",
    "MODULO_GESTION_BACKUPS_WEB.md",
    "PLANTILLAS_AGRUPADAS_COMPLETADO_V58.md",
    "PLANTILLAS_AGRUPADAS_POR_TENANT_V58.md",
    "PROBLEMA_BACKEND_PRODUCCION_V41.md",
    "PROBLEMA_BACKEND_V58_SOLUCION.md",
    "PROBLEMA_PLANTILLAS_NO_SE_USAN.md",
    "RESTAURACION_V41_COMPLETADA.md",
    "RESULTADO_TEST_DYNAMIAERP_CONEXION.md",
    "RESUMEN_ACTUALIZACION_V52.2.0.md",
    "RESUMEN_CONSOLIDACION_PERFILES_V53.md",
    "RESUMEN_CORRECCION_CONSTRAINT_V41.1.5.md",
    "RESUMEN_DESPLIEGUE_V58_FINAL.md",
    "RESUMEN_EJECUTIVO_RESTAURACION_V41.md",
    "RESUMEN_FINAL_CONSOLIDACION_V53.0.0.md",
    "RESUMEN_FINAL_CORRECCION_PRECIOS.md",
    "RESUMEN_FINAL_DESPLIEGUE_V58.md",
    "RESUMEN_FINAL_PROBLEMA.md",
    "RESUMEN_FINAL_SESION_V52.2.0.md",
    "RESUMEN_FINAL_SUPER_ADMIN_PLANTILLAS.md",
    "RESUMEN_FINAL_TEST_DYNAMIAERP.md",
    "RESUMEN_HERRAMIENTAS_DIAGNOSTICO.md",
    "RESUMEN_IMPLEMENTACION_FASES_1_Y_2.md",
    "RESUMEN_OPTIMIZACION_V48.md",
    "RESUMEN_POBLACION_SUPABASE.md",
    "RESUMEN_PROBLEMA_ACTUAL.md",
    "RESUMEN_SESION_2026-03-04_SUPER_ADMIN_PERFILES.md",
    "RESUMEN_SISTEMA_BACKUPS.md",
    "RESUMEN_SITUACION_Y_OPCIONES.md",
    "RESUMEN_SOLUCION_CACHE_V58.md",
    "RESUMEN_SOLUCION_TENANT_ID.md",
    "RESUMEN_VERIFICACION_PRECIOS.md",
    "RUTAS_OFICIALES_PROYECTO.md",
    "SISTEMA_BACKUPS_AUTOMATICOS.md",
    "SOLUCION_ALTERNATIVA_CLONAR_PRODUCCION.md",
    "SOLUCION_CACHE_PLANTILLAS_V58.md",
    "SOLUCION_CACHE_V52.2.0.md",
    "SOLUCION_COMPLETA_CONSTRAINTS_MULTI_TENANT.md",
    "SOLUCION_DEFINITIVA_CONSTRAINT_RECORD_NUMBER.md",
    "SOLUCION_DEFINITIVA_CORS_V41.1.6.md",
    "SOLUCION_DEFINITIVA_SUPER_ADMIN.md",
    "SOLUCION_FINAL_BOTON_EDITAR_PERFIL.md",
    "SOLUCION_FINAL_NODE_ENV_V41.1.6.md",
    "SOLUCION_FINAL_PLANTILLAS_V58.md",
    "SOLUCION_FINAL_SUPER_ADMIN_FALLBACK.md",
    "SOLUCION_FINAL_V58.1.0_COMPLETADA.md",
    "SOLUCION_MENU_PERFILES_NO_APARECE.md",
    "SOLUCION_MODULE_ACCESS_PERFILES.md",
    "SOLUCION_PANTALLA_BLANCA_PERFILES.md",
    "SOLUCION_PERMISOS_CERRAR_ADMISION.md",
    "SOLUCION_TENANT_ID_NULL_COMPLETADA.md",
    "SUPER_ADMIN_GESTION_PLANTILLAS_COMPLETADO.md"
)
foreach ($file in $oldDocs) {
    if (Test-Path $file) {
        Move-Item $file "archive/old-docs/" -Force
    }
}
Write-Host "    [OK] Documentos antiguos movidos" -ForegroundColor Green

# 3. ARCHIVOS HTML DE TEST
Write-Host "  >> Moviendo archivos HTML de test..." -ForegroundColor Gray
$htmlTests = @(
    "SOLUCION_CACHE_LOGIN_SUSPENDED.html",
    "SOLUCION_RAPIDA_SUPER_ADMIN.html"
)
foreach ($file in $htmlTests) {
    if (Test-Path $file) {
        Move-Item $file "tests/integration/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 4. LOGS
Write-Host "  >> Moviendo logs..." -ForegroundColor Gray
$logs = @(
    "logs-complete.txt",
    "logs-full-v69.txt",
    "logs-v69.txt",
    "logs-v70-nuevo.txt",
    "logs-v71-final.txt",
    "logs-v71-restart.txt"
)
foreach ($file in $logs) {
    if (Test-Path $file) {
        Move-Item $file "archive/logs/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 5. ARCHIVOS SQL
Write-Host "  >> Organizando archivos SQL..." -ForegroundColor Gray

# Seeds
$seeds = @(
    "seed-production-data.sql",
    "seed-simple.sql",
    "load-consent-templates.sql"
)
foreach ($file in $seeds) {
    if (Test-Path $file) {
        Move-Item $file "database/seeds/" -Force
        Write-Host "    [OK] $file -> seeds/" -ForegroundColor Green
    }
}

# Migrations
$migrations = @(
    "create-medical-records-clean.sql",
    "copy-mr-templates-to-tenants.sql"
)
foreach ($file in $migrations) {
    if (Test-Path $file) {
        Move-Item $file "database/migrations/" -Force
        Write-Host "    [OK] $file -> migrations/" -ForegroundColor Green
    }
}

# Queries de diagnostico
$queries = @(
    "check-admin-permissions.sql",
    "check-and-load-templates.sql",
    "check-permissions.sql",
    "check-tenant-data.sql",
    "check-user-role.sql",
    "temp-apply-permissions.sql",
    "update-permissions.sql"
)
foreach ($file in $queries) {
    if (Test-Path $file) {
        Move-Item $file "database/queries/" -Force
        Write-Host "    [OK] $file -> queries/" -ForegroundColor Green
    }
}

# 6. SCRIPTS DE DIAGNOSTICO
Write-Host "  >> Moviendo scripts de diagnostico..." -ForegroundColor Gray
$diagnostics = @(
    "check-tenant-columns.js",
    "test-permissions-transform.js",
    "update-permissions.js"
)
foreach ($file in $diagnostics) {
    if (Test-Path $file) {
        Move-Item $file "tests/diagnostics/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 7. SCRIPTS DE TEST
Write-Host "  >> Moviendo scripts de test..." -ForegroundColor Gray
$testScripts = @(
    "test-admin-login.json",
    "test-login-suspended.sh",
    "test-login.json",
    "test-public-endpoint.sh",
    "test-user-permissions.json"
)
foreach ($file in $testScripts) {
    if (Test-Path $file) {
        Move-Item $file "tests/api/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 8. ARCHIVOS NGINX
Write-Host "  >> Moviendo configuraciones nginx..." -ForegroundColor Gray
$nginxFiles = @(
    "nginx-aggressive-no-cache.conf",
    "nginx-archivoenlinea-nocache.conf",
    "nginx-cache-control.conf",
    "nginx-default.conf",
    "nginx-nocache.conf"
)
foreach ($file in $nginxFiles) {
    if (Test-Path $file) {
        Move-Item $file "nginx/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 9. SCRIPTS DE DEPLOY ANTIGUOS
Write-Host "  >> Moviendo scripts de deploy antiguos..." -ForegroundColor Gray
$oldScripts = @(
    "deploy-fix.ps1",
    "deploy-to-existing-server.ps1",
    "deploy-update.ps1",
    "upload-deploy.ps1",
    "start-with-env.sh"
)
foreach ($file in $oldScripts) {
    if (Test-Path $file) {
        Move-Item $file "archive/old-scripts/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 10. ARCHIVOS TEMPORALES
Write-Host "  >> Moviendo archivos temporales..." -ForegroundColor Gray
$tempFiles = @(
    "COMANDOS_RAPIDOS_V58.txt",
    "LEER_AHORA_VERSION_COMPLETA.txt",
    "LEER_PRIMERO_V38.1.10.txt",
    "v3api-docs.txt",
    "current-pdf-service.ts",
    "Estrategia_Versionamiento_SaaS.docx"
)
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive/temp-files/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

# 11. DOCUMENTACION ANTIGUA (RESTO)
Write-Host "  >> Moviendo resto de documentacion..." -ForegroundColor Gray
$moreDocs = @(
    "CREDENCIALES.md"
)
foreach ($file in $moreDocs) {
    if (Test-Path $file) {
        Move-Item $file "archive/old-docs/" -Force
        Write-Host "    [OK] $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Organizacion Completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Estructura final:" -ForegroundColor Cyan
Write-Host "  [FOLDER] archive/builds/        - Builds antiguos (.zip, .tar.gz)" -ForegroundColor White
Write-Host "  [FOLDER] archive/old-docs/      - Documentacion historica" -ForegroundColor White
Write-Host "  [FOLDER] archive/old-scripts/   - Scripts de deploy antiguos" -ForegroundColor White
Write-Host "  [FOLDER] archive/logs/          - Logs historicos" -ForegroundColor White
Write-Host "  [FOLDER] archive/temp-files/    - Archivos temporales" -ForegroundColor White
Write-Host "  [FOLDER] database/migrations/   - Migraciones SQL" -ForegroundColor White
Write-Host "  [FOLDER] database/seeds/        - Seeds de datos" -ForegroundColor White
Write-Host "  [FOLDER] database/queries/      - Queries de diagnostico" -ForegroundColor White
Write-Host "  [FOLDER] nginx/                 - Configuraciones nginx" -ForegroundColor White
Write-Host "  [FOLDER] tests/api/             - Tests de API" -ForegroundColor White
Write-Host "  [FOLDER] tests/diagnostics/     - Scripts de diagnostico" -ForegroundColor White
Write-Host ""
Write-Host "Archivos en raiz:" -ForegroundColor Cyan
Write-Host "  [OK] README.md" -ForegroundColor White
Write-Host "  [OK] VERSION.md" -ForegroundColor White
Write-Host "  [OK] .gitignore" -ForegroundColor White
Write-Host "  [OK] package.json" -ForegroundColor White
Write-Host "  [OK] AWS-ISSABEL.pem" -ForegroundColor White
Write-Host "  [OK] ecosystem.config.js" -ForegroundColor White
Write-Host "  [OK] ecosystem.config.example.js" -ForegroundColor White
Write-Host ""
