# Script para organizar la documentación del proyecto
# Fecha: 2026-02-23

Write-Host "🗂️  Organizando documentación..." -ForegroundColor Cyan

# Crear estructura de carpetas
$folders = @(
    "doc/versiones",
    "doc/despliegues", 
    "doc/correcciones",
    "doc/verificaciones",
    "doc/instrucciones",
    "doc/implementaciones",
    "doc/resumen-sesiones",
    "doc/herramientas-html"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Creada carpeta: $folder" -ForegroundColor Green
    }
}

# Mover archivos de versiones
Write-Host "`n📦 Moviendo archivos de versiones..." -ForegroundColor Yellow
$versionFiles = @(
    "CORRECCION_VERSION_PAGINA_ESTADO_V40.3.11.md",
    "AMPLIACION_TIPOS_ADMISION_V40.3.6.md",
    "IMPLEMENTACION_FECHA_SUSPENSION_TENANTS_V40.3.10.md",
    "CORRECCION_CONSENTIMIENTOS_ADMISIONES_V40.3.9.md",
    "CORRECCION_ERROR_CONSENTIMIENTO_HC_V40.3.8.md",
    "DESPLIEGUE_COMPLETO_V40.3.7.md",
    "CORRECCION_FLUJO_CREACION_HC_V40.3.7.md",
    "SOLUCION_ERROR_ELIMINAR_HC_SUPER_ADMIN_V40.3.5.md",
    "CORRECCION_PERMISOS_OPERADOR_V40.3.4.md",
    "CORRECCION_ASOCIACION_REGISTROS_ADMISIONES_V40.3.3.md",
    "CORRECCION_DEBUG_ADMISIONES_V40.3.3.md",
    "CORRECCION_ADMISIONES_NO_APARECEN_V40.3.2.md",
    "CORRECCION_MODAL_AUTOMATICO_V40.3.1.md",
    "RESUMEN_FINAL_V40.3.0.md",
    "SOLUCION_DEFINITIVA_MODAL_V40.3.0.md",
    "SOLUCION_DEFINITIVA_V40.1.0.md",
    "RESUMEN_EJECUTIVO_V39.2.0.md",
    "REESTRUCTURACION_FLUJO_HC_V39.2.0.md",
    "CORRECCION_DEFINITIVA_FLUJO_HC_V39.1.1.md",
    "RESUMEN_DESPLIEGUE_V39.0.1_COMPLETADO.md",
    "RESUMEN_CORRECCION_FLUJO_ADMISIONES_V39.0.1.md",
    "DESPLIEGUE_V39_SISTEMA_ADMISIONES.md",
    "IMPLEMENTACION_SISTEMA_ADMISIONES_V39.md"
)

