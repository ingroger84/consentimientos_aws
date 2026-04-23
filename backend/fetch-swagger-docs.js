const http = require('http');

console.log('📚 Descargando documentación Swagger de DynamiaERP...\n');

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
    console.log(`Status: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      try {
        const swagger = JSON.parse(body);
        
        // Buscar el endpoint de factura electrónica
        const paths = swagger.paths || {};
        const facturaPath = paths['/api/ventas/facturaElectronica'];
        
        if (facturaPath && facturaPath.post) {
          console.log('✅ Endpoint encontrado: POST /api/ventas/facturaElectronica\n');
          
          const postSpec = facturaPath.post;
          
          console.log('📋 Descripción:', postSpec.summary || postSpec.description || 'N/A');
          console.log('\n🔑 Parámetros:');
          
          if (postSpec.parameters && postSpec.parameters.length > 0) {
            postSpec.parameters.forEach(param => {
              console.log(`   - ${param.name} (${param.in}): ${param.required ? 'REQUERIDO' : 'Opcional'}`);
              if (param.description) {
                console.log(`     ${param.description}`);
              }
            });
          } else {
            console.log('   No hay parámetros de query/path');
          }
          
          console.log('\n📦 Request Body:');
          if (postSpec.requestBody) {
            const content = postSpec.requestBody.content;
            if (content && content['application/json']) {
              const schema = content['application/json'].schema;
              console.log(`   Schema: ${schema.$ref || JSON.stringify(schema, null, 2)}`);
              console.log(`   Requerido: ${postSpec.requestBody.required ? 'SÍ' : 'NO'}`);
            }
          }
          
          console.log('\n📤 Responses:');
          if (postSpec.responses) {
            Object.keys(postSpec.responses).forEach(code => {
              const response = postSpec.responses[code];
              console.log(`   ${code}: ${response.description || 'N/A'}`);
            });
          }
          
          console.log('\n🔐 Security:');
          if (postSpec.security && postSpec.security.length > 0) {
            postSpec.security.forEach(sec => {
              console.log(`   ${JSON.stringify(sec)}`);
            });
          } else {
            console.log('   No especificado');
          }
          
          // Guardar el spec completo
          console.log('\n💾 Guardando especificación completa...');
          const fs = require('fs');
          fs.writeFileSync('swagger-factura-spec.json', JSON.stringify(facturaPath.post, null, 2));
          console.log('   ✅ Guardado en: swagger-factura-spec.json');
          
          // Buscar el schema del request body
          if (postSpec.requestBody && postSpec.requestBody.content && postSpec.requestBody.content['application/json']) {
            const schema = postSpec.requestBody.content['application/json'].schema;
            if (schema.$ref) {
              const schemaName = schema.$ref.split('/').pop();
              console.log(`\n🔍 Buscando schema: ${schemaName}`);
              
              if (swagger.components && swagger.components.schemas && swagger.components.schemas[schemaName]) {
                const schemaObj = swagger.components.schemas[schemaName];
                fs.writeFileSync('swagger-factura-schema.json', JSON.stringify(schemaObj, null, 2));
                console.log(`   ✅ Schema guardado en: swagger-factura-schema.json`);
                
                console.log('\n📋 Propiedades del schema:');
                if (schemaObj.properties) {
                  Object.keys(schemaObj.properties).forEach(prop => {
                    const propDef = schemaObj.properties[prop];
                    const required = schemaObj.required && schemaObj.required.includes(prop) ? '✅ REQUERIDO' : '⚪ Opcional';
                    console.log(`   ${prop}: ${propDef.type || propDef.$ref || 'object'} - ${required}`);
                  });
                }
              }
            }
          }
          
        } else {
          console.log('❌ Endpoint no encontrado en Swagger');
          console.log('\n📋 Endpoints disponibles:');
          Object.keys(paths).forEach(path => {
            console.log(`   ${path}`);
          });
        }
        
      } catch (e) {
        console.error('❌ Error parseando JSON:', e.message);
        console.log('Body:', body.substring(0, 500));
      }
    } else {
      console.log('❌ Error obteniendo Swagger');
      console.log('Body:', body.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.end();
