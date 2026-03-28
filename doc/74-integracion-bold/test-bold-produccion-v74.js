// Test de Bold en Producción v74.0
const https = require('https');

const API_URL = 'https://demo-estetica.archivoenlinea.com';

console.log('=================================');
console.log('TEST BOLD EN PRODUCCION v74.0');
console.log('=================================\n');

// Test: Verificar versión del backend
console.log('1. Verificando versión del backend...');
https.get(`${API_URL}/api/health/version`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const version = JSON.parse(data);
      console.log(`   ✅ Versión: ${version.version}`);
      console.log(`   Fecha: ${version.buildDate}\n`);
      
      if (version.version === '74.0.0') {
        console.log('✅ BACKEND v74.0 DESPLEGADO CORRECTAMENTE\n');
      } else {
        console.log(`⚠️  Versión esperada: 74.0.0, encontrada: ${version.version}\n`);
      }
    } catch (e) {
      console.log('   ❌ Error al parsear respuesta:', e.message);
    }
  });
}).on('error', (e) => {
  console.log('   ❌ Error:', e.message);
});

console.log('=================================\n');