foreach ($file in $versionFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/versiones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de despliegues
Write-Host "`n🚀 Moviendo archivos de despliegues..." -ForegroundColor Yellow
$deployFiles = @(
    "DESPLIEGUE_V38.1.24_MODAL_ADMISIONES.md",
    "DESPLIEGUE_V38.1.14_COMPLETADO.md",
    "DESPLIEGUE_V38.1.7_COMPLETADO.md",
    "DESPLIEGUE_V38.1.2_COMPLETADO.md",
    "DESPLIEGUE_V38.1.1_COMPLETADO.md",
    "DESPLIEGUE_V38_COMPLETADO.md",
    "DESPLIEGUE_V37.1.0_COMPLETADO.md",
    "DESPLIEGUE_V28.1.1_COMPLETADO.md",
    "DESPLIEGUE_VERSION_30.2.1_FINAL.md",
    "DESPLIEGUE_VERSION_24.0.0_INSTRUCCIONES.md",
    "DESPLIEGUE_PRODUCCION_23.2.0.md",
    "DESPLIEGUE_PLANES_PRECIOS_COMPLETADO.md",
    "DESPLIEGUE_MULTI_REGION_COMPLETADO.md",
    "DESPLIEGUE_MULTI_REGION_MANUAL.md",
    "DESPLIEGUE_ESTADOS_TENANTS_COMPLETADO.md",
    "DESPLIEGUE_FINAL.md",
    "DEPLOYMENT.md",
    "README_DESPLIEGUE.md",
    "COMANDOS_DESPLIEGUE_AWS.md",
    "COMANDOS_RAPIDOS.md"
)

foreach ($file in $deployFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/despliegues/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de correcciones
Write-Host "`n🔧 Moviendo archivos de correcciones..." -ForegroundColor Yellow
$fixFiles = @(
    "CORRECCION_RACE_CONDITION_HC_V38.1.14.md",
    "CORRECCION_FLUJO_ADMISIONES_V38.1.15.md",
    "CORRECCION_SIGNOS_VITALES_V38.1.8.md",
    "CORRECCION_SUPER_ADMIN_HC_V38.1.10.md",
    "CORRECCION_SUPER_ADMIN_HC_V38.1.9.md",
    "CORRECCION_SUPER_ADMIN_HC_V38.1.6.md",
    "CORRECCION_ERROR_401_HC_V38.1.5.md",
    "CORRECCION_BOTON_VISTA_PREVIA_HC_V38.1.2.md",
    "CORRECCION_BANNER_ACTUALIZACION_V38.1.3.md",
    "CORRECCION_ERROR_LOGIN_V38.1.1.md",
    "CORRECCION_ESTADO_SISTEMA_V38.1.10.md",
    "CORRECCION_FINAL_STATUS_V38.1.10.md",
    "CORRECCION_PERMISOS_ADMISIONES_V2.0.1.md",
    "CORRECCION_PERMISOS_CREATE_HC_V2.0.1.md",
    "CORRECCION_PAGINA_PLANES_PRECIOS.md",
    "CORRECCION_FINAL_HC.md",
    "CORRECCION_HISTORIAS_CLINICAS.md",
    "CORRECCION_MI_PLAN.md",
    "CORRECCION_EMAIL_SMTP_APLICADA.md",
    "CORRECCION_ERROR_LOGIN.md",
    "CORRECCION_BOTON_ELIMINAR_SUPER_ADMIN.md",
    "RESUMEN_CORRECCIONES_LOGS.md",
    "RESUMEN_CORRECCION_ESTADOS_TENANTS.md",
    "RESUMEN_CORRECCION_FINAL.md",
    "RESUMEN_CORRECCION_PLANES_PRECIOS.md",
    "RESUMEN_CORRECCION_STATUS_V38.1.10.md"
)

foreach ($file in $fixFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/correcciones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de verificaciones
Write-Host "`n✅ Moviendo archivos de verificaciones..." -ForegroundColor Yellow
$verifyFiles = @(
    "VERIFICACION_FINAL_V30.2.1.md",
    "VERIFICACION_FINAL_V26.0.3.md",
    "VERIFICACION_FRONTEND_23.2.0.md",
    "VERIFICACION_GESTION_PRECIOS_MULTI_REGION.md",
    "VERIFICACION_SERVIDOR_COMPLETA_V30.2.1.md",
    "VERIFICACION_VERSIONAMIENTO_26.0.3.md",
    "VERIFICACION_VERSIONES_33.0.0.md",
    "VERIFICACION_VERSIONES_30.2.1.md",
    "VERIFICACION_VERSIONES_22.0.2.md",
    "VERIFICACION_VERSIONES_20.0.3.md",
    "VERIFICACION_VERSIONES_19.1.1.md",
    "VERIFICACION_VERSIONES_2026-02-07.md",
    "VERIFICACION_VERSIONES_ACTUAL.md",
    "VERIFICACION_VERSION_23.2.0.md",
    "VERIFICACION_VERSION_23.1.0.md",
    "VERIFICACION_VERSION_BACKEND_FINAL.md",
    "verificacion-completa.md",
    "RESUMEN_VERIFICACION_VERSIONES.md",
    "REPORTE_VERSIONES_FINAL.md",
    "REPORTE_VERSION_ACTUAL.md",
    "VERSION_ACTUAL_SERVIDOR.md",
    "VERSION.md"
)

foreach ($file in $verifyFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/verificaciones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de instrucciones
Write-Host "`n📋 Moviendo archivos de instrucciones..." -ForegroundColor Yellow
$instructionFiles = @(
    "INSTRUCCIONES_URGENTES_V40.3.3.md",
    "INSTRUCCIONES_URGENTES_V38.1.19.md",
    "INSTRUCCIONES_URGENTES_SEGURIDAD.md",
    "INSTRUCCIONES_URGENTES_PANTALLA_BLANCO.md",
    "INSTRUCCIONES_URGENTES_EMAIL_SMTP.md",
    "INSTRUCCIONES_URGENTES_CACHE_V37.md",
    "INSTRUCCIONES_URGENTES_CACHE.md",
    "INSTRUCCIONES_VERIFICACION_V31.1.1_FINAL.md",
    "INSTRUCCIONES_VERIFICACION_V26.0.3.md",
    "INSTRUCCIONES_VER_VERSION_28.1.1.md",
    "INSTRUCCIONES_USUARIO_V34.md",
    "INSTRUCCIONES_RAPIDAS_BOTONES_HC.md",
    "INSTRUCCIONES_PUSH_GITHUB_SECRETOS.md",
    "INSTRUCCIONES_PUSH_GITHUB.md",
    "INSTRUCCIONES_PRUEBA_STATUS_V38.1.10.md",
    "INSTRUCCIONES_PERMISOS_ADMISIONES_URGENTE.md",
    "INSTRUCCIONES_LIMPIAR_CACHE_V34.md",
    "INSTRUCCIONES_FINALES_V38.1.21.md",
    "INSTRUCCIONES_FINALES_V38.1.20.md",
    "INSTRUCCIONES_FINALES_TENANTS.md",
    "INSTRUCCIONES_FINALES_HC.md",
    "INSTRUCCIONES_DESPLIEGUE_MULTI_REGION.md",
    "INSTRUCCIONES_CACHE_V30.2.1.md",
    "INSTRUCCIONES_CACHE.md",
    "INSTRUCCIONES_BOTON_ELIMINAR_HC_CACHE.md",
    "INSTRUCCIONES_BOTON_ELIMINAR_HC.md",
    "INDICE_DESPLIEGUE_MULTI_REGION.md",
    "EJECUTAR_DESPLIEGUE_AHORA.md",
    "EJECUTA_ESTO_AHORA.md",
    "DESPLEGAR_V38_AHORA.md",
    "ACTUALIZACION_LOCAL_V23.md",
    "ACCIONES_PENDIENTES_URGENTES.md",
    "ACCIONES_FINALES_V31.1.0.md"
)

foreach ($file in $instructionFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/instrucciones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de implementaciones
Write-Host "`n⚙️  Moviendo archivos de implementaciones..." -ForegroundColor Yellow
$implFiles = @(
    "IMPLEMENTACION_V38_SWAGGER_VERSIONAMIENTO.md",
    "IMPLEMENTACION_SISTEMA_ADMISIONES_V39.md",
    "IMPLEMENTACION_PERMISOS_HC_V32.0.1.md",
    "IMPLEMENTACION_OPTIMIZACIONES.md",
    "IMPLEMENTACION_MULTI_REGION_COMPLETADA.md",
    "IMPLEMENTACION_MODAL_HC_V38.1.4.md",
    "IMPLEMENTACION_CUMPLIMIENTO_NORMATIVO_COMPLETADA.md",
    "IMPLEMENTACION_COMPLETADA.md",
    "RESUMEN_IMPLEMENTACION_V39_COMPLETADA.md",
    "RESUMEN_IMPLEMENTACION_V25.md",
    "RESUMEN_IMPLEMENTACION_MULTI_REGION.md",
    "RESUMEN_IMPLEMENTACION_BOTONES_HC_V31.1.0.md",
    "GESTION_PRECIOS_MULTI_REGION_COMPLETADA.md",
    "GUIA_GESTION_PRECIOS_SUPER_ADMIN.md",
    "SWAGGER_DOCUMENTACION_COMPLETA_V38.md",
    "SISTEMA_VERSIONAMIENTO_V2_IMPLEMENTADO.md",
    "SISTEMA_BACKUPS_S3.md",
    "PLAN_OPTIMIZACION_Y_BACKUPS.md",
    "LEEME_OPTIMIZACIONES.md",
    "COMPARATIVA_ANTES_DESPUES.md"
)

foreach ($file in $implFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/implementaciones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de resumen de sesiones
Write-Host "`n📝 Moviendo archivos de resumen de sesiones..." -ForegroundColor Yellow
$sessionFiles = @(
    "RESUMEN_SESION_2026-02-09_FINAL.md",
    "RESUMEN_SESION_2026-02-09_FINAL_V34.md",
    "RESUMEN_SESION_2026-02-09_PERMISOS_HC.md",
    "RESUMEN_SESION_2026-02-09_CACHE_BUSTING_V37.md",
    "RESUMEN_SESION_2026-02-09_BOTONES_HC_FINAL.md",
    "RESUMEN_SESION_2026-02-09.md",
    "RESUMEN_SESION_2026-02-07.md",
    "RESUMEN_SESION_2026-02-06.md",
    "ESTADO_FINAL_SESION_2026-02-07.md",
    "RESUMEN_FINAL_SESION_2026-02-07.md",
    "RESUMEN_FINAL_V38_SWAGGER.md",
    "RESUMEN_FINAL_V38.1.19.md",
    "RESUMEN_FINAL_V34.0.0.md",
    "RESUMEN_FINAL_SOLUCION_CACHE_V37.md",
    "RESUMEN_FINAL_SINCRONIZACION.md",
    "RESUMEN_FINAL_DOMINIO_CORRECTO.md",
    "RESUMEN_FINAL_DESPLIEGUE_V30.2.1.md",
    "RESUMEN_FINAL_DESPLIEGUE_MULTI_REGION.md",
    "RESUMEN_FINAL_DATOS_PRODUCCION.md",
    "RESUMEN_EJECUTIVO_V31.1.1.md",
    "RESUMEN_EJECUTIVO_FINAL.md",
    "RESUMEN_ESTRATEGIA_MULTI_MERCADO.md",
    "RESUMEN_DESPLIEGUE_BOLD.md",
    "RESUMEN_PERMISOS_HC_V32.0.1.md",
    "RESUMEN_OPTIMIZACIONES_Y_BACKUPS.md",
    "RESUMEN_V38_SWAGGER.md",
    "ESTADO_PROYECTO_V2.0.0.md",
    "ESTADO_FINAL_MULTI_REGION.md",
    "ESTADO_ACTUAL_SISTEMA.md",
    "ESTRATEGIA_MULTI_MERCADO_RESUMEN.md"
)

foreach ($file in $sessionFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/resumen-sesiones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos de soluciones
Write-Host "`n🔨 Moviendo archivos de soluciones..." -ForegroundColor Yellow
$solutionFiles = @(
    "SOLUCION_DEFINITIVA_V38.1.22_FINAL.md",
    "SOLUCION_DEFINITIVA_MODAL_V38.1.21.md",
    "SOLUCION_DEFINITIVA_ERROR_404_V38.1.19.md",
    "SOLUCION_DEFINITIVA_CACHE_V38.1.15.md",
    "SOLUCION_DEFINITIVA_CACHE_V38.1.12.md",
    "SOLUCION_DEFINITIVA_CACHE_STATUS.md",
    "SOLUCION_DEFINITIVA_VERSION_V38.1.3.md",
    "SOLUCION_VERSIONAMIENTO_30.2.2.md",
    "SOLUCION_VERSION_23.2.0.md",
    "SOLUCION_TENANTS_NO_CARGAN.md",
    "SOLUCION_TENANTS_CORREGIDA.md",
    "SOLUCION_REAL_APLICADA.md",
    "SOLUCION_PUSH_GITHUB.md",
    "SOLUCION_PLANTILLAS_HC.md",
    "SOLUCION_PERMISOS_ADMISIONES_V38.1.19.md",
    "SOLUCION_PERMISOS_ADMISIONES.md",
    "SOLUCION_PERMISOS.md",
    "SOLUCION_PANTALLA_BLANCO_V31.1.0.md",
    "SOLUCION_PANTALLA_BLANCO_FINAL.md",
    "SOLUCION_MENU_VACIO.md",
    "SOLUCION_LOGIN_ERROR.md",
    "SOLUCION_LANDING_403_V31.1.0.md",
    "SOLUCION_FINAL_V31.1.0.md",
    "SOLUCION_FINAL_STATUS_V38.1.11.md",
    "SOLUCION_FINAL_STATUS_V38.1.10.md",
    "SOLUCION_FINAL_PERMISOS_OPERADOR_V2.0.1.md",
    "SOLUCION_FINAL_PERMISOS_CERRAR_ADMISION.md",
    "SOLUCION_FINAL_CONSENTIMIENTOS_HC.md",
    "SOLUCION_FINAL_COMPLETA_V38.1.19.md",
    "SOLUCION_FINAL_BOTON_ELIMINAR.md",
    "SOLUCION_ERROR_EMAIL_SMTP.md",
    "SOLUCION_ERROR_BACKEND_DB.md",
    "SOLUCION_CONSENTIMIENTOS_HC.md",
    "SOLUCION_COMPLETA_FINAL_V31.1.0.md",
    "SOLUCION_CACHE_PERSISTENTE_V37.md",
    "SOLUCION_CACHE_NAVEGADOR.md",
    "SOLUCION_CACHE_APLICADA.md",
    "SOLUCION_BOTON_ELIMINAR_FINAL.md",
    "SOLUCION_APLICADA_REACT_STRICTMODE.md",
    "SOLUCION_APLICADA_BACKEND.md",
    "RESUMEN_PROBLEMA_CACHE_V40.3.10.md"
)

foreach ($file in $solutionFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/correcciones/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Mover archivos HTML a herramientas
Write-Host "`n🌐 Moviendo archivos HTML..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -File | Where-Object { $_.Name -notlike "index.html" }
foreach ($file in $htmlFiles) {
    Move-Item -Path $file.FullName -Destination "doc/herramientas-html/" -Force
    Write-Host "  ✓ $file" -ForegroundColor Gray
}

# Mover archivos restantes
Write-Host "`n📄 Moviendo archivos restantes..." -ForegroundColor Yellow
$remainingFiles = @(
    "LISTO_PARA_DESPLEGAR_V2.md",
    "LISTO_PARA_USAR.md",
    "LEEME_PRIMERO_V37.md",
    "LEEME_PRIMERO.md",
    "ESTRUCTURA_PROYECTO.md",
    "CREDENCIALES.md",
    "COMPARACION_DESARROLLO_PRODUCCION.md",
    "APLICAR_PERMISOS_HC.md",
    "ACTUALIZACION_COMPLETA_V38.1.7.md",
    "MEJORAS_FLUJO_HC_V38.1.14.md",
    "RESULTADO_TEST_BOLD_PRODUCCION.md",
    "SERVICIOS_REINICIADOS_V37.md",
    "VERIFICAR_VERSION_AHORA_CORRECTO.md",
    "VERIFICAR_VERSION_AHORA.md"
)

foreach ($file in $remainingFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "doc/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Organización completada!" -ForegroundColor Green
Write-Host "📊 Resumen de carpetas:" -ForegroundColor Cyan
Write-Host "  - doc/versiones: Documentación de versiones específicas" -ForegroundColor Gray
Write-Host "  - doc/despliegues: Guías y registros de despliegues" -ForegroundColor Gray
Write-Host "  - doc/correcciones: Correcciones y soluciones aplicadas" -ForegroundColor Gray
Write-Host "  - doc/verificaciones: Scripts y guías de verificación" -ForegroundColor Gray
Write-Host "  - doc/instrucciones: Instrucciones paso a paso" -ForegroundColor Gray
Write-Host "  - doc/implementaciones: Documentación de implementaciones" -ForegroundColor Gray
Write-Host "  - doc/resumen-sesiones: Resúmenes de sesiones de trabajo" -ForegroundColor Gray
Write-Host "  - doc/herramientas-html: Herramientas HTML de diagnóstico" -ForegroundColor Gray
