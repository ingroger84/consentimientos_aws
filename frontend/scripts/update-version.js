/**
 * Script para actualizar version.json automáticamente durante el build
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer package.json
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Leer version.ts
const versionTsPath = join(__dirname, '../src/config/version.ts');
const versionTs = readFileSync(versionTsPath, 'utf-8');

// Extraer versión de version.ts
const versionMatch = versionTs.match(/version:\s*['"]([^'"]+)['"]/);
const version = versionMatch ? versionMatch[1] : packageJson.version;

// Generar hash único basado en timestamp
const buildHash = Date.now().toString(36);

// Crear version.json
const versionInfo = {
  version,
  buildDate: new Date().toISOString().split('T')[0],
  buildHash,
  buildTimestamp: Date.now(),
};

// Escribir version.json en public
const versionJsonPath = join(__dirname, '../public/version.json');
writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2));

console.log('✅ version.json actualizado:');
console.log(JSON.stringify(versionInfo, null, 2));
