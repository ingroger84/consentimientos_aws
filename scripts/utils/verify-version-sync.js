#!/usr/bin/env node
/**
 * Script para verificar que todas las versiones están sincronizadas
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

function readVersion(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(pattern);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

function checkVersionSync() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  VERIFICACIÓN DE SINCRONIZACIÓN           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const versions = {
    'frontend/package.json': readVersion(
      path.join(rootDir, 'frontend', 'package.json'),
      /"version":\s*"([^"]+)"/
    ),
    'backend/package.json': readVersion(
      path.join(rootDir, 'backend', 'package.json'),
      /"version":\s*"([^"]+)"/
    ),
    'frontend/src/config/version.ts': readVersion(
      path.join(rootDir, 'frontend', 'src', 'config', 'version.ts'),
      /version:\s*'([^']+)'/
    ),
    'backend/src/config/version.ts': readVersion(
      path.join(rootDir, 'backend', 'src', 'config', 'version.ts'),
      /version:\s*'([^']+)'/
    ),
    'VERSION.md': readVersion(
      path.join(rootDir, 'VERSION.md'),
      /Versión Actual:\s*(\d+\.\d+\.\d+)/
    ),
    'README.md': readVersion(
      path.join(rootDir, 'README.md'),
      /version-([^-]+)-blue/
    ),
  };

  let allSynced = true;
  const uniqueVersions = [...new Set(Object.values(versions).filter(v => v !== null))];

  console.log('📦 Versiones encontradas:\n');
  for (const [file, version] of Object.entries(versions)) {
    const status = version ? '✓' : '✗';
    const color = version ? '' : ' (FALTA)';
    console.log(`   ${status} ${file.padEnd(40)} ${version || 'N/A'}${color}`);
  }

  console.log('\n' + '─'.repeat(50) + '\n');

  if (uniqueVersions.length === 0) {
    console.log('❌ No se encontraron versiones\n');
    return false;
  } else if (uniqueVersions.length === 1) {
    console.log(`✓ Todas las versiones están sincronizadas: ${uniqueVersions[0]}\n`);
    return true;
  } else {
    console.log('⚠️  VERSIONES DESINCRONIZADAS:\n');
    uniqueVersions.forEach(v => {
      const files = Object.entries(versions)
        .filter(([_, ver]) => ver === v)
        .map(([file, _]) => file);
      console.log(`   ${v}:`);
      files.forEach(f => console.log(`      - ${f}`));
    });
    console.log('\n💡 Ejecuta: node scripts/utils/bump-version.js patch\n');
    return false;
  }
}

const synced = checkVersionSync();
process.exit(synced ? 0 : 1);
