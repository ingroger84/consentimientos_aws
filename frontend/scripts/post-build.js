/**
 * Script post-build para actualizar index.html con timestamp único
 * Esto asegura que el navegador siempre descargue la versión más reciente
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer version.json generado
const versionJsonPath = join(__dirname, '../dist/version.json');
const versionInfo = JSON.parse(readFileSync(versionJsonPath, 'utf-8'));

// Leer index.html del dist
const indexHtmlPath = join(__dirname, '../dist/index.html');
let indexHtml = readFileSync(indexHtmlPath, 'utf-8');

// Reemplazar placeholders con valores reales
indexHtml = indexHtml.replace(/BUILD_TIMESTAMP_PLACEHOLDER/g, versionInfo.buildTimestamp);
indexHtml = indexHtml.replace(/APP_VERSION_PLACEHOLDER/g, versionInfo.version);

// Guardar index.html actualizado
writeFileSync(indexHtmlPath, indexHtml);

console.log('✅ index.html actualizado en dist/');
console.log(`   Versión: ${versionInfo.version}`);
console.log(`   Timestamp: ${versionInfo.buildTimestamp}`);
console.log(`   Hash: ${versionInfo.buildHash}`);
