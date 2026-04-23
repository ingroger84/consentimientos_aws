const http = require('http');
const fs = require('fs');

console.log('📚 Descargando todos los schemas de DynamiaERP...\n');

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
        
        // Guardar todos los schemas
        if (swagger.components && swagger.components.schemas) {
          fs.writeFileSync('swagger-all-schemas.json', JSON.stringify(swagger.components.schemas, null, 2));
          console.log('✅ Todos los schemas guardados en: swagger-all-schemas.json');
          
          // Buscar schemas específicos importantes
          const importantSchemas = [
            'HttpHeaders',
            'ClienteDocElectronico',
            'DetalleDocumentoElectronico',
            'Totales',
            'FormaPago',
            'PeriodoFacturacion',
            'Respuesta'
          ];
          
          console.log('\n📋 Schemas importantes:\n');
          
          importantSchemas.forEach(schemaName => {
            if (swagger.components.schemas[schemaName]) {
              console.log(`\n🔹 ${schemaName}:`);
              const schema = swagger.components.schemas[schemaName];
              
              if (schema.properties) {
                Object.keys(schema.properties).forEach(prop => {
                  const propDef = schema.properties[prop];
                  const required = schema.required && schema.required.includes(prop) ? '✅ REQUERIDO' : '⚪ Opcional';
                  const type = propDef.type || propDef.$ref || 'object';
                  console.log(`   ${prop}: ${type} - ${required}`);
                });
              } else if (schema.type) {
                console.log(`   Tipo: ${schema.type}`);
              }
            } else {
              console.log(`\n❌ ${schemaName}: No encontrado`);
            }
          });
          
        } else {
          console.log('❌ No se encontraron schemas');
        }
        
      } catch (e) {
        console.error('❌ Error parseando JSON:', e.message);
      }
    } else {
      console.log(`❌ Error: Status ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.end();
