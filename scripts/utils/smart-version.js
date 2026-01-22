#!/usr/bin/env node
/**
 * Sistema Inteligente de Versionamiento Automático
 * Detecta el tipo de cambio y actualiza la versión apropiadamente
 * Basado en mejores prácticas de SaaS y Semantic Versioning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de detección de cambios
const CHANGE_PATTERNS = {
  MAJOR: [
    /breaking\s+change/i,
    /incompatible/i,
    /migration.*required/i,
    /\[MAJOR\]/i,
  ],
  MINOR: [
    /feat:/i,
    /feature:/i,
    /nueva?\s+funcionalidad/i,
    /new\s+feature/i,
    /\[MINOR\]/i,
    /add.*feature/i,
  ],
  PATCH: [
    /fix:/i,
    /bugfix:/i,
    /hotfix:/i,
    /correcci[oó]n/i,
    /\[PATCH\]/i,
    /optimizaci[oó]n/i,
  ],
};

// Archivos críticos que indican cambios MAJOR
const CRITICAL_FILES = [
  'backend/src/database/migrations/',
  'backend/src/auth/',
  'frontend/src/store/',
  'package.json',
];

class VersionManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..', '..');
    this.currentVersion = this.getCurrentVersion();
    this.currentDate = this.getCurrentDate();
    this.changeLog = [];
  }

  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentVersion() {
    try {
      const versionPath = path.join(this.rootDir, 'frontend', 'src', 'config', 'version.ts');
      const content = fs.readFileSync(versionPath, 'utf8');
      const match = content.match(/version: '(\d+\.\d+\.\d+)'/);
      return match ? match[1] : '1.1.0';
    } catch (error) {
      return '1.1.0';
    }
  }

  detectChangeType() {
    try {
      // Obtener archivos modificados
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      const files = stagedFiles.split('\n').filter(f => f.trim());

      // Obtener mensaje del último commit o archivos staged
      let commitMessage = '';
      try {
        commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' });
      } catch (e) {
        // No hay commits previos
      }

      // Detectar tipo de cambio
      if (this.isMajorChange(files, commitMessage)) {
        return 'MAJOR';
      } else if (this.isMinorChange(files, commitMessage)) {
        return 'MINOR';
      } else {
        return 'PATCH';
      }
    } catch (error) {
      console.log('⚠ No se pudo detectar tipo de cambio, usando PATCH por defecto');
      return 'PATCH';
    }
  }

  isMajorChange(files, message) {
    // Verificar patrones en mensaje
    if (CHANGE_PATTERNS.MAJOR.some(pattern => pattern.test(message))) {
      return true;
    }

    // Verificar archivos críticos
    return files.some(file => 
      CRITICAL_FILES.some(critical => file.includes(critical))
    );
  }

  isMinorChange(files, message) {
    // Verificar patrones en mensaje
    if (CHANGE_PATTERNS.MINOR.some(pattern => pattern.test(message))) {
      return true;
    }

    // Verificar si hay nuevos archivos (features)
    try {
      const newFiles = execSync('git diff --cached --diff-filter=A --name-only', { encoding: 'utf8' });
      return newFiles.split('\n').filter(f => f.trim()).length > 3;
    } catch (e) {
      return false;
    }
  }

  incrementVersion(type) {
    const parts = this.currentVersion.split('.').map(Number);
    let [major, minor, patch] = parts;

    switch (type) {
      case 'MAJOR':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'MINOR':
        minor += 1;
        patch = 0;
        break;
      case 'PATCH':
      default:
        patch += 1;
        break;
    }

    return `${major}.${minor}.${patch}`;
  }

  extractChanges() {
    try {
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      const files = stagedFiles.split('\n').filter(f => f.trim());

      const changes = [];
      
      // Categorizar cambios
      const categories = {
        'Backend': files.filter(f => f.startsWith('backend/')),
        'Frontend': files.filter(f => f.startsWith('frontend/')),
        'Documentación': files.filter(f => f.startsWith('doc/') || f.endsWith('.md')),
        'Scripts': files.filter(f => f.startsWith('scripts/')),
      };

      for (const [category, categoryFiles] of Object.entries(categories)) {
        if (categoryFiles.length > 0) {
          changes.push(`${category}: ${categoryFiles.length} archivo(s) modificado(s)`);
        }
      }

      return changes.length > 0 ? changes : ['Mejoras y correcciones generales'];
    } catch (error) {
      return ['Actualización del sistema'];
    }
  }

  updateVersionFile(filePath, newVersion) {
    const content = `/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: ${this.currentDate}
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '${newVersion}',
  date: '${this.currentDate}',
  fullVersion: '${newVersion} - ${this.currentDate}',
  buildDate: new Date('${this.currentDate}').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
`;
    fs.writeFileSync(filePath, content, 'utf8');
  }

  updatePackageJson(filePath, newVersion) {
    const content = fs.readFileSync(filePath, 'utf8');
    const packageJson = JSON.parse(content);
    packageJson.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
  }

  updateVersionMd(newVersion, changeType, changes) {
    const versionPath = path.join(this.rootDir, 'VERSION.md');
    
    // Leer historial existente si existe
    let existingHistory = '';
    try {
      const existingContent = fs.readFileSync(versionPath, 'utf8');
      const historyMatch = existingContent.match(/## Historial de Versiones\n\n([\s\S]*?)(?=\n---|\n##|$)/);
      if (historyMatch) {
        existingHistory = historyMatch[1].trim();
      }
    } catch (e) {
      // Archivo no existe
    }

    const changesList = changes.map(c => `- ${c}`).join('\n');
    const newEntry = `### ${newVersion} - ${this.currentDate} [${changeType}]\n${changesList}`;

    const content = `# Versión del Sistema

## Versión Actual: ${newVersion}
**Fecha:** ${this.currentDate}
**Tipo de Cambio:** ${changeType}

---

## Formato de Versión

\`MAJOR.MINOR.PATCH\`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

${newEntry}

${existingHistory}

---

## Sistema de Versionamiento Automático

### Detección Inteligente de Cambios

El sistema detecta automáticamente el tipo de versión basándose en:

1. **MAJOR (X.0.0)**: 
   - Cambios en migraciones de base de datos
   - Modificaciones en autenticación
   - Cambios incompatibles en APIs
   - Mensaje de commit con "BREAKING CHANGE"

2. **MINOR (0.X.0)**:
   - Nuevas funcionalidades (feat:, feature:)
   - Adición de múltiples archivos nuevos
   - Mensaje de commit con "feat:" o "[MINOR]"

3. **PATCH (0.0.X)**:
   - Correcciones de bugs (fix:, bugfix:)
   - Optimizaciones
   - Mejoras menores
   - Por defecto si no se detecta otro tipo

### Uso

**Automático:** Se ejecuta en cada commit mediante Git Hook
**Manual:** \`node scripts/utils/smart-version.js\`

---

## Sincronización

La versión se sincroniza automáticamente en:
- ✓ frontend/package.json
- ✓ backend/package.json
- ✓ frontend/src/config/version.ts
- ✓ backend/src/config/version.ts
- ✓ VERSION.md (este archivo)
`;

    fs.writeFileSync(versionPath, content, 'utf8');
  }

  async update() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  SISTEMA INTELIGENTE DE VERSIONAMIENTO    ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const changeType = this.detectChangeType();
    const newVersion = this.incrementVersion(changeType);
    const changes = this.extractChanges();

    console.log(`📦 Versión actual:  ${this.currentVersion}`);
    console.log(`📦 Nueva versión:   ${newVersion}`);
    console.log(`🏷️  Tipo de cambio: ${changeType}`);
    console.log(`📅 Fecha:           ${this.currentDate}\n`);

    console.log('📝 Cambios detectados:');
    changes.forEach(change => console.log(`   • ${change}`));
    console.log('');

    // Actualizar archivos
    console.log('🔄 Actualizando archivos...\n');

    const files = [
      {
        path: path.join(this.rootDir, 'frontend', 'src', 'config', 'version.ts'),
        name: 'frontend/src/config/version.ts',
        update: () => this.updateVersionFile(path.join(this.rootDir, 'frontend', 'src', 'config', 'version.ts'), newVersion),
      },
      {
        path: path.join(this.rootDir, 'backend', 'src', 'config', 'version.ts'),
        name: 'backend/src/config/version.ts',
        update: () => this.updateVersionFile(path.join(this.rootDir, 'backend', 'src', 'config', 'version.ts'), newVersion),
      },
      {
        path: path.join(this.rootDir, 'frontend', 'package.json'),
        name: 'frontend/package.json',
        update: () => this.updatePackageJson(path.join(this.rootDir, 'frontend', 'package.json'), newVersion),
      },
      {
        path: path.join(this.rootDir, 'backend', 'package.json'),
        name: 'backend/package.json',
        update: () => this.updatePackageJson(path.join(this.rootDir, 'backend', 'package.json'), newVersion),
      },
    ];

    for (const file of files) {
      try {
        file.update();
        console.log(`   ✓ ${file.name}`);
      } catch (error) {
        console.log(`   ✗ ${file.name} - ${error.message}`);
      }
    }

    // Actualizar VERSION.md
    this.updateVersionMd(newVersion, changeType, changes);
    console.log(`   ✓ VERSION.md`);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║  ✓ VERSIÓN ${newVersion} APLICADA EXITOSAMENTE  ║`);
    console.log('╚════════════════════════════════════════════╝\n');

    return newVersion;
  }
}

// Ejecutar
if (require.main === module) {
  const manager = new VersionManager();
  manager.update().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = VersionManager;
