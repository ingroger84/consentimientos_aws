const fs = require('fs');

// Leer el archivo como buffer
const buffer = fs.readFileSync('src/mail/mail.service.ts');
let content = buffer.toString('utf8');

console.log('Buscando y reemplazando emojis mal codificados...\n');

// Buscar el patrón específico y reemplazarlo
const badEmoji = 'ðŸ"„';
const goodEmoji = '&#128196;'; // Código HTML para 📄

if (content.includes(badEmoji)) {
  console.log('✓ Encontrado emoji mal codificado');
  content = content.split(badEmoji).join(goodEmoji);
  console.log('✓ Reemplazado con código HTML');
} else {
  console.log('⚠ No se encontró el emoji mal codificado');
  console.log('Intentando con otros patrones...');
  
  // Intentar con el patrón en bytes
  const pattern1 = String.fromCharCode(0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x9C, 0xE2, 0x80, 0x9D);
  if (content.includes(pattern1)) {
    console.log('✓ Encontrado patrón alternativo 1');
    content = content.split(pattern1).join(goodEmoji);
  }
}

// Guardar el archivo
fs.writeFileSync('src/mail/mail.service.ts', content, 'utf8');
console.log('\n✅ Archivo guardado');
console.log('Reinicia el backend para aplicar los cambios');
