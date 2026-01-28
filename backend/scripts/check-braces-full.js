const fs = require('fs');

const content = fs.readFileSync('backend/src/tenants/tenants.service.ts', 'utf-8');
const lines = content.split('\n');

let openBraces = 0;
let openParens = 0;
let openBrackets = 0;
let inString = false;
let inTemplate = false;
let stringChar = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let prevBraces = openBraces;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    
    // Detectar strings
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString && !inTemplate) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    // Detectar template strings
    if (char === '`' && prevChar !== '\\') {
      inTemplate = !inTemplate;
    }
    
    // Contar solo si no estamos en un string
    if (!inString && !inTemplate) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
  }
  
  // Reportar líneas donde las llaves cambian significativamente o se vuelven negativas
  if (openBraces < 0 || (prevBraces !== openBraces && Math.abs(prevBraces - openBraces) > 0)) {
    if (openBraces < 0 || openBraces < 2) {
      console.log(`Line ${i + 1}: { ${openBraces} } (was ${prevBraces}) - ${line.trim().substring(0, 80)}`);
    }
  }
}

console.log('\n=== FINAL COUNT ===');
console.log(`Open braces: ${openBraces}`);
console.log(`Open parens: ${openParens}`);
console.log(`Open brackets: ${openBrackets}`);

if (openBraces !== 0 || openParens !== 0 || openBrackets !== 0) {
  console.log('\n❌ UNBALANCED!');
} else {
  console.log('\n✅ BALANCED');
}
