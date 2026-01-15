const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('src/mail/mail.service.ts', 'utf8');

console.log('Corrigiendo caracteres especiales...\n');

// Reemplazos simples primero
content = content.replace(/NÃºmero/g, 'Número');
content = content.replace(/confirmaciÃ³n/g, 'confirmación');
content = content.replace(/suspensiÃ³n/g, 'suspensión');
content = content.replace(/activaciÃ³n/g, 'activación');
content = content.replace(/MÃ©todo/g, 'Método');
content = content.replace(/continuarÃ¡/g, 'continuará');
content = content.replace(/administraciÃ³n/g, 'administración');
content = content.replace(/ContraseÃ±a/g, 'Contraseña');
content = content.replace(/contraseÃ±a/g, 'contraseña');
content = content.replace(/InformaciÃ³n/g, 'Información');
content = content.replace(/SesiÃ³n/g, 'Sesión');
content = content.replace(/sesiÃ³n/g, 'sesión');
content = content.replace(/despuÃ©s/g, 'después');
content = content.replace(/DÃ­as/g, 'Días');
content = content.replace(/dÃ­as/g, 'días');
content = content.replace(/realizÃ³/g, 'realizó');
content = content.replace(/crÃ©dito/g, 'crédito');
content = content.replace(/dÃ©bito/g, 'débito');
content = content.replace(/automÃ¡tico/g, 'automático');

// Emojis - usando unicode escape
content = content.replace(/ðŸ"„/g, '\uD83D\uDCC4'); // 📄
content = content.replace(/âœ…/g, '\u2705'); // ✅
content = content.replace(/ðŸ'°/g, '\uD83D\uDCB0'); // 💰
content = content.replace(/âš ï¸/g, '\u26A0\uFE0F'); // ⚠️
content = content.replace(/ðŸŽ‰/g, '\uD83C\uDF89'); // 🎉
content = content.replace(/ðŸ"§/g, '\uD83D\uDD27'); // 🔧
content = content.replace(/ðŸ"/g, '\uD83D\uDD10'); // 🔐
content = content.replace(/ðŸ"‹/g, '\uD83D\uDCCB'); // 📋
content = content.replace(/ðŸ"—/g, '\uD83D\uDD17'); // 🔗
content = content.replace(/â°/g, '\u23F0'); // ⏰

// Guardar
fs.writeFileSync('src/mail/mail.service.ts', content, 'utf8');
console.log('Caracteres corregidos exitosamente!');
