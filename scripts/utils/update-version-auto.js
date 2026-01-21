#!/usr/bin/env node
/**
 * Script para auto-incrementar la versión del sistema
 * Se ejecuta automáticamente antes de cada commit
 */

const fs = require('fs');
const path = require('path');

// Función para obtener la fecha actual en formato YYYYMMDD
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Función para incrementar la versión PATCH
function incrementVersion(version) {
  const parts = version.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]) + 1; // Incrementar PATCH
  return `${major}.${minor}.${patch}`;
}

// Función para leer la versión actual
function getCurrentVersion() {
  const versionPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'version.ts');
  const content = fs.readFileSync(versionPath, 'utf8');
  const match = content.match(/version: '(\d+\.\d+\.\d+)'/);
  return match ? match[1] : '1.1.1';
}

// Función para actualizar archivo de versión TypeScript
function updateVersionFile(filePath, newVersion, newDate) {
  const content = `/**
 * Configuración de versión de la aplicación
 * Formato: MAJOR.MINOR.PATCH - YYYYMMDD
 */
export const APP_VERSION = {
  version: '${newVersion}',
  date: '${newDate}',
  fullVersion: '${newVersion} - ${newDate}',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
`;
  fs.writeFileSync(filePath, content, 'utf8');
}

// Función para actualizar package.json
function updatePackageJson(filePath, newVersion) {
  const content = fs.readFileSync(filePath, 'utf8');
  const packageJson = JSON.parse(content);
  packageJson.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
}

// Función para actualizar VERSION.md
function updateVersionMd(newVersion, newDate) {
  const content = `# Versión del Sistema

## Versión Actual: ${newVersion}
**Fecha:** ${newDate.substring(0, 4)}-${newDate.substring(4, 6)}-${newDate.substring(6, 8)}

---

## Formato de Versión

\`MAJOR.MINOR.PATCH - YYYYMMDD\`

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores
- **YYYYMMDD**: Fecha de la actualización

---

## Historial de Versiones

### ${newVersion} - ${newDate.substring(0, 4)}-${newDate.substring(4, 6)}-${newDate.substring(6, 8)}
- Actualización automática del sistema
- Mejoras y correcciones

### 1.1.1 - 2026-01-20
- Sistema de impuestos mejorado
- Facturas exentas de impuestos
- Selección flexible de impuestos
- UI mejorada en configuración de impuestos
- Migración de base de datos completada

### 1.1.0 - 2026-01-20
- Implementación de versionamiento
- Versión visible en login y sidebar
- Corrección de nombres de planes
- Dashboard con estadísticas reales

---

## Actualización Automática

La versión se actualiza automáticamente con cada commit a GitHub mediante Git Hooks.

**Script:** \`update-version-auto.js\`
**Hook:** \`.husky/pre-commit\`

---

## Actualización Manual

Si necesitas actualizar la versión manualmente:

\`\`\`powershell
.\\update-version.ps1
\`\`\`

O especificando la versión:

\`\`\`powershell
.\\update-version.ps1 -Version "2.0.0"
\`\`\`
`;
  fs.writeFileSync(path.join(__dirname, '..', '..', 'VERSION.md'), content, 'utf8');
}

// Ejecutar actualización
try {
  console.log('========================================');
  console.log('AUTO-ACTUALIZACIÓN DE VERSIÓN');
  console.log('========================================\n');

  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion);
  const newDate = getCurrentDate();

  console.log(`Versión actual: ${currentVersion}`);
  console.log(`Nueva versión:  ${newVersion}`);
  console.log(`Fecha:          ${newDate}\n`);

  // Actualizar archivos
  console.log('Actualizando archivos...');

  // Frontend
  updateVersionFile(
    path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'version.ts'),
    newVersion,
    newDate
  );
  console.log('✓ frontend/src/config/version.ts');

  // Backend
  updateVersionFile(
    path.join(__dirname, '..', '..', 'backend', 'src', 'config', 'version.ts'),
    newVersion,
    newDate
  );
  console.log('✓ backend/src/config/version.ts');

  // Package.json Frontend
  updatePackageJson(
    path.join(__dirname, '..', '..', 'frontend', 'package.json'),
    newVersion
  );
  console.log('✓ frontend/package.json');

  // Package.json Backend
  updatePackageJson(
    path.join(__dirname, '..', '..', 'backend', 'package.json'),
    newVersion
  );
  console.log('✓ backend/package.json');

  // VERSION.md
  updateVersionMd(newVersion, newDate);
  console.log('✓ VERSION.md');

  console.log('\n========================================');
  console.log('✓ VERSIÓN ACTUALIZADA EXITOSAMENTE');
  console.log('========================================\n');

} catch (error) {
  console.error('Error al actualizar la versión:', error.message);
  process.exit(1);
}
