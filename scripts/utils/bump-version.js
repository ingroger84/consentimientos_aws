#!/usr/bin/env node
/**
 * Script para incrementar manualmente la versión
 * Uso: node scripts/utils/bump-version.js [major|minor|patch]
 */

const VersionManager = require('./smart-version');

const args = process.argv.slice(2);
const type = args[0] ? args[0].toUpperCase() : 'PATCH';

if (!['MAJOR', 'MINOR', 'PATCH'].includes(type)) {
  console.error('❌ Tipo inválido. Use: major, minor, o patch');
  process.exit(1);
}

class ManualVersionManager extends VersionManager {
  detectChangeType() {
    return type;
  }

  extractChanges() {
    return [`Actualización manual de versión (${type})`];
  }
}

const manager = new ManualVersionManager();
manager.update().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
