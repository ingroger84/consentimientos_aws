/**
 * Script para probar conexión con Bold usando credenciales de PRODUCCIÓN
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

const BOLD_API_KEY = process.env.BOLD_API_KEY;
const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY;
const BOLD_API_URL = process.env.BOLD_API_URL || 'https://integrations.api.bold.co';

console.log('🔐 Probando conexión con Bold (PRODUCCIÓN)...\n');

console.log('📋 Credenciales configuradas:');
console.log(`   API Key: ${BOLD_API_KEY?.substring(0, 20)}...`);
console.log(`   Secret Key: ${BOLD_SECRET_KEY?.substring(0, 20)}...`);
console.log(`   API URL: ${BOLD_API_URL}\n`);

if (!BOLD_API_KEY || !BOLD_SECRET_KEY) {
  console.error('❌ Error: Credenciales no encontradas en .env');
  console.error('   Verifica que BOLD_API_KEY y BOLD_SECRET_KEY estén configurados\n');
  process.exit(1);
}

async function testBoldConnection() {
  try {
    // Test 1: Verificar autenticación con x-api-key (según documentación Bold)
    console.log('1️⃣  Probando autenticación con x-api-key...');
    
    const response = await axios.get(`${BOLD_API_URL}/online/link/v1/payment_methods`, {
      headers: {
        'Authorization': `x-api-key ${BOLD_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   ✅ Autenticación exitosa!\n');
    
    // Test 2: Mostrar métodos de pago disponibles
    console.log('2️⃣  Métodos de pago disponibles:');
    if (response.data.payload && response.data.payload.payment_methods) {
      const methods = response.data.payload.payment_methods;
      if (Array.isArray(methods)) {
        console.log(`   Total: ${methods.length} métodos`);
        methods.forEach(method => {
          console.log(`   - ${method.name || method.type || 'N/A'}`);
        });
      } else {
        console.log('   Métodos:', JSON.stringify(methods, null, 2));
      }
      console.log('');
    } else {
      console.log('   Respuesta:', JSON.stringify(response.data, null, 2));
      console.log('');
    }

    // Test 3: Crear un link de pago de prueba
    console.log('3️⃣  Creando link de pago de prueba...');
    const testPayload = {
      amount_type: 'CLOSE',
      amount: {
        currency: 'COP',
        total_amount: 10000,
        taxes: [],
        tip_amount: 0,
      },
      reference: `TEST_${Date.now()}`,
      description: 'Prueba de conexión Bold - Producción',
      payer_email: 'test@example.com',
    };

    const createResponse = await axios.post(
      `${BOLD_API_URL}/online/link/v1`,
      testPayload,
      {
        headers: {
          'Authorization': `x-api-key ${BOLD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (createResponse.data.payload && createResponse.data.payload.url) {
      console.log('   ✅ Link de pago creado exitosamente!');
      console.log(`   URL: ${createResponse.data.payload.url}`);
      console.log(`   Payment Link ID: ${createResponse.data.payload.payment_link}\n`);
    } else {
      console.log('   ⚠️  Respuesta inesperada:', JSON.stringify(createResponse.data, null, 2));
      console.log('');
    }

    console.log('🎉 Todas las pruebas pasaron exitosamente!');
    console.log('✅ Bold está configurado correctamente en PRODUCCIÓN');
    console.log('📝 Puedes comenzar a crear links de pago reales\n');

    return true;

  } catch (error) {
    console.error('❌ Error en la prueba de conexión:\n');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensaje: ${error.response.data?.message || error.response.statusText}`);
      console.error(`   Detalles: ${JSON.stringify(error.response.data, null, 2)}\n`);
    } else if (error.request) {
      console.error('   No se recibió respuesta del servidor Bold');
      console.error(`   Error: ${error.message}\n`);
    } else {
      console.error(`   Error: ${error.message}\n`);
    }

    console.error('⚠️  Verifica que las credenciales sean correctas');
    console.error('⚠️  Asegúrate de estar usando credenciales de PRODUCCIÓN\n');

    return false;
  }
}

// Ejecutar prueba
testBoldConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
