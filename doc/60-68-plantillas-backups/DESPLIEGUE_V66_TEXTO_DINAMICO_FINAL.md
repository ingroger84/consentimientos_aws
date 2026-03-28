# Despliegue V66 - Corrección Final Texto Dinámico CN

**Fecha:** 2026-03-20  
**Versión:** V66  
**Estado:** ✅ COMPLETADO

## Problema Identificado

El usuario reportó que en los PDFs de consentimientos (CN), el texto se sobreponía en la sección "PREGUNTAS Y RESPUESTAS", específicamente cuando había respuestas largas como "zxczxc" y "asuastr" que se superponían con el texto de las preguntas.

### Causa Raíz

El código verificaba si había espacio suficiente en la página ANTES de renderizar un párrafo completo, pero NO verificaba el espacio ANTES de cada línea individual. Esto causaba que cuando un párrafo se dividía en múltiples líneas y el espacio se agotaba a mitad del párrafo, las líneas restantes se dibujaban encima del footer o fuera de los márgenes.

**Código problemático:**
```typescript
// ❌ INCORRECTO: Verifica espacio solo una vez por párrafo
if (yPosition < 180) {
  // crear nueva página
}
const wrappedLines = this.wrapText(line, font, 10, contentWidth);
for (const wrappedLine of wrappedLines) {
  page.drawText(wrappedLine, ...); // Puede dibujar fuera de límites
  yPosition -= 15;
}
```

## Solución Implementada

Se movió la verificación de espacio DENTRO del loop de líneas en tres métodos:

### 1. `addProcedureSection` (Ya corregido en V65)
- Verifica espacio antes de cada línea de preguntas
- Verifica espacio antes de cada línea de contenido de plantilla

### 2. `addDataTreatmentSection` (Corregido en V66)
- Verifica espacio antes de cada línea de contenido
- Verifica espacio antes del título "TITULAR DE LOS DATOS"
- Verifica espacio antes de cada línea de información del cliente
- Usa `currentPage` para mantener referencia correcta

### 3. `addImageRightsSection` (Corregido en V66)
- Verifica espacio antes de cada línea de contenido
- Verifica espacio antes del título "TITULAR DE LOS DATOS"
- Verifica espacio antes de cada línea de información del cliente
- Usa `currentPage` para mantener referencia correcta

**Código corregido:**
```typescript
// ✅ CORRECTO: Verifica espacio antes de CADA línea
let currentPage = page;
const wrappedLines = this.wrapText(line, font, 10, contentWidth);
for (const wrappedLine of wrappedLines) {
  // Verificar espacio ANTES de cada línea
  if (yPosition < 180) {
    this.addFooter(currentPage, font, theme);
    currentPage = pdfDoc.addPage([595, 842]);
    this.addWatermark(currentPage, theme);
    yPosition = height - 50;
  }
  
  currentPage.drawText(wrappedLine, ...);
  yPosition -= 15;
}
```

## Cambios Técnicos

### Archivo Modificado
- `backend/src/consents/pdf.service.ts`

### Métodos Actualizados
1. **addDataTreatmentSection:**
   - Línea ~810-870: Renderizado de contenido con verificación por línea
   - Línea ~875: Verificación antes del título de cliente
   - Línea ~885-900: Verificación antes de cada línea de info del cliente

2. **addImageRightsSection:**
   - Línea ~1000-1060: Renderizado de contenido con verificación por línea
   - Línea ~1065: Verificación antes del título de cliente
   - Línea ~1075-1090: Verificación antes de cada línea de info del cliente

### Mejoras Adicionales
- Uso de variable `currentPage` para mantener referencia correcta a la página actual
- Verificación de espacio dinámico para firma (150px + 80px footer = 230px)
- Marca de agua restaurada a configuración original (opacidad 0.4)

## Proceso de Despliegue

### 1. Compilación
```bash
cd backend
npm run build
```

### 2. Empaquetado
```bash
Compress-Archive -Path backend/dist/* -DestinationPath backend-dist-v66-texto-dinamico-final.zip -Force
```

### 3. Subida al Servidor
```bash
scp -i AWS-ISSABEL.pem backend-dist-v66-texto-dinamico-final.zip ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/
```

### 4. Despliegue en Servidor
```bash
# Backup del dist actual
mv dist dist_backup_20260320_143200

# Descomprimir nueva versión
unzip -q -o backend-dist-v66-texto-dinamico-final.zip -d dist

# Reiniciar PM2
pm2 restart datagree
pm2 save
```

### 5. Verificación
```bash
pm2 status
# Estado: online ✅
# PID: 1078847
# Memoria: 137.6mb
# Uptime: 13s
```

## Pruebas Recomendadas

### 1. Prueba de Texto Largo
- Crear un CN con preguntas que tengan respuestas largas (ej: "zxczxc", "asuastr")
- Verificar que el texto NO se sobreponga
- Verificar que las líneas se distribuyan correctamente

### 2. Prueba de Paginación
- Crear un CN con mucho contenido
- Verificar que se creen páginas automáticamente cuando sea necesario
- Verificar que cada página tenga footer y marca de agua

### 3. Prueba de Firma y Foto
- Verificar que la firma y foto permanezcan en página 1 si hay espacio suficiente
- Verificar que se muevan a página 2 solo cuando no haya espacio (< 230px)

### 4. Prueba de Secciones
- Verificar sección "PROCEDIMIENTO"
- Verificar sección "TRATAMIENTO DE DATOS"
- Verificar sección "DERECHOS DE IMAGEN"
- Todas deben tener texto dinámico sin sobreposición

## Archivos Generados

- ✅ `backend-dist-v66-texto-dinamico-final.zip` (735 KB)
- ✅ `scripts/deploy-v66-texto-dinamico-final.ps1`
- ✅ `scripts/deploy-v66-remote.sh`
- ✅ `DESPLIEGUE_V66_TEXTO_DINAMICO_FINAL.md`

## Estado del Servidor

**IP:** 100.28.198.249  
**Usuario:** ubuntu  
**Path:** /home/ubuntu/consentimientos_aws  
**PM2 Process:** datagree  
**Estado:** ✅ Online  
**Backup anterior:** dist_backup_20260320_143200

## Próximos Pasos

1. ✅ Usuario debe probar generando CNs con texto largo
2. ✅ Verificar que no haya sobreposición de texto
3. ✅ Confirmar que la paginación funciona correctamente
4. ✅ Validar que firma y foto se posicionen correctamente

## Notas Técnicas

- La verificación de espacio se hace con margen de 180px desde el bottom
- El espacio mínimo para firma es 230px (150px firma + 80px footer)
- La marca de agua tiene opacidad 0.4 (restaurada a original)
- Cada nueva página incluye marca de agua y footer automáticamente

---

**Despliegue completado exitosamente** ✅
