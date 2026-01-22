#!/usr/bin/env node
/**
 * Script para mostrar la versión actual del sistema
 */

const fs = require('fs');
const path = require('path');

function getVersion() {
  try {
    const versionPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'version.ts');
    const content = fs.readFileSync(versionPath, 'utf8');
    
    const versionMatch = content.match(/version: '([^']+)'/);
    const dateMatch = content.match(/date: '([^']+)'/);
    
    return {
      version: versionMatch ? versionMatch[1] : 'N/A',
      date: dateMatch ? dateMatch[1] : 'N/A',
    };
  } catch (error) {
    return { version: 'N/A', date: 'N/A' };
  }
}

const { version, date } = getVersion();

console.log('\n╔════════════════════════════════════════════╗');
console.log('║         VERSIÓN DEL SISTEMA                ║');
console.log('╚════════════════════════════════════════════╝\n');
console.log(`  📦 Versión: ${version}`);
console.log(`  📅 Fecha:   ${date}\n`);
