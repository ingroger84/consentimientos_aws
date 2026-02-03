// Script para probar el endpoint de settings públicos
// Fecha: 2026-01-25

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testEndpoint(description, url, headers = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${description}`);
  console.log(`URL: ${url}`);
  console.log(`Headers:`, headers);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const response = await axios.get(url, { headers });
    console.log(`✓ SUCCESS - Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`✗ ERROR - ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n🔍 PRUEBAS DE ENDPOINT DE SETTINGS\n');
  
  // Test 1: Health check
  await testEndpoint(
    'Health Check',
    `${API_URL}/api/health`
  );
  
  // Test 2: Settings públicos sin tenant (Super Admin)
  await testEndpoint(
    'Settings Públicos - Super Admin (sin header)',
    `${API_URL}/api/settings/public`
  );
  
  // Test 3: Settings públicos con tenant demo-medico
  await testEndpoint(
    'Settings Públicos - Tenant demo-medico',
    `${API_URL}/api/settings/public`,
    { 'X-Tenant-Slug': 'demo-medico' }
  );
  
  // Test 4: Settings públicos con tenant inexistente
  await testEndpoint(
    'Settings Públicos - Tenant inexistente',
    `${API_URL}/api/settings/public`,
    { 'X-Tenant-Slug': 'tenant-que-no-existe' }
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('PRUEBAS COMPLETADAS');
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);
