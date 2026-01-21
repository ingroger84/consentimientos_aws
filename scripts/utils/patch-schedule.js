const fs = require('fs');
const path = './node_modules/@nestjs/schedule/dist/scheduler.orchestrator.js';
const backupPath = path + '.backup';

// Restaurar desde backup si existe
if (fs.existsSync(backupPath)) {
  const content = fs.readFileSync(backupPath, 'utf8');
  const patched = 'const crypto = require("crypto");\n' + content;
  fs.writeFileSync(path, patched);
  console.log('✅ Patched successfully');
} else {
  console.log('❌ Backup file not found');
}
