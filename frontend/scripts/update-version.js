/**
 * Script para actualizar version.json automáticamente durante el build
 * También actualiza index.html con timestamp único
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer package.json para obtener la versión
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Usar versión de package.json
const version = packageJson.version;

// Generar hash único basado en timestamp
const buildHash = Date.now().toString(36);
const buildTimestamp = Date.now().toString();

// Crear version.json
const versionInfo = {
  version,
  buildDate: new Date().toISOString().split('T')[0],
  buildHash,
  buildTimestamp,
};

// Escribir version.json en public
const versionJsonPath = join(__dirname, '../public/version.json');
writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2));

console.log('✅ version.json actualizado:');
console.log(JSON.stringify(versionInfo, null, 2));

// Actualizar index.html con timestamp y versión
const indexHtmlPath = join(__dirname, '../index.html');
let indexHtml = readFileSync(indexHtmlPath, 'utf-8');

// Reemplazar placeholders
indexHtml = indexHtml.replace(/BUILD_TIMESTAMP_PLACEHOLDER/g, buildTimestamp);
indexHtml = indexHtml.replace(/APP_VERSION_PLACEHOLDER/g, version);

// Guardar temporalmente para que Vite lo procese
const tempIndexPath = join(__dirname, '../index.temp.html');
writeFileSync(tempIndexPath, indexHtml);

console.log('✅ index.html preparado con timestamp:', buildTimestamp);
console.log('✅ Versión:', version);
