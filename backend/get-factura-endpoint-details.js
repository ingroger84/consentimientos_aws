const http = require('http');
const fs = require('fs');

console.log('📚 Obteniendo detalles del endpoint facturaElectronica...\n');

const options = {
  hostname: 'api.pos.dynamiaerp.co',
  port: 80,
  path: '/v3/api-docs',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const swagger = JSON.parse(body);
        
        const endpoint = swagger.paths['/api/ventas/facturaElectronica'];
        
        if (endpoint && endpoint.post) {
          console.log('✅ POST /api/ventas/facturaElectronica\n');
          
          const post = endpoint.post;
          
          console.log('📋 Detalles completos:\n');
          console.log(JSON.stringify(post, null, 2));
          
          // Guardar
          fs.writeFileSync('factura-endpoint-full.json', JSON.stringify(post, null, 2));
          console.log('\n💾 Guardado en: factura-endpoint-full.json');
          
          // Analizar parámetros
          console.log('\n\n🔍 ANÁLISIS DE PARÁMETROS:\n');
          
          if (post.parameters && post.parameters.length > 0) {
            post.parameters.forEach(param => {
              console.log(`Parámetro: ${param.name}`);
              console.log(`  Ubicación: ${param.in}`);
              console.log(`  Requerido: ${param.required ? 'SÍ' : 'NO'}`);
              console.log(`  Schema: ${JSON.stringify(param.schema, null, 2)}`);
              console.log('');
            });
          }
          
          // Analizar security
          console.log('\n🔐 SEGURIDAD:\n');
          if (post.security) {
            console.log(JSON.stringify(post.security, null, 2));
          } else {
            console.log('No especificada en el endpoint');
          }
          
          // Buscar security global
          if (swagger.security) {
            console.log('\n🔐 SEGURIDAD GLOBAL:\n');
            console.log(JSON.stringify(swagger.security, null, 2));
          }
          
        } else {
          console.log('❌ Endpoint no encontrado');
        }
        
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.end();
